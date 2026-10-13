// Vercel Edge Function: /api/assistant  (the AI Study Assistant backend)
// Save as:  api/assistant.js
//
// Environment variables (Vercel -> Project -> Settings -> Environment Variables):
//   GEMINI_API_KEY    required, from https://aistudio.google.com/apikey
//   GEMINI_MODEL      optional, tried first
//   AI_DAILY_LIMIT    optional, messages per student per day (default 40). Needs setup-ai.sql.

export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xuofkjjhupgmrphzgyun.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh';
const MODELS = [...new Set([
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash-lite'
].filter(Boolean))];
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 40;
const MAX_IMAGE_CHARS = 2500000;

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

// Daily limit. If setup-ai.sql has not been run, this lets everyone through.
async function useQuota(token) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ai_use_quota`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_limit: DAILY_LIMIT }),
    });
    if (!r.ok) return { allowed: true };
    return await r.json();
  } catch {
    return { allowed: true };
  }
}

async function studentData(user, token, today) {
  const meta = user.user_metadata || {};
  const lines = [
    `Today is ${new Date(dayMs(today)).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    })} (${today}).`,
  ];

  // Profile: name, school, department, level, XP, streak
  let prof = {};
  try {
    const rows = await getRows(`profiles?select=*&id=eq.${user.id}&limit=1`, token);
    prof = rows[0] || {};
  } catch (err) {
    console.error('profile lookup failed:', err);
  }

  const name = prof.full_name || prof.name || meta.full_name || meta.name;
  if (name) lines.push(`Student name: ${name}`);
  const school = prof.institution || prof.school;
  if (school) lines.push(`University: ${school}`);
  if (prof.department) lines.push(`Department: ${prof.department}`);
  if (prof.level) lines.push(`Level: ${prof.level}`);
  if (prof.xp) lines.push(`XP: ${prof.xp}`);
  if (prof.streak) lines.push(`Study streak: ${plural(Number(prof.streak) || 0, 'day')}`);

  const examDate = [meta.exam_date, prof.exam_date].find((d) => typeof d === 'string' && DATE_RE.test(d.slice(0, 10)));
  if (examDate) {
    const d = examDate.slice(0, 10);
    const left = Math.round((dayMs(d) - dayMs(today)) / 86400000);
    lines.push(`Exam date: ${d} (${left >= 0 ? plural(left, 'day') + ' away' : 'already passed'})`);
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

  return lines.join('\n');
}

// Recent test results. Every plain field of each row is passed on, so it works with your table as it is.
async function resultsBlock(user, token) {
  try {
    const rows = await getRows(`test_results?select=*&user_id=eq.${user.id}&order=created_at.desc&limit=20`, token);
    if (!rows.length) return 'Test results: the student has not taken any test yet.';
    const skip = new Set(['id', 'user_id', 'created_at', 'course_title', 'course_code', 'course_id']);
    const lines = rows.map((r) => {
      const extra = Object.keys(r)
        .filter((k) => !skip.has(k) && r[k] !== null && typeof r[k] !== 'object')
        .map((k) => `${k}=${String(r[k]).slice(0, 40)}`)
        .join(', ');
      return `- ${(r.created_at || '').slice(0, 10)} | ${r.course_title || r.course_code || 'Unknown course'} | ${extra}`;
    });
    return `Recent test results (newest first):\n${lines.join('\n')}`;
  } catch (err) {
    console.error('test_results lookup failed:', err);
    return 'Test results: could not be loaded right now.';
  }
}

// Finds passages from your uploaded course materials that match the question.
// Uses the source_quote saved with each generated question.
const STOP = new Set(['what', 'when', 'where', 'which', 'with', 'that', 'this', 'there', 'their', 'them', 'then', 'than', 'have', 'about', 'explain', 'please', 'give', 'tell', 'simply', 'topic', 'question', 'answer', 'does', 'from', 'into', 'your', 'make', 'help', 'need', 'want', 'quiz', 'study', 'plan']);
function keywords(text) {
  const words = (String(text).toLowerCase().match(/[a-z0-9]{4,}/g) || []).filter((w) => !STOP.has(w));
  return [...new Set(words)].sort((a, b) => b.length - a.length).slice(0, 4);
}
async function excerpts(text, token) {
  const kws = keywords(text);
  if (!kws.length) return '';
  try {
    const cond = kws.map((k) => `source_quote.ilike.*${k}*`).join(',');
    const rows = await getRows(`questions?select=explanation,source_quote,source_material_id&source_quote=not.is.null&or=(${cond})&limit=6`, token);
    if (!rows.length) return '';
    const ids = [...new Set(rows.map((r) => r.source_material_id).filter(Boolean))];
    const titles = {};
    if (ids.length) {
      try {
        (await getRows(`materials?select=id,title&id=in.(${ids.map(encodeURIComponent).join(',')})`, token))
          .forEach((m) => { titles[m.id] = m.title; });
      } catch { /* titles are optional */ }
    }
    return rows.map((r) =>
      `- [${titles[r.source_material_id] || 'Course material'}] ${String(r.source_quote).slice(0, 300)}` +
      (r.explanation ? ` (note: ${String(r.explanation).slice(0, 200)})` : '')
    ).join('\n');
  } catch (err) {
    console.error('excerpt lookup failed:', err);
    return '';
  }
}

const SYSTEM_PROMPT = (data, results, notes) => `You are the AI Study Assistant inside PRIME-CBT, an exam-preparation app for university students. Students prepare for computer-based tests (CBT) and semester exams.

What you do: explain concepts clearly at university level, write practice questions, summarise material, and coach students on how to study.

Rules:
- Be accurate. If you are not sure about something, say so instead of guessing.
- The ONLY facts you know about this student are in STUDENT DATA and TEST RESULTS below. Never invent their scores, accuracy, weak topics, or progress. If a result is not listed, say you don't have it.
- When asked about weak areas or what to study next, use TEST RESULTS (lowest scores and most recent tests), the exam date, the study plan and the sessions. Overdue sessions and a close exam date should raise the urgency. Name specific courses.
- COURSE MATERIAL NOTES (if present) are passages from the university's uploaded materials. When one is relevant, base your answer on it and name the material in brackets, like [Material title]. If the notes are not relevant, ignore them and never invent a source.
- Quiz mode: when the student asks to be quizzed, ask for a course or topic if not given, then ask ONE question at a time with options A-D. Do not reveal the answer until they reply. Then say whether they were right, explain why, keep a running score (for example "Score: 3/5"), and move on. After 10 questions, or when they say stop, summarise their score and the topics to revise.
- Study plan: when asked for a plan, build a day-by-day plan from today to the exam date using their study days and daily time. Put the weakest courses first.
- Photos: if the student sends a photo of a question or notes, read it carefully, solve or explain it step by step, and say if part of the image is unclear.
- Teaching styles: if the student says "explain simply", use plain words and a short example. If they say "step by step", number the steps. Add a short memory trick (mnemonic) when it helps.
- Stay on study topics. Do not write graded coursework for the student to submit, and do not help cheat in a live exam. For assignments, explain the concept and guide them instead. If they seem stressed, give one or two short, practical tips and encourage them.
- Keep answers concise and easy to read on a phone: short paragraphs and short lists.
- Write all maths in LaTeX. Use $...$ for inline maths (for example $x^2$) and $$...$$ on its own line for standalone equations (for example $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$). Never wrap currency in dollar signs.
- Reply in the language the student writes in.

STUDENT DATA (live from their account):
${data}

TEST RESULTS:
${results}
${notes ? `\nCOURSE MATERIAL NOTES:\n${notes}\n` : ''}`;

// ====================================================================
//  AI ASSISTANT (server side: auth, limits, student data, Gemini stream)
// ====================================================================
export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'The assistant is not set up yet (missing GEMINI_API_KEY on the server).' }, 500);

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

  let image = null;
  if (body.image) {
    if (typeof body.image !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(body.image) || body.image.length > MAX_IMAGE_CHARS) {
      return json({ error: 'That image could not be used. Try a smaller JPG or PNG.' }, 400);
    }
    image = body.image;
  }

  // 3. Daily limit
  const quota = await useQuota(token);
  if (quota && quota.allowed === false) {
    return json({ error: `You have used your ${DAILY_LIMIT} assistant messages for today. Come back tomorrow.` }, 429);
  }

  const today = typeof body.today === 'string' && DATE_RE.test(body.today) ? body.today : new Date().toISOString().slice(0, 10);
  const last = messages[messages.length - 1];
  const [data, results, notes] = await Promise.all([
    studentData(user, token, today),
    resultsBlock(user, token),
    last.content.length > 12 ? excerpts(last.content, token) : Promise.resolve(''),
  ]);

  const finalMessages = image
    ? [...messages.slice(0, -1), { role: 'user', content: [{ type: 'text', text: last.content }, { type: 'image_url', image_url: { url: image } }] }]
    : messages;

  // 4. Ask Gemini (OpenAI-compatible endpoint), trying the next model if one is missing or out of quota
  let upstream;
  try {
    for (const model of MODELS) {
      upstream = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          stream: true,
          temperature: 0.5,
          max_tokens: 2500,
          messages: [{ role: 'system', content: SYSTEM_PROMPT(data, results, notes) }, ...finalMessages],
        }),
      });
      if (upstream.ok || ![403, 404, 429, 503].includes(upstream.status)) break;
      console.error('Gemini model failed:', model, upstream.status);
    }
  } catch (err) {
    console.error('Gemini fetch failed:', err);
    return json({ error: "Couldn't reach the AI service. Please try again." }, 502);
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    console.error('Gemini error', upstream.status, detail);
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
