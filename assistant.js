// Vercel Edge Function: /api/assistant  (the AI Study Assistant backend)
// - Verifies the student is signed in
// - Reads the student's REAL data from Supabase on the server (can't be faked from the browser)
// - Streams the Groq model's reply back to the page
//
// Environment variables (Vercel -> Project -> Settings -> Environment Variables):
//   GROQ_API_KEY   required, from https://console.groq.com
//   GROQ_MODEL     optional, defaults to llama-3.3-70b-versatile

export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xuofkjjhupgmrphzgyun.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const dayMs = (s) => Date.parse(`${s}T00:00:00Z`);

// ---------- Supabase helpers (use the student's own token, so RLS applies) ----------
async function countRows(path, token) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'HEAD',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, Prefer: 'count=exact' },
  });
  if (!r.ok) throw new Error(`count ${r.status}`);
  const m = (r.headers.get('content-range') || '').match(/\/(\d+)$/);
  return m ? Number(m[1]) : 0;
}

async function getRows(path, token) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`rows ${r.status}`);
  return r.json();
}

async function studentData(user, token, today) {
  const meta = user.user_metadata || {};
  const lines = [
    `Today is ${new Date(dayMs(today)).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    })} (${today}).`,
  ];

  const name = meta.full_name || meta.name;
  if (name) lines.push(`Student name: ${name}`);

  if (typeof meta.exam_date === 'string' && DATE_RE.test(meta.exam_date)) {
    const left = Math.round((dayMs(meta.exam_date) - dayMs(today)) / 86400000);
    lines.push(`Exam date: ${meta.exam_date} (${left >= 0 ? plural(left, 'day') + ' away' : 'already passed'})`);
  } else {
    lines.push('Exam date: not set yet.');
  }

  const p = meta.study_plan;
  if (p && typeof p === 'object') {
    const bits = [];
    if (p.target_score) bits.push(`target score ${p.target_score}`);
    if (p.daily_time) bits.push(`${p.daily_time} per study day`);
    if (Array.isArray(p.days) && p.days.length) bits.push(`study days: ${p.days.join(', ')}`);
    lines.push(`Study plan: ${bits.join('; ') || 'created'}`);
  } else {
    lines.push('Study plan: not created yet.');
  }

  try {
    const base = `study_tasks?select=id&user_id=eq.${user.id}`;
    const [done, upcoming, overdue, next] = await Promise.all([
      countRows(`${base}&is_done=eq.true`, token),
      countRows(`${base}&is_done=eq.false&due_date=gte.${today}`, token),
      countRows(`${base}&is_done=eq.false&due_date=lt.${today}`, token),
      getRows(`study_tasks?select=due_date,title&user_id=eq.${user.id}&is_done=eq.false&due_date=gte.${today}&order=due_date.asc&limit=5`, token),
    ]);
    lines.push(`Study sessions: ${done} completed, ${upcoming} upcoming, ${overdue} overdue (not done and past due).`);
    if (next.length) lines.push(`Next sessions: ${next.map((t) => `${t.due_date} - ${t.title}`).join('; ')}`);
  } catch (err) {
    console.error('study_tasks lookup failed:', err);
    lines.push('Study sessions: could not be loaded right now.');
  }

  lines.push('Quiz scores and topic-level performance are NOT available to you.');
  return lines.join('\n');
}

const SYSTEM_PROMPT = (data) => `You are the AI Study Assistant inside PRIME-CBT, a computer-based test (CBT) exam-preparation app.

What you do: explain concepts clearly, write practice questions, and give study advice.

Rules:
- Be accurate. If you are not sure about something, say so instead of guessing.
- The ONLY facts you know about this student are in STUDENT DATA below. Never invent their scores, accuracy, weak topics, or progress. If they ask about performance and no results are listed, say you don't have their quiz results, then offer to quiz them to find gaps or ask which topics feel hardest.
- When asked what to study next, base the advice on STUDENT DATA (exam date, study plan, sessions) and be honest about what you can't see. Overdue sessions and a close exam date should raise the urgency of your advice.
- For practice questions: give 4 options (A-D), do not reveal the answer until the student replies, then say whether they were right and explain why.
- Keep answers concise and easy to read on a phone: short paragraphs and short lists. Do not use LaTeX; write maths in plain text (e.g. x^2, 3/4).
- Reply in the language the student writes in.

STUDENT DATA (live from their account):
${data}`;

// ====================================================================
//  AI ASSISTANT (server side: auth, student data, Groq stream)
// ====================================================================
export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return json({ error: 'The assistant is not set up yet (missing GROQ_API_KEY on the server).' }, 500);

  // 1. Who is asking? Only signed-in students.
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Please sign in to use the assistant.' }, 401);

  let user;
  try {
    const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
    });
    if (!who.ok) return json({ error: 'Your session has expired. Please sign in again.' }, 401);
    user = await who.json();
  } catch {
    return json({ error: "Couldn't verify your session. Please try again." }, 502);
  }

  // 2. Validate the request
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return json({ error: 'Send a message first.' }, 400);
  }

  // The student's local date comes from their device; everything else is read from the database
  const today = typeof body.today === 'string' && DATE_RE.test(body.today) ? body.today : new Date().toISOString().slice(0, 10);
  const data = await studentData(user, token, today);

  // 3. Ask the model and stream the answer
  let upstream;
  try {
    upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        temperature: 0.5,
        max_tokens: 1024,
        messages: [{ role: 'system', content: SYSTEM_PROMPT(data) }, ...messages],
      }),
    });
  } catch (err) {
    console.error('Groq fetch failed:', err);
    return json({ error: "Couldn't reach the AI service. Please try again." }, 502);
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    console.error('Groq error', upstream.status, detail);
    if (upstream.status === 429) return json({ error: 'The assistant is busy right now. Please try again in a moment.' }, 429);
    return json({ error: `The AI service had a problem (${upstream.status}). Please try again.` }, 502);
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
