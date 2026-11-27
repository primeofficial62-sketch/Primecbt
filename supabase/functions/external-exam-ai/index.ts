import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Please sign in to use PRIME AI." }, 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const [userRes, keysRes] = await Promise.all([
      admin.auth.getUser(token),
      admin.from("api_keys").select("id,label,key,provider,exhausted_until,uses,last_used").eq("enabled", true)
    ]);
    if (!userRes.data?.user) return json({ error: "Your session has expired. Please sign in again." }, 401);
    const body = await req.json();
    const prompt = String(body?.message ?? "").trim().slice(0, 2500);
    const history = Array.isArray(body?.history) ? body.history.slice(-8).map((m: any) => ({ role: m?.role === "model" ? "model" : "user", parts: [{ text: String(m?.text ?? "").slice(0, 1800) }] })) : [];
    if (!prompt) return json({ error: "Write a question first." }, 400);
    const keys = (keysRes.data || []).filter((k: any) => (!k.provider || k.provider === "gemini") && k.key && (!k.exhausted_until || new Date(k.exhausted_until).getTime() <= Date.now())).sort((a: any,b: any) => new Date(a.last_used || 0).getTime() - new Date(b.last_used || 0).getTime());
    if (!keys.length) return json({ error: keysRes.error ? "PRIME AI could not access the configured AI providers." : "PRIME AI is not configured yet. Please contact support." }, 503);
    const exam = String(body?.exam ?? "JAMB, WAEC and NECO").slice(0, 80);
    const subject = String(body?.subject ?? "General study").slice(0, 80);
    const system = "You are PRIME AI, a patient Nigerian external-examinations study tutor inside PRIME-CBT. Help students prepare for JAMB, WAEC, NECO, GCE and Post-UTME. Explain concepts step by step in clear language; use worked examples and calculations where useful; create original practice questions only when asked. Never claim a response is an official past question or official syllabus fact unless the user supplies a source. If unsure, say so. Do not help cheat during a live examination. Keep answers structured and focused. Exam context: " + exam + ". Subject context: " + subject + ".";
    let lastError = "PRIME AI is temporarily unavailable.";
    for (const key of keys.slice(0, 4)) {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key.key },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [...history, { role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 1200 } })
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok) {
        const answer = payload?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("").trim();
        if (!answer) { lastError = "PRIME AI returned an empty response. Please try again."; continue; }
        await admin.from("api_keys").update({ uses: Number(key.uses || 0) + 1, last_used: new Date().toISOString(), last_error: null }).eq("id", key.id);
        return json({ answer });
      }
      lastError = String(payload?.error?.message || "PRIME AI could not answer right now.").slice(0, 220);
      await admin.from("api_keys").update({ last_error: response.status + " " + lastError }).eq("id", key.id);
      if (response.status === 429) continue;
    }
    return json({ error: lastError }, 502);
  } catch (_error) {
    return json({ error: "PRIME AI is temporarily unavailable. Please try again." }, 500);
  }
});