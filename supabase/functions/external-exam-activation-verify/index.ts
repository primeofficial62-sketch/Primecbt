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
  if (!url || !anonKey || !serviceKey || !paystackKey) return json({ error: "payments_not_configured" }, 503);

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const body = await req.json().catch(() => ({}));
  const reference = body?.reference;
  if (typeof reference !== "string" || !/^PEXA_[A-Za-z0-9]{10,40}$/.test(reference)) return json({ error: "bad_reference" }, 400);

  const { data: payment } = await admin.from("external_exam_activation_payments").select("*")
    .eq("reference", reference).eq("user_id", user.id).maybeSingle();
  if (!payment) return json({ error: "not_found" }, 404);
  if (payment.status === "success") return json({ status: "success", activated: true, reference });
  if (payment.status !== "pending" && payment.status !== "initiated") return json({ status: payment.status, activated: false });

  const response = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference), {
    headers: { Authorization: `Bearer ${paystackKey}` },
  });
  const payload = await response.json().catch(() => ({}));
  const data = payload?.data;
  if (!response.ok || !payload.status || !data) return json({ status: "pending", activated: false });

  if (data.status === "success") {
    if (data.reference !== reference || Number(data.amount) !== 300000 || data.currency !== "NGN") {
      await admin.from("external_exam_activation_payments").update({
        status: "failed", gateway_response: "Paystack verification amount, currency or reference mismatch",
      }).eq("reference", reference).eq("user_id", user.id);
      return json({ error: "payment_mismatch", activated: false }, 409);
    }
    const { data: finalized, error } = await admin.rpc("finalize_external_exam_activation", {
      p_reference: reference,
      p_amount_kobo: Number(data.amount),
      p_currency: data.currency,
      p_channel: data.channel ?? null,
      p_gateway_response: data.gateway_response ?? null,
      p_raw: { verify: data },
    });
    if (error || !finalized?.ok) return json({ error: "activation_finalize_failed", activated: false }, 500);
    return json({ status: "success", activated: true, reference });
  }

  if (data.status === "failed" || data.status === "abandoned") {
    await admin.from("external_exam_activation_payments")
      .update({ status: data.status, gateway_response: String(data.gateway_response ?? data.status).slice(0, 200) })
      .eq("reference", reference).eq("user_id", user.id);
    return json({ status: data.status, activated: false });
  }
  return json({ status: "pending", activated: false });
});
