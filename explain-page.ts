// Vercel Serverless Function: /api/explain  (Gemini version, no extra packages needed)
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   GEMINI_API_KEY             your NEW Google AI Studio key
//   SUPABASE_SERVICE_ROLE_KEY  Supabase > Project Settings > API (secret / service_role key)
//   SUPABASE_URL               optional, defaults to your project URL below

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xuofkjjhupgmrphzgyun.supabase.co";
const MODEL = "gemini-2.5-flash"; // change here if Google renames/retires it
const DAILY_LIMIT = 40;

const SYSTEM = `You are a friendly tutor helping university students understand study material.
Explain ONLY what is on the given page. Do not invent content that is not there.
Be clear and practical: start with the main idea in 1-2 sentences, then break down the key points, define technical terms simply, and end with one short "Remember this" line.
Format: short paragraphs, "- " bullets where useful, **bold** for key terms. No headings. Keep it under 300 words.
If the page is mostly a diagram, table or image, describe what it shows and explain it.`;

function svcHeaders(extra = {}) {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const h = { apikey: k, ...extra };
  if (k.startsWith("eyJ")) h.Authorization = "Bearer " + k; // legacy JWT-style key
  return h;
}
const rest = (path, init = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: svcHeaders(init.headers || {}) });

module.exports = async (req, res) => {
  const send = (status, obj) => res.status(status).json(obj);
  if (req.method !== "POST") return send(405, { error: "Method not allowed." });

  try {
    if (!process.env.GEMINI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing GEMINI_API_KEY or SUPABASE_SERVICE_ROLE_KEY");
      return send(500, { error: "AI is not configured yet." });
    }

    // 0) Must be a logged-in user
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return send(401, { error: "Please log in to use AI explanations." });
    const ur = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + token },
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

    // 1) Shared cache: first student pays, everyone after gets it free
    if (mode === "explain") {
      const cr = await rest(
        `page_explanations?select=explanation,file_url&material_key=eq.${encodeURIComponent(key)}&page=eq.${page}&limit=1`
      );
      if (cr.ok) {
        const rows = await cr.json();
        const hit = rows && rows[0];
        if (hit && (hit.file_url ?? null) === (b.file_url ?? null)) {
          return send(200, { explanation: hit.explanation, cached: true });
        }
      }
    }

    // 2) Per-user daily limit
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const lr = await rest(
      `explain_usage?select=id&user_id=eq.${user.id}&created_at=gte.${encodeURIComponent(since)}`,
      { method: "HEAD", headers: { Prefer: "count=exact" } }
    );
    const range = lr.headers.get("content-range") || "";
    const used = parseInt(range.split("/")[1], 10) || 0;
    if (used >= DAILY_LIMIT) return send(429, { error: "Daily AI explanation limit reached. Try again tomorrow." });

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

    const gr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.5, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    if (!gr.ok) {
      console.error("Gemini error", gr.status, await gr.text());
      return send(502, { error: "The AI is busy right now. Try again shortly." });
    }
    const data = await gr.json();
    const explanation = ((data.candidates?.[0]?.content?.parts) || []).map((p) => p.text || "").join("").trim();
    if (!explanation) return send(502, { error: "No explanation was returned." });

    // 4) Save usage + shared cache
    await rest("explain_usage", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ user_id: user.id }),
    });
    if (mode === "explain") {
      await rest("page_explanations?on_conflict=material_key,page", {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ material_key: key, page, file_url: b.file_url ?? null, explanation }),
      });
    }
    return send(200, { explanation });
  } catch (e) {
    console.error(e);
    return send(500, { error: "Something went wrong. Try again." });
  }
};
