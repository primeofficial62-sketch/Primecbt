import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "payments_not_configured" }, 503);
  if (!paystackKey) return json({ error: "payments_not_configured" }, 503);

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user?.email) return json({ error: "unauthorized" }, 401);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: profile } = await admin.from("external_exam_profiles")
    .select("premium_activated_at").eq("user_id", user.id).maybeSingle();
  if (profile?.premium_activated_at) return json({ already_active: true, activated_at: profile.premium_activated_at });

  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await admin.from("external_exam_activation_payments")
    .select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= 5) return json({ error: "rate_limited" }, 429);

  const { data: open } = await admin.from("external_exam_activation_payments").select("*")
    .eq("user_id", user.id).in("status", ["initiated", "pending"])
    .gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (open?.authorization_url) {
    return json({ reused: true, reference: open.reference, authorization_url: open.authorization_url, amount_kobo: 300000 });
  }

  const reference = "PEXA_" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
  const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
  const { error: insertError } = await admin.from("external_exam_activation_payments").insert({
    user_id: user.id, reference, amount_kobo: 300000, currency: "NGN",
    status: "initiated", expires_at: expiresAt,
  });
  if (insertError) return json({ error: "could_not_create_activation" }, 409);

  const site = Deno.env.get("SITE_URL") ?? "https://prime-cbt.name.ng";
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${paystackKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email, amount: 300000, currency: "NGN", reference,
      channels: ["card", "bank_transfer", "ussd"],
      callback_url: `${site}/external/more.html?activation_ref=${reference}`,
      metadata: { user_id: user.id, product: "prime-pro-external-exams", app: "prime-cbt" },
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    await admin.from("external_exam_activation_payments")
      .update({ status: "failed", gateway_response: String(payload.message ?? "initialization_failed").slice(0, 200) })
      .eq("reference", reference);
    return json({ error: "gateway_error" }, 502);
  }

  await admin.from("external_exam_activation_payments").update({
    status: "pending",
    gateway_access_code: payload.data.access_code ?? null,
    authorization_url: payload.data.authorization_url,
    raw: { initialized: true },
  }).eq("reference", reference);

  return json({ reference, authorization_url: payload.data.authorization_url, amount_kobo: 300000, expires_at: expiresAt });
});
