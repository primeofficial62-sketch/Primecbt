// Vercel Serverless Function: /api/explain
// Env: SUPABASE_SERVICE_ROLE_KEY (required). GEMINI_API_KEY is optional: Gemini keys are read from the
// api_keys table (same pool as explain-details) and GEMINI_API_KEY is only used as a last fallback.

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xuofkjjhupgmrphzgyun.supabase.co";
const PUB_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh";
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];   // second one has its own free quota
const MAX_ATTEMPTS = 4;

const SYSTEM = `You are a friendly tutor helping university students understand study material.
Explain ONLY what is on the given page. Do not invent content that is not there.
Be clear and practical: start with the main idea in 1-2 sentences, then break down the key points, define technical terms simply, and end with one short "Remember this" line.
Format: short paragraphs, "- " bullets where useful, **bold** for key terms. No headings. Keep it under 300 words.
If the page is mostly a diagram, table or image, describe what it shows and explain it.`;

function svcHeaders(extra = {}) {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const h = { apikey: k, ...extra };
  if (k.startsWith("eyJ")) h.Authorization = "Bearer " + k;
  return h;
}
const rest = (path, init = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: svcHeaders(init.headers || {}) });

// Gemini keys: the shared pool in api_keys (least recently used first), then the env key as a fallback
async function loadKeys() {
  const out = [];
  try {
    const r = await rest("api_keys?select=id,label,key,provider,uses&enabled=eq.true&order=last_used.asc.nullsfirst");
    if (r.ok) for (const k of await r.json()) if ((!k.provider || k.provider === "gemini") && k.key) out.push(k);
  } catch (e) { console.error("api_keys load failed", String(e)); }
  if (process.env.GEMINI_API_KEY) out.push({ id: null, label: "env", key: process.env.GEMINI_API_KEY, uses: 0 });
  return out;
}

// Quota RPCs run as the STUDENT (their token), so auth.uid() is the student
async function rpc(fn, args, token) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: PUB_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(args || {}),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

module.exports = async (req, res) => {
  const send = (status, obj) => res.status(status).json(obj);
  if (req.method !== "POST") return send(405, { error: "Method not allowed." });

  let reserved = false, qkey = "", token = "";
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return send(500, { error: "AI is not configured yet." });
    }

    token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return send(401, { error: "Please log in to use AI explanations." });
    const ur = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: PUB_KEY, Authorization: "Bearer " + token },
    });
    if (!ur.ok) return send(401, { error: "Please log in to use AI explanations." });
    const user = await ur.json();
    if (!user || !user.id) return send(401, { error: "Please log in to use AI explanations." });

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const page = parseInt(b.page, 10);
    const mode = ["explain", "simpler", "example"].includes(b.mode) ? b.mode : "explain";
    const text = String(b.text ?? "").slice(0, 12000);
    const image = String(b.image ?? "");
    const key = String(b.material_key ?? "").slice(0, 500);
    if (!page || !key || (!text && !image)) return send(400, { error: "Nothing to explain on this page." });
    if (image.length > 2500000) return send(400, { error: "This page is too large to read." });

    // 1) Shared cache hit = free, no quota used
    if (mode === "explain") {
      const cr = await rest(
        `page_explanations?select=explanation,file_url&material_key=eq.${encodeURIComponent(key)}&page=eq.${page}&limit=1`
      );
      if (cr.ok) {
        const rows = await cr.json();
        const hit = rows && rows[0];
        if (hit && (hit.file_url ?? null) === (b.file_url ?? null)) {
          const u = await rpc("my_quota_usage", {}, token);
          const limit = u && u.limits && u.limits.ai ? u.limits.ai.limit : null;
          const quota = limit != null ? { limit, remaining: Math.max(0, limit - (u.ai_used || 0)) } : null;
          return send(200, { explanation: hit.explanation, cached: true, quota });
        }
      }
    }

    const keys = await loadKeys();
    if (!keys.length) { console.error("No Gemini keys available"); return send(500, { error: "AI is not configured yet." }); }

    // 2) Reserve one unit (atomic, server-side). One unit per page per day:
    //    "simpler" / "example" on the same page cost nothing extra.
    qkey = `${key}|${page}`;
    const rv = await rpc("reserve_ai_explanation", { p_key: qkey }, token);
    if (!rv) return send(503, { error: "Couldn't check your daily allowance. Please try again." });
    if (rv.ok === false) {
      if (rv.reason === "auth") return send(401, { error: "Please log in to use AI explanations." });
      return send(429, {
        code: "AI_LIMIT", limit: rv.limit, remaining: 0,
        error: "You've used all your free AI explanations for today. Your allowance resets at midnight (Lagos time).",
      });
    }
    reserved = rv.charged === true;   // only the request that paid may release it

    // 3) Ask Gemini
    const extra =
      mode === "simpler"
        ? "Explain it again in much simpler words, as if to a student who struggled to understand the first time."
        : mode === "example"
        ? "Give 1-2 concrete, relatable worked examples that make this page's content easy to understand."
        : "Explain this page in detail.";
    const prompt =
      `Course/material: ${b.title ?? "Unknown"}${b.category ? " (" + b.category + ")" : ""}\nPage ${page}\n\n${extra}` +
      (text ? `\n\nPage text:\n"""\n${text}\n"""` : "\n\nThe page is attached as an image.");
    const parts = [];
    if (image) parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
    parts.push({ text: prompt });

    const reqBody = JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts }],
      generationConfig: { maxOutputTokens: 1200, temperature: 0.5, thinkingConfig: { thinkingBudget: 0 } },
    });
    let explanation = "", usedKey = null, tries = 0;
    outer: for (const model of MODELS) {
      for (const k of keys) {
        if (tries++ >= MAX_ATTEMPTS) break outer;
        try {
          const gr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: "POST",
            headers: { "x-goog-api-key": k.key, "content-type": "application/json" },
            body: reqBody,
            signal: AbortSignal.timeout(15000),
          });
          if (!gr.ok) { console.error("Gemini error", k.label, model, gr.status, (await gr.text()).slice(0, 300)); continue; }
          const data = await gr.json();
          const t = ((data.candidates?.[0]?.content?.parts) || []).map((p) => p.text || "").join("").trim();
          if (t) { explanation = t; usedKey = k; break outer; }
          console.error("Gemini empty answer", k.label, model, data.promptFeedback || data.candidates?.[0]?.finishReason || "");
        } catch (e) { console.error("Gemini request failed", k.label, model, String(e && e.name)); }
      }
    }
    if (!explanation) {
      if (reserved) { await rpc("finish_ai_explanation", { p_key: qkey, p_success: false }, token); reserved = false; }
      return send(502, { error: "The AI is busy right now. You were not charged. Try again shortly." });
    }
    if (usedKey && usedKey.id) {
      rest(`api_keys?id=eq.${usedKey.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ last_used: new Date().toISOString(), uses: (usedKey.uses || 0) + 1, last_error: null }),
      }).catch(() => {});
    }

    // 4) Confirm the charge + save shared cache
    if (reserved) { await rpc("finish_ai_explanation", { p_key: qkey, p_success: true }, token); reserved = false; }
    if (mode === "explain") {
      await rest("page_explanations?on_conflict=material_key,page", {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ material_key: key, page, file_url: b.file_url ?? null, explanation }),
      });
    }
    return send(200, { explanation, quota: { limit: rv.limit, remaining: rv.remaining } });
  } catch (e) {
    console.error(e);
    if (reserved && qkey && token) await rpc("finish_ai_explanation", { p_key: qkey, p_success: false }, token);
    return send(500, { error: "Something went wrong. You were not charged. Try again." });
  }
};
