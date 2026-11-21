// api/pro.js  ->  put this file at  api/pro.js  (project root)
// Prime CBT Pro: upgrade + payment receipt email.
// Uses the same env vars as api/email.js: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, EMAIL_FROM, SITE_URL
//
// POST /api/pro   (header: Authorization: Bearer <student token>)
//   { action: "test_buy", code: "pro_1m" }   test account only, only while Pro is in "test" mode. No real payment.
//   { action: "receipt",  reference: "..." } re-sends / returns the receipt of one of the student's own payments.
// Both answer with the receipt data the splash screen needs. The receipt email is sent once per payment.

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://xuofkjjhupgmrphzgyun.supabase.co').replace(/\/$/, '');
const PUB_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh';
const SVC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SITE = process.env.SITE_URL || 'https://prime-cbt.vercel.app';
const FROM = process.env.EMAIL_FROM || 'PRIME CBT <hello@yourdomain.com>';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const naira = (kobo) => '&#8358;' + (Number(kobo || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });

function svcHeaders(extra) {
  const h = Object.assign({ apikey: SVC_KEY, 'Content-Type': 'application/json' }, extra || {});
  if (SVC_KEY.startsWith('eyJ')) h.Authorization = 'Bearer ' + SVC_KEY;
  return h;
}
const svc = (path, init) => fetch(SUPABASE_URL + '/rest/v1/' + path, Object.assign({}, init, { headers: svcHeaders((init || {}).headers) }));

// Runs a database function AS THE STUDENT (so auth.uid() is the student)
async function rpcAsUser(fn, args, token) {
  const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST',
    headers: { apikey: PUB_KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(args || {})
  });
  if (!r.ok) return null;
  return r.json();
}

/* ---------- the receipt email ---------- */
function receiptHtml(p, name) {
  const test = String(p.reference || '').indexOf('TEST-') === 0;
  const row = (k, v) => `<tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;border-bottom:1px solid #1e293b">${k}</td><td style="padding:10px 0;color:#f1f5f9;font-size:13px;text-align:right;border-bottom:1px solid #1e293b">${v}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#060b1a;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:520px;margin:0 auto;padding:28px 20px">
  <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;overflow:hidden">
    <div style="padding:26px 28px;background:linear-gradient(135deg,#10b981,#2dd4bf)">
      <div style="font-size:12px;letter-spacing:2px;color:#022c22;font-weight:bold">PRIME CBT</div>
      <div style="font-size:22px;color:#022c22;font-weight:bold;margin-top:6px">Payment receipt</div>
      <div style="font-size:13px;color:#064e3b;margin-top:4px">${esc(p.receipt_no)}</div>
    </div>
    <div style="padding:26px 28px">
      <h1 style="color:#f1f5f9;font-size:20px;margin:0 0 8px">Congratulations, ${esc(name)}! &#127881;</h1>
      <p style="color:#cbd5e1;line-height:1.6;margin:0 0 18px">You are now on <b style="color:#34d399">Prime ${esc(p.package_name)}</b>. Your upgrade is active and every benefit of your plan is already unlocked.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 18px">
        ${row('Plan', 'Prime ' + esc(p.package_name))}
        ${row('Duration', esc(p.months) + (Number(p.months) === 1 ? ' month' : ' months'))}
        ${row('Paid on', esc(fmtDate(p.paid_at)) + ', ' + esc(fmtTime(p.paid_at)))}
        ${row('Valid until', esc(fmtDate(p.expires_at)))}
        ${row('Reference', esc(p.reference))}
        ${row('Receipt no.', esc(p.receipt_no))}
        <tr><td style="padding:14px 0 4px;color:#f1f5f9;font-weight:bold;font-size:15px">Amount paid</td><td style="padding:14px 0 4px;color:#34d399;font-weight:bold;font-size:18px;text-align:right">${naira(p.amount_kobo)}</td></tr>
      </table>
      ${test ? '<p style="background:#1e293b;color:#fbbf24;font-size:12px;border-radius:8px;padding:10px 12px;margin:0 0 18px">This was a TEST payment. No money was charged.</p>' : ''}
      <a href="${SITE}/home.html" style="display:inline-block;background:#10b981;color:#052e1b;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">Start using Pro</a>
    </div>
  </div>
  <p style="color:#64748b;font-size:12px;text-align:center;margin-top:18px">Keep this email as your proof of payment. Questions? Reply to this email.</p>
</div></body></html>`;
}

async function sendReceipt(p, to, name) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: 'Congratulations! Your Prime ' + p.package_name + ' receipt (' + p.receipt_no + ')',
      html: receiptHtml(p, name)
    })
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()).slice(0, 200));
}

// Sends the receipt email once per payment. Returns the receipt data either way.
async function receiptFor(reference, user) {
  const rr = await svc('pro_payments?select=*&reference=eq.' + encodeURIComponent(reference) + '&user_id=eq.' + encodeURIComponent(user.id) + '&limit=1');
  const row = rr.ok ? (await rr.json())[0] : null;
  if (!row) return null;
  const pr = await svc('profiles?select=plan_expires_at,full_name&id=eq.' + encodeURIComponent(user.id));
  const prof = pr.ok ? (await pr.json())[0] : null;
  const data = {
    reference: row.reference, receipt_no: row.receipt_no, package_name: row.package_name || 'Pro', months: row.months,
    amount_kobo: row.amount_kobo, paid_at: row.paid_at, expires_at: prof && prof.plan_expires_at
  };
  // claim the email: only one request can win, so the receipt is never sent twice
  const claim = await svc('pro_payments?reference=eq.' + encodeURIComponent(reference) + '&email_sent_at=is.null', {
    method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ email_sent_at: new Date().toISOString() })
  });
  const won = claim.ok ? (await claim.json()) : [];
  let emailed = false;
  if (won.length && user.email) {
    const m = user.user_metadata || {};
    const name = (prof && prof.full_name) || m.full_name || m.name || user.email.split('@')[0];
    try { await sendReceipt(data, user.email, name); emailed = true; }
    catch (e) {
      console.error('receipt email failed', e && e.message);
      await svc('pro_payments?reference=eq.' + encodeURIComponent(reference), { method: 'PATCH', body: JSON.stringify({ email_sent_at: null }) });   // allow a retry
    }
  }
  return Object.assign(data, { emailed: emailed, email: user.email });
}

module.exports = async (req, res) => {
  const send = (status, obj) => res.status(status).json(obj);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return send(405, { error: 'Method not allowed.' });
  if (!SVC_KEY) return send(500, { error: 'Payments are not set up yet.' });
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return send(401, { error: 'Please log in.' });
    const ur = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: PUB_KEY, Authorization: 'Bearer ' + token } });
    if (!ur.ok) return send(401, { error: 'Please log in.' });
    const user = await ur.json();
    if (!user || !user.id) return send(401, { error: 'Please log in.' });

    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (b.action === 'test_buy') {
      const code = String(b.code || '').slice(0, 60);
      const out = await rpcAsUser('pro_test_purchase', { p_code: code }, token);   // the database checks test mode + test account
      if (!out) return send(503, { error: 'Could not start the upgrade. Try again.' });
      if (out.ok === false) {
        const why = { not_allowed: 'This is not available for your account.', no_package: 'That package is not available.', auth: 'Please log in.' }[out.reason] || 'Upgrade failed.';
        return send(out.reason === 'auth' ? 401 : 403, { error: why });
      }
      const rec = await receiptFor(out.reference, user);
      return send(200, { ok: true, receipt: rec || out });
    }

    if (b.action === 'receipt') {
      const rec = await receiptFor(String(b.reference || ''), user);
      if (!rec) return send(404, { error: 'Payment not found.' });
      return send(200, { ok: true, receipt: rec });
    }

    return send(400, { error: 'Unknown action.' });
  } catch (e) {
    console.error(e);
    return send(500, { error: 'Something went wrong. If you were charged, contact support.' });
  }
};
