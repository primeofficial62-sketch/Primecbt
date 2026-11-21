import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "x-quota-limit, x-quota-remaining",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const GEMINI = "https://generativelanguage.googleapis.com/v1beta";
const PUB_KEY = "sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh";
const MAX_ATTEMPTS = 6;
// Fastest model first (the lite model does not "think" before answering), then the normal Flash.
const MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"];

// Instance-local: skip a key/model pair that just hit its limit, without touching the shared api_keys table.
const cooldown = new Map<string, number>();

async function discoverModels(key: string): Promise<string[]> {
  try {
    const r = await fetch(`${GEMINI}/models?pageSize=200`, { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return [];
    const j = await r.json();
    const ver = (n: string) => parseFloat(n.match(/^gemini-([\d.]+)/)![1]);
    return (j.models || [])
      .filter((m: any) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m: any) => String(m.name).replace(/^models\//, ""))
      .filter((n: string) => /^gemini-[\d.]+-flash(-lite)?$/.test(n))
      .sort((a: string, b: string) => ver(b) - ver(a) || (b.endsWith("-lite") ? 1 : 0) - (a.endsWith("-lite") ? 1 : 0))
      .slice(0, 3);
  } catch (_) { return []; }
}

// Opens a streaming connection to Gemini, rotating keys/models until one accepts.
async function openStream(keys: any[], models: string[], parts: any[], admin: any, attempts: any[]) {
  const dead = new Set<string>();
  for (const model of models) {
    for (const k of keys) {
      if (attempts.length >= MAX_ATTEMPTS) return null;
      if (dead.has(model)) break;
      const cd = `${k.id}|${model}`;
      if ((cooldown.get(cd) || 0) > Date.now()) continue;

      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 12_000);   // max wait for the first bytes
      let r: Response;
      try {
        r = await fetch(`${GEMINI}/models/${model}:streamGenerateContent?alt=sse`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": k.key },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
          }),
          signal: ac.signal,
        });
      } catch (e) {
        clearTimeout(timer);
        attempts.push({ key: k.label, model, status: "net:" + String((e as Error).name) });
        continue;
      }
      clearTimeout(timer);
      attempts.push({ key: k.label, model, status: r.status });

      if (r.status === 404) { dead.add(model); await r.text(); break; }
      if (r.status === 429) { cooldown.set(cd, Date.now() + 5 * 60_000); await r.text(); continue; }
      if (r.status === 400 || r.status === 401 || r.status === 403) {
        const t = (await r.text()).slice(0, 300);
        if (/api key|API_KEY|permission|denied/i.test(t)) {
          cooldown.set(cd, Date.now() + 60 * 60_000);
          await admin.from("api_keys").update({ last_error: `${r.status} ${t}`.slice(0, 300) }).eq("id", k.id);
        } else console.log("explain-details 400:", t);
        continue;
      }
      if (!r.ok || !r.body) { await r.text(); continue; }
      return { res: r, key: k, model };
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  let reserved = false;
  let userClient: any = null;
  let qkey = "";
  // Confirm (ok=true) or refund (ok=false) the unit reserved for this request. Safe to call more than once.
  const settle = async (ok: boolean) => {
    if (!reserved || !userClient) return;
    reserved = false;
    try { await userClient.rpc("finish_ai_explanation", { p_key: qkey, p_success: ok }); } catch (_) { /* best-effort */ }
  };

  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");

    const body = await req.json();
    const material_key = String(body.material_key || "").slice(0, 300);
    const page = Number(body.page) || 1;
    const text = String(body.text || "").slice(0, 14000);
    const image = typeof body.image === "string" ? body.image.replace(/^data:image\/\w+;base64,/, "") : "";
    const base = String(body.base_explanation || "").slice(0, 6000);
    const course = String(body.course || "").slice(0, 200);
    const regenerate = !!body.regenerate;

    if (!material_key || (!text.trim() && !image)) return json({ error: "This page has no readable content." }, 400);

    // Run the three lookups at the same time instead of one after another
    const [userRes, cachedRes, keysRes] = await Promise.all([
      admin.auth.getUser(token),
      material_key && !regenerate
        ? admin.from("page_details").select("content").eq("material_key", material_key).eq("page", page).maybeSingle()
        : Promise.resolve({ data: null }),
      admin.from("api_keys").select("id,label,key,provider,exhausted_until,uses,last_used").eq("enabled", true),
    ]);

    const user = userRes.data?.user;
    if (!user) return json({ error: "Please sign in to use More details." }, 401);

    // Already written for this page: instant and free (no allowance used)
    const cached = (cachedRes as any).data?.content;
    if (cached) return json({ answer: cached, cached: true });

    const nowMs = Date.now();
    const keys = ((keysRes as any).data || [])
      .filter((k: any) => !k.provider || k.provider === "gemini")
      .sort((a: any, b: any) => {
        const ea = a.exhausted_until && new Date(a.exhausted_until).getTime() > nowMs ? 1 : 0;
        const eb = b.exhausted_until && new Date(b.exhausted_until).getTime() > nowMs ? 1 : 0;
        return ea - eb || (new Date(a.last_used || 0).getTime() - new Date(b.last_used || 0).getTime());
      });
    if (!keys.length) return json({ error: "The AI is not configured yet. Please contact support." }, 503);

    // Daily AI allowance (shared with /api/explain). One unit per page per day,
    // so "More details" on a page the student already paid for today costs nothing extra.
    userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY") || PUB_KEY, {
      global: { headers: { Authorization: "Bearer " + token } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    qkey = `${material_key}|${page}`;
    const { data: rv, error: rvErr } = await userClient.rpc("reserve_ai_explanation", { p_key: qkey });
    if (rvErr || !rv) return json({ error: "Couldn't check your daily allowance. Please try again." }, 503);
    if (rv.ok === false) {
      if (rv.reason === "auth") return json({ error: "Please sign in to use More details." }, 401);
      return json({
        code: "AI_LIMIT", limit: rv.limit, remaining: 0,
        error: "You've used all your free AI explanations for today. Your allowance resets at midnight (Lagos time).",
      }, 429);
    }
    reserved = rv.charged === true;   // only the request that paid may refund it

    const prompt = `You are an expert, patient university tutor${course ? ` teaching "${course}"` : ""}.
A student is reading page ${page} of a study material and tapped "More details". They already saw a short explanation. Give a clear, in-depth explanation of this page, about 600-800 words, tightly written.

Use markdown with these sections:
## Overview
What the page covers and why it matters.
## Concept-by-concept breakdown
Go through every idea, term, definition, formula, table or diagram on the page one by one: define it, explain the reasoning, connect it to the others.
## Worked examples
Clear examples (Nigerian / real-life context where it fits). Show every step of any calculation.
## Common mistakes & exam tips
What students get wrong and what examiners ask.
## Quick recap
5-8 bullet points.

FORMATTING RULES (strict):
- Write in GitHub-flavored Markdown only.
- Whenever you present a classification, comparison, set of attributes, or any grouped facts, use a real Markdown table: a header row, then a separator row such as | --- | --- |, then one row per item. Every row must be on its own line and start and end with a pipe. Leave a blank line before and after each table.
- Never draw ASCII diagrams, tree charts, flow arrows or box-drawing characters (like ├ └ │ ─ ▼). Use a table or a nested bullet list instead.
- Never wrap normal text or tables in code fences. Use code fences only for real program code, and there is none here.
- Use **bold** for key terms and *italics* for scientific names. Put the closing asterisks directly after the word, with no stray spaces.

Other rules: stay faithful to the page, never contradict it, no padding. Write maths as LaTeX: $...$ inline, $$...$$ display. Simple, clear English.
${base ? `\nSHORT EXPLANATION ALREADY SHOWN (go much deeper, do not repeat it):\n${base}\n` : ""}
${text.trim() ? `PAGE ${page} TEXT:\n"""\n${text}\n"""` : "The page text could not be extracted; read the attached page image instead."}`;

    const parts: any[] = [{ text: prompt }];
    if (image) parts.push({ inline_data: { mime_type: "image/jpeg", data: image } });

    const attempts: any[] = [];
    let up = await openStream(keys, MODELS, parts, admin, attempts);
    if (!up && attempts.length && attempts.every((a) => a.status === 404)) {
      const found = await discoverModels(keys[0].key);   // both aliases gone: ask Google what exists
      if (found.length) up = await openStream(keys, found, parts, admin, attempts);
    }
    console.log("explain-details attempts:", JSON.stringify(attempts));

    if (!up) {
      await settle(false);   // the AI never answered: give the unit back
      const allLimited = attempts.length > 0 && attempts.every((a) => a.status === 429);
      return json({
        error: allLimited
          ? "The AI has reached its limit for now. Please try again in a few minutes (daily limits reset at 9:00 AM)."
          : "The AI is unavailable right now. You were not charged. Please try again shortly.",
      }, 503);
    }

    // Pass the text to the phone as it is written, so the first words appear within a couple of seconds
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        let buf = "", answer = "", finish = "";
        const handle = (line: string) => {
          line = line.trim();
          if (!line.startsWith("data:")) return;
          const p = line.slice(5).trim();
          if (!p || p === "[DONE]") return;
          try {
            const j = JSON.parse(p);
            const c = j?.candidates?.[0];
            const t = (c?.content?.parts || []).map((x: any) => x.text || "").join("");
            if (c?.finishReason) finish = c.finishReason;
            if (t) { answer += t; controller.enqueue(enc.encode(t)); }
          } catch (_) { /* ignore a broken line */ }
        };
        try {
          const reader = up!.res.body!.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let i: number;
            while ((i = buf.indexOf("\n")) >= 0) { handle(buf.slice(0, i)); buf = buf.slice(i + 1); }
          }
          if (buf) handle(buf);
        } catch (e) {
          console.log("explain-details stream error:", String((e as Error).message || e));
        }
        try {
          if (answer.trim()) {
            await settle(true);   // delivered: confirm the charge
            if (material_key && finish === "STOP") await admin.from("page_details").upsert({ material_key, page, content: answer });
            await admin.from("explain_usage").insert({ user_id: user.id });
            await admin.from("api_keys").update({ last_used: new Date().toISOString(), uses: (up!.key.uses || 0) + 1, last_error: null }).eq("id", up!.key.id);
          } else {
            await settle(false);  // nothing came back: refund
          }
        } catch (_) { /* saving is best-effort */ }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...cors,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        "X-Quota-Limit": String(rv.limit ?? ""),
        "X-Quota-Remaining": String(rv.remaining ?? ""),
      },
    });
  } catch (e) {
    console.log("explain-details crash:", String((e as Error).message || e));
    await settle(false);
    return json({ error: "Something went wrong. You were not charged. Please try again." }, 500);
  }
});
