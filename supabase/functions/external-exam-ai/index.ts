import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "PRIME AI is deployed, but its GEMINI_API_KEY secret has not been configured yet." }), { status: 503, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const body = await req.json();
    const prompt = String(body?.message ?? "").trim().slice(0, 2500);
    const history = Array.isArray(body?.history) ? body.history.slice(-8).map((m: any) => ({ role: m?.role === "model" ? "model" : "user", parts: [{ text: String(m?.text ?? "").slice(0, 1800) }] })) : [];
    if (!prompt) return new Response(JSON.stringify({ error: "Write a question first." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    const exam = String(body?.exam ?? "external examinations").slice(0, 40);
    const subject = String(body?.subject ?? "general study").slice(0, 80);
    const systemInstruction = "You are PRIME AI, a patient Nigerian external-examinations study tutor inside PRIME-CBT. Help students prepare for JAMB, WAEC, NECO, GCE and Post-UTME. Explain concepts step by step in clear language; use worked examples and calculations where useful; create original practice questions only when asked. Never claim a response is an official past question or official syllabus fact unless the user supplies a source. If unsure, say so. Do not help cheat during a live examination. Keep answers structured and focused. Current exam context: " + exam + ". Subject context: " + subject + ".";
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: systemInstruction }] }, contents: [...history, { role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 1200 } }) });
    const payload = await response.json();
    if (!response.ok) return new Response(JSON.stringify({ error: payload?.error?.message ?? "PRIME AI could not answer right now." }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    const answer = payload?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("").trim();
    if (!answer) return new Response(JSON.stringify({ error: "PRIME AI returned an empty response. Please try again." }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ answer }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "PRIME AI is temporarily unavailable. Please try again." }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});