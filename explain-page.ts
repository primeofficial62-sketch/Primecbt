// Supabase Edge Function: explain-page  (Gemini version)
// Secret needed: GEMINI_API_KEY  (set in Supabase > Edge Functions > Secrets)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = "gemini-2.5-flash"; // change here if Google renames/retires it
const DAILY_LIMIT = 40;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (o: unknown, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const SYSTEM = `You are a friendly tutor helping university students understand study material.
Explain ONLY what is on the given page. Do not invent content that is not there.
Be clear and practical: start with the main idea in 1-2 sentences, then break down the key points, define technical terms simply, and end with one short "Remember this" line.
Format: short paragraphs, "- " bullets where useful, **bold** for key terms. No headings. Keep it under 300 words.
If the page is mostly a diagram, table or image, describe what it shows and explain it.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Must be a logged-in user
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: "Please log in to use AI explanations." }, 401);

    const b = await req.json();
    const page = parseInt(b.page, 10);
    const mode = ["explain", "simpler", "example"].includes(b.mode) ? b.mode : "explain";
    const text = String(b.text ?? "").slice(0, 12000);
    const image = String(b.image ?? "");
    const key = String(b.material_key ?? "").slice(0, 500);
    if (!page || !key || (!text && !image)) return json({ error: "Nothing to explain on this page." }, 400);
    if (image.length > 2_500_000) return json({ error: "This page is too large to read." }, 400);

    // 1) Shared cache: the first student pays, everyone after gets it free
    if (mode === "explain") {
      const { data: hit } = await admin.from("page_explanations")
        .select("explanation,file_url").eq("material_key", key).eq("page", page).maybeSingle();
      if (hit && hit.file_url === (b.file_url ?? null)) return json({ explanation: hit.explanation, cached: true });
    }

    // 2) Per-user daily limit
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count } = await admin.from("explain_usage")
      .select("id", { count: "exact", head: true }).eq("user_id", u.user.id).gte("created_at", since);
    if ((count ?? 0) >= DAILY_LIMIT) return json({ error: "Daily AI explanation limit reached. Try again tomorrow." }, 429);

    // 3) Ask Gemini
    const extra = mode === "simpler"
      ? "Explain it again in much simpler words, as if to a student who struggled to understand the first time."
      : mode === "example"
      ? "Give 1-2 concrete, relatable worked examples that make this page's content easy to understand."
      : "Explain this page in detail.";
    const prompt = `Course/material: ${b.title ?? "Unknown"}${b.category ? " (" + b.category + ")" : ""}\nPage ${page}\n\n${extra}` +
      (text ? `\n\nPage text:\n"""\n${text}\n"""` : "\n\nThe page is attached as an image.");

    const parts: unknown[] = [];
    if (image) parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
    parts.push({ text: prompt });

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": Deno.env.get("GEMINI_API_KEY")!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          maxOutputTokens: 1200,
          temperature: 0.5,
          thinkingConfig: { thinkingBudget: 0 }, // keeps the full budget for the answer
        },
      }),
    });
    if (!r.ok) {
      console.error("Gemini error", r.status, await r.text());
      return json({ error: "The AI is busy right now. Try again shortly." }, 502);
    }
    const data = await r.json();
    const explanation = (data.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? "").join("").trim();
    if (!explanation) return json({ error: "No explanation was returned." }, 502);

    await admin.from("explain_usage").insert({ user_id: u.user.id });
    if (mode === "explain") {
      await admin.from("page_explanations").upsert({
        material_key: key, page, file_url: b.file_url ?? null, explanation,
      });
    }
    return json({ explanation });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong. Try again." }, 500);
  }
});
