// Vercel Node function: /api/study-tools   (summaries and flashcards from one PDF material)
// Save as:  api/study-tools.js
// Needs: "pdf-parse": "1.1.1" in package.json (you already have it for admin.js)
//        GEMINI_API_KEY in Vercel environment variables
// Add to vercel.json:  "functions": { "api/study-tools.js": { "maxDuration": 60 } }

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
const MAX_PDF_BYTES = 20 * 1024 * 1024;
const MAX_CHARS = 60000;

let pdfParse = null;
try { pdfParse = require('pdf-parse/lib/pdf-parse.js'); } catch (e) { pdfParse = null; }

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

const isId = (s) => typeof s === 'string' && /^[0-9a-zA-Z_-]{1,64}$/.test(s);

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

async function callGemini(system, prompt) {
  let lastStatus = 0;
  for (const model of MODELS) {
    const r = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + GEMINI_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 6000,
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }]
      })
    });
    if (r.ok) {
      const d = await r.json();
      return (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
    }
    lastStatus = r.status;
    if (![403, 404, 429, 503].includes(r.status)) break;
  }
  if (lastStatus === 429) throw new HttpError(429, 'The assistant is busy right now. Please try again in a moment.');
  throw new HttpError(502, 'The AI service had a problem (' + lastStatus + '). Please try again.');
}

function parseJson(text) {
  text = String(text || '').replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(text.slice(a, b + 1)); } catch (e) { return null; }
}

const SYSTEM = 'You help university students revise. Use ONLY the material provided. Never use outside knowledge and never invent facts. Write maths in LaTeX with $...$ for inline maths. Reply with one JSON object only, no other text.';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const send = (status, obj) => res.status(status).json(obj);
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed.');
    if (!GEMINI_KEY) throw new HttpError(500, 'The assistant is not set up yet (missing GEMINI_API_KEY on the server).');
    if (!pdfParse) throw new HttpError(500, 'The PDF reader is not installed (add "pdf-parse": "1.1.1" to package.json).');

    // Signed-in students only
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) throw new HttpError(401, 'Please sign in to use study tools.');
    const who = await supa('/auth/v1/user', token);
    if (!who.ok) throw new HttpError(401, 'Your session has expired. Please sign in again.');

    let b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    b = b || {};
    const action = b.action;
    if (action !== 'summary' && action !== 'flashcards') throw new HttpError(400, 'Unknown action.');
    if (!isId(String(b.material_id))) throw new HttpError(400, 'Choose a material first.');

    // Daily limit (shared with the chat). Skipped if setup-ai.sql has not been run.
    const q = await supa('/rest/v1/rpc/ai_use_quota', token, { method: 'POST', body: { p_limit: DAILY_LIMIT } });
    if (q.ok && q.data && q.data.allowed === false) {
      throw new HttpError(429, 'You have used your ' + DAILY_LIMIT + ' assistant uses for today. Come back tomorrow.');
    }

    // The material (the student's own access rules apply)
    const m = await supa('/rest/v1/materials?select=id,title,course,topic,file_url&id=eq.' + encodeURIComponent(b.material_id) + '&limit=1', token);
    const mat = m.ok && m.data && m.data[0];
    if (!mat) throw new HttpError(404, 'Material not found.');
    if (!/\.pdf(\?|#|$)/i.test(mat.file_url || '')) throw new HttpError(400, 'Only PDF materials can be used here.');

    const dl = await fetch(mat.file_url);
    if (!dl.ok) throw new HttpError(502, 'Could not open this PDF (' + dl.status + ').');
    const buf = Buffer.from(await dl.arrayBuffer());
    if (buf.slice(0, 4).toString() !== '%PDF') throw new HttpError(400, 'This file is not a PDF.');
    if (buf.length > MAX_PDF_BYTES) throw new HttpError(400, 'This PDF is too large for study tools (over 20 MB).');

    let text = '';
    try { const p = await pdfParse(buf); text = String(p.text || ''); } catch (e) { text = ''; }
    text = text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
    if (text.replace(/\s+/g, '').length < 200) throw new HttpError(400, 'No readable text found in this PDF. Scanned PDFs cannot be used.');
    const clipped = text.length > MAX_CHARS;
    text = text.slice(0, MAX_CHARS);

    const head = 'Material: ' + (mat.title || 'PDF') + (mat.course ? ' (' + mat.course + ')' : '') + '\n\n';
    const tail = '\n\n<material>\n' + text + '\n</material>';

    if (action === 'summary') {
      const out = parseJson(await callGemini(SYSTEM,
        head + 'Write a revision summary of the material between the <material> tags.\n' +
        'Return JSON in this shape: {"summary":"3 to 5 short paragraphs in plain markdown","key_points":["8 to 12 short bullet points"],"likely_questions":["5 to 8 questions a lecturer could ask in an exam"]}' + tail));
      if (!out || !out.summary) throw new HttpError(502, 'The assistant sent an unreadable answer. Please try again.');
      return send(200, {
        title: mat.title || 'Material',
        clipped,
        summary: String(out.summary),
        key_points: Array.isArray(out.key_points) ? out.key_points.map(String).slice(0, 15) : [],
        likely_questions: Array.isArray(out.likely_questions) ? out.likely_questions.map(String).slice(0, 10) : []
      });
    }

    const out = parseJson(await callGemini(SYSTEM,
      head + 'Make 15 flashcards from the material between the <material> tags. Cover different facts. Keep "front" to a short question or term and "back" to a short, clear answer (1 to 3 sentences).\n' +
      'Return JSON in this shape: {"cards":[{"front":"","back":""}]}' + tail));
    const cards = out && Array.isArray(out.cards)
      ? out.cards.filter((c) => c && c.front && c.back).map((c) => ({ front: String(c.front), back: String(c.back) })).slice(0, 30)
      : [];
    if (!cards.length) throw new HttpError(502, 'The assistant sent an unreadable answer. Please try again.');
    return send(200, { title: mat.title || 'Material', clipped, cards });
  } catch (e) {
    if (e instanceof HttpError) return send(e.status, { error: e.message });
    console.error(e);
    return send(500, { error: 'Something went wrong on the server.' });
  }
};
