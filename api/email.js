// api/email.js — PRIME CBT email system (Vercel serverless, CommonJS)
// Actions:
//   POST ?action=ping        (user token)  -> marks activity + sends first-login welcome once
//   GET  ?action=daily       (cron secret) -> morning greeting OR comeback reminder for every user
//   GET  ?action=unsubscribe (signed link) -> opts the user out
//
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
//           EMAIL_FROM, SITE_URL, CRON_SECRET

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SITE = process.env.SITE_URL || 'https://prime-cbt.vercel.app';
const FROM = process.env.EMAIL_FROM || 'PRIME CBT <hello@yourdomain.com>';
const INACTIVE_DAYS = 2; // no activity for this long => reminder instead of greeting

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const REASONS = [
  'Practice with real CBT-style questions so exam hall interface feels familiar, not scary.',
  'Instant scoring and corrections show you exactly what to fix before the real exam.',
  'Your leaderboard rank and achievements keep you motivated to study every day.',
  'Past questions and study materials for your courses are all in one place.',
  'The AI Study Assistant explains hard topics in simple terms, any time you need it.',
  'Just 20 minutes of daily practice beats one all-night cram session.',
  'Download your results as PDF and track your improvement over time.',
];

const sign = (uid) =>
  crypto.createHmac('sha256', process.env.CRON_SECRET).update(uid).digest('hex');

const nameOf = (u) =>
  (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) ||
  (u.email ? u.email.split('@')[0] : 'Champ');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function layout({ title, intro, bullets, cta, ctaUrl, uid }) {
  const unsub = `${SITE}/api/email?action=unsubscribe&u=${uid}&t=${sign(uid)}`;
  const list = bullets && bullets.length
    ? `<ul style="padding-left:18px;margin:16px 0;color:#cbd5e1;line-height:1.6">${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#060b1a;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:520px;margin:0 auto;padding:28px 20px">
  <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:28px">
    <div style="font-size:13px;letter-spacing:2px;color:#34d399;font-weight:bold">PRIME CBT</div>
    <h1 style="color:#f1f5f9;font-size:22px;margin:14px 0 10px">${esc(title)}</h1>
    <p style="color:#cbd5e1;line-height:1.6;margin:0">${intro}</p>
    ${list}
    <a href="${ctaUrl}" style="display:inline-block;margin-top:12px;background:#10b981;color:#052e1b;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">${esc(cta)}</a>
  </div>
  <p style="color:#64748b;font-size:12px;text-align:center;margin-top:18px">
    You get this because you have a PRIME CBT account.
    <a href="${unsub}" style="color:#64748b">Unsubscribe</a>
  </p>
</div></body></html>`;
}

function welcomeMail(u) {
  return {
    subject: `Welcome to PRIME CBT, ${nameOf(u)}!`,
    html: layout({
      uid: u.id,
      title: `Welcome aboard, ${nameOf(u)}!`,
      intro: 'You just joined the smartest way to prepare for your exams. Here is what you can do right now:',
      bullets: [
        'Take timed CBT practice tests for your courses',
        'Get instant results with corrections',
        'Use the AI Study Assistant when you are stuck',
        'Climb the leaderboard and unlock achievements',
      ],
      cta: 'Start your first practice',
      ctaUrl: SITE,
    }),
  };
}

function dailyMail(u, daysAway) {
  const day = Math.floor(Date.now() / 86400000);
  const reason = REASONS[day % REASONS.length];
  const name = nameOf(u);
  if (daysAway >= INACTIVE_DAYS) {
    return {
      subject: `${name}, your exams are not waiting. Come practice!`,
      html: layout({
        uid: u.id,
        title: `We miss you, ${name}`,
        intro: `You have not practised on PRIME CBT for ${daysAway} days. A short session today keeps your momentum alive.<br><br><b style="color:#f1f5f9">Why PRIME CBT?</b> ${esc(reason)}`,
        cta: 'Practice for 10 minutes',
        ctaUrl: SITE,
      }),
    };
  }
  return {
    subject: `Good morning ${name}! Ready to ace it today?`,
    html: layout({
      uid: u.id,
      title: `Good morning, ${name}!`,
      intro: `A new day, a new chance to level up.<br><br><b style="color:#f1f5f9">Why PRIME CBT?</b> ${esc(reason)}`,
      cta: "Start today's practice",
      ctaUrl: SITE,
    }),
  };
}

async function sendBatch(messages) {
  // Resend batch endpoint: max 100 per call
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chunk),
    });
    if (!r.ok) console.error('Resend error', r.status, await r.text());
  }
}

async function listAllUsers() {
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return users;
}

module.exports = async (req, res) => {
  const action = req.query.action;

  try {
    // ---------- Activity ping + first-login welcome ----------
    if (action === 'ping' && req.method === 'POST') {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const { data, error } = await sb.auth.getUser(token);
      if (error || !data.user) return res.status(401).json({ error: 'unauthorized' });
      const u = data.user;

      const { data: pref } = await sb.from('email_prefs').select('*').eq('user_id', u.id).maybeSingle();
      const firstTime = !pref || !pref.welcomed;

      // Mark first (prevents duplicate welcomes from parallel calls)
      await sb.from('email_prefs').upsert(
        { user_id: u.id, welcomed: true, last_seen: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

      if (firstTime && u.email && !(pref && pref.opted_out)) {
        const m = welcomeMail(u);
        await sendBatch([{ from: FROM, to: [u.email], subject: m.subject, html: m.html }]);
      }
      return res.status(200).json({ ok: true, welcomed: firstTime });
    }

    // ---------- Unsubscribe ----------
    if (action === 'unsubscribe') {
      const { u, t } = req.query;
      if (!u || !t || t !== sign(u)) return res.status(400).send('Invalid link');
      await sb.from('email_prefs').upsert({ user_id: u, opted_out: true }, { onConflict: 'user_id' });
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send('<body style="font-family:Arial;text-align:center;padding:60px;background:#060b1a;color:#f1f5f9"><h2>You are unsubscribed</h2><p>You will no longer get daily emails from PRIME CBT.</p></body>');
    }

    // ---------- Daily send (cron) ----------
    if (action === 'daily') {
      if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'unauthorized' });
      }
      const users = await listAllUsers();
      const { data: prefs } = await sb.from('email_prefs').select('user_id, opted_out, last_seen');
      const prefMap = new Map((prefs || []).map((p) => [p.user_id, p]));

      const now = Date.now();
      const messages = [];
      for (const u of users) {
        if (!u.email || !u.email_confirmed_at && !u.confirmed_at) continue;
        const p = prefMap.get(u.id);
        if (p && p.opted_out) continue;
        const lastActive = new Date((p && p.last_seen) || u.last_sign_in_at || u.created_at).getTime();
        const daysAway = Math.floor((now - lastActive) / 86400000);
        const m = dailyMail(u, daysAway);
        messages.push({ from: FROM, to: [u.email], subject: m.subject, html: m.html });
      }
      await sendBatch(messages);
      return res.status(200).json({ ok: true, sent: messages.length });
    }

    return res.status(400).json({ error: 'unknown action' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  }
};
