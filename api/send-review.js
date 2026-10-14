const SUPABASE_URL = 'https://xuofkjjhupgmrphzgyun.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh';
const OWNER_EMAIL = 'imodumicheal519@gmail.com';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Only logged-in users can send
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Not logged in' });
    const ur = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + token }
    });
    if (!ur.ok) return res.status(401).json({ error: 'Invalid session' });
    const user = await ur.json();

    const { rating, category, message } = req.body || {};
    const cat = ['review', 'bug', 'suggestion'].includes(category) ? category : 'review';
    const msg = String(message || '').trim().slice(0, 1000);
    if (msg.length < 5) return res.status(400).json({ error: 'Message too short' });

    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email;
    const stars = rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : 'No rating';

    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'PRIME-CBT', email: process.env.SENDER_EMAIL },
        to: [{ email: OWNER_EMAIL }],
        replyTo: { email: user.email, name },
        subject: `[PRIME-CBT] New ${cat} from ${name} (${stars})`,
        htmlContent:
          `<h3>New ${esc(cat)}</h3>` +
          `<p><b>From:</b> ${esc(name)} (${esc(user.email)})</p>` +
          `<p><b>Rating:</b> ${stars}</p>` +
          `<p style="white-space:pre-wrap">${esc(msg)}</p>`
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'Email failed', detail: await r.text() });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
};
