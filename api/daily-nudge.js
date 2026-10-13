// Vercel Node function: /api/daily-nudge   (runs once a day from a Vercel cron job)
// Save as:  api/daily-nudge.js
// Needs env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET (any long random text)
// Add to vercel.json:  "crons": [{ "path": "/api/daily-nudge", "schedule": "0 7 * * *" }]
// (07:00 UTC every day. Vercel sends the CRON_SECRET automatically.)

const URL_ = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';
const TITLE = 'Study tip of the day';

const TIPS = [
  'Test yourself before you re-read. Ten minutes of recall beats an hour of re-reading.',
  'Study in 25-minute blocks with a 5-minute break. Your focus lasts longer.',
  'Do past questions today. They show you how lecturers actually ask.',
  'Explain one topic out loud as if teaching a friend. Gaps show up fast.',
  'Start with your weakest course while your mind is fresh.',
  'Sleep is part of revision. Memory is stored while you rest, so protect tonight.',
  'Make five flashcards from today\'s lecture. Ask the AI Study Assistant to help.',
  'Review yesterday\'s notes for 10 minutes before starting something new.',
  'Take a practice test under timed conditions. CBT speed is a skill too.',
  'Write down three things you will finish today, then do the hardest first.'
];

async function sb(path, opts) {
  opts = opts || {};
  const res = await fetch(URL_ + path, {
    method: opts.method || 'GET',
    headers: Object.assign({ apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, opts.headers || {}),
    body: opts.body == null ? undefined : JSON.stringify(opts.body)
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) throw new Error((data && data.message) || ('Database error ' + res.status));
  return data;
}

module.exports = async function handler(req, res) {
  if (!CRON_SECRET || req.headers.authorization !== 'Bearer ' + CRON_SECRET) {
    res.status(401).json({ error: 'Not allowed.' });
    return;
  }
  if (!URL_ || !KEY) { res.status(500).json({ error: 'Supabase is not set up on the server.' }); return; }

  try {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();

    // Already sent today? Do nothing (safe if the job runs twice).
    const sent = await sb('/rest/v1/notifications?select=id&title=eq.' + encodeURIComponent(TITLE) + '&created_at=gte.' + encodeURIComponent(startOfDay) + '&limit=1');
    if (sent && sent.length) { res.status(200).json({ skipped: true }); return; }

    const dayNumber = Math.floor(now.getTime() / 86400000);
    const tip = TIPS[dayNumber % TIPS.length];
    const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    const profiles = (await sb('/rest/v1/profiles?select=id,exam_date&limit=20000')) || [];
    const rows = profiles.map(function (p) {
      let body = tip;
      const d = p.exam_date ? Date.parse(String(p.exam_date).slice(0, 10) + 'T00:00:00Z') : NaN;
      if (!isNaN(d)) {
        const left = Math.round((d - todayMs) / 86400000);
        if (left === 0) body = 'Your exam is today. Stay calm, read each question twice, and trust your preparation.';
        else if (left > 0 && left <= 60) body = left + (left === 1 ? ' day' : ' days') + ' to your exam. ' + tip;
      }
      return { user_id: p.id, title: TITLE, body: body, type: 'study' };
    });

    for (let i = 0; i < rows.length; i += 500) {
      await sb('/rest/v1/notifications', { method: 'POST', body: rows.slice(i, i + 500) });
    }
    res.status(200).json({ sent: rows.length });
  } catch (e) {
    console.error('daily nudge failed:', e && e.message);
    res.status(500).json({ error: 'Could not send nudges.' });
  }
};
