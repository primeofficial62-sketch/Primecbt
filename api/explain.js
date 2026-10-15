// Vercel Node function: /api/explain   (AI explanation of one PDF page, used by the PDF reader)
// Save as:  api/explain.js        <- must be inside the "api" folder, or the reader gets "Server error 404"
// Needs:    GEMINI_API_KEY in Vercel environment variables (same key study-tools.js uses)
// Add to vercel.json:  "functions": { "api/explain.js": { "maxDuration": 60 } }

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://xuofkjjhupgmrphzgyun.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh';
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const MODELS = [...new Set([
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash-lite'
].filter(Boolean))];
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 40;
const MAX_TEXT = 12000;
const MAX_IMAGE_CHARS = 2500000;   // base64 length of the page photo used for scanned pages

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

async function supa(path, token, opts) {
  opts = opts || {};
  const res = await fetch(SUPABASE_URL + path, {
    method: opts.method || 'GET',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: opts.body == null ? undefined : JSON.stringify(opts.body)
  });
  if (!res.ok) return { ok: false, status: res.status, data: null };
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
  return { ok: true, status: res.status, data };
}

async function callGemini(system, userContent) {
  let lastStatus = 0;
  for (const model of MODELS) {
    const r = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + GEMINI_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 1500,
        messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }]
      })
    });
    if (r.ok) {
      const d = await r.json();
      return ((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '').trim();
    }
    lastStatus = r.status;
    if (![403, 404, 429, 503].includes(r.status)) break;
  }
  if (lastStatus === 429) throw new HttpError(429, 'The assistant is busy right now. Please try again in a moment.');
  throw new HttpError(502, 'The AI service had a problem (' + lastStatus + '). Please try again.');
}

const SYSTEM =
  'You are a friendly tutor helping a Nigerian university student understand one page of their course material. ' +
  'Base your answer on the page content you are given. You may use simple general knowledge to clarify terms, ' +
  'but never invent facts about what the document says. ' +
  'Write in plain, simple English. Use short paragraphs and "- " bullet points. Use **bold** only for key terms. ' +
  'Do not use headings, tables or LaTeX; write maths in plain text (for example: x^2 or 1/2). ' +
  'Do not start with phrases like "Sure" or "Certainly".';

const TASKS = {
  explain: 'Explain what this page is about in a clear, helpful way. Start with a one or two sentence overview, then explain the key ideas as short bullet points. Keep it under about 250 words.',
  simpler: 'Explain this page again in much simpler words, as if to a first-year student seeing the topic for the first time. Use everyday comparisons where they help. Keep it under about 180 words.',
  example: 'Give one or two clear, concrete worked examples that make the main idea on this page easy to understand. Keep it under about 250 words.'
};

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const send = (status, obj) => res.status(status).json(obj);
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed.');
    if (!GEMINI_KEY) throw new HttpError(500, 'The assistant is not set up yet (missing GEMINI_API_KEY on the server).');

    // Signed-in students only
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) throw new HttpError(401, 'Please sign in to use AI explanations.');
    const who = await supa('/auth/v1/user', token);
    if (!who.ok) throw new HttpError(401, 'Your session has expired. Please sign in again.');

    let b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    b = b || {};

    const mode = Object.prototype.hasOwnProperty.call(TASKS, b.mode) ? b.mode : 'explain';
    const page = Math.max(1, Math.min(parseInt(b.page, 10) || 1, 5000));
    const text = typeof b.text === 'string' ? b.text.slice(0, MAX_TEXT).trim() : '';
    const image = typeof b.image === 'string' && /^[A-Za-z0-9+/=]+$/.test(b.image) && b.image.length <= MAX_IMAGE_CHARS ? b.image : '';
    if (text.length < 20 && !image) throw new HttpError(400, 'This page has nothing readable to explain.');

    // Daily limit shared with the chat. Skipped if setup-ai.sql has not been run.
    const q = await supa('/rest/v1/rpc/ai_use_quota', token, { method: 'POST', body: { p_limit: DAILY_LIMIT } });
    if (q.ok && q.data && q.data.allowed === false) {
      throw new HttpError(429, 'You have used your ' + DAILY_LIMIT + ' assistant uses for today. Come back tomorrow.');
    }

    const title = String(b.title || 'Course material').slice(0, 200);
    const category = String(b.category || '').slice(0, 80);
    const head = 'Document: ' + title + (category ? ' (' + category + ')' : '') + '\nPage: ' + page + '\n\n' + TASKS[mode] + '\n\n';

    let content;
    if (text.length >= 20) {
      content = head + '<page>\n' + text + '\n</page>';
    } else {
      content = [
        { type: 'text', text: head + 'The page is shown as an image because it has no selectable text.' },
        { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + image } }
      ];
    }

    const explanation = await callGemini(SYSTEM, content);
    if (!explanation) throw new HttpError(502, 'The assistant sent an empty answer. Please try again.');
    return send(200, { explanation });
  } catch (e) {
    if (e instanceof HttpError) return send(e.status, { error: e.message });
    console.error(e);
    return send(500, { error: 'Something went wrong on the server.' });
  }
};
