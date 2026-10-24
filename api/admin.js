// PRIME-CBT admin API  ->  put this file at  api/admin.js  (project root)
// Secrets come ONLY from Vercel Environment Variables. Never type keys in this file.
//   SUPABASE_URL                 e.g. https://xuofkjjhupgmrphzgyun.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    Supabase > Settings > API Keys > secret / service_role key
//   ADMIN_SESSION_SECRET         any long random text (40+ characters)
//   GEMINI_API_KEY               (optional now) last-resort fallback key. Your main keys live in Admin > API Keys.
//   STORAGE_BUCKET               (optional) Supabase Storage bucket for uploads. Defaults to "materials".
//   GEMINI_MODEL                 (optional) force one Gemini model first. Otherwise the newest available one is used.
//   QUESTIONS_PER_PDF            (optional) questions to write for every file. Defaults to 100.
//   GEN_CONCURRENCY              (optional) parallel question-writing calls. Defaults to 5 (use 3 on a free Gemini key).
//   OCR_CONCURRENCY              (optional) parallel OCR calls for scanned PDFs. Defaults to 6 (use 3 on a free Gemini key).
//
// API KEY ROTATION: keys are stored in the Supabase table "api_keys" (add them in Admin > API Keys).
// When one key hits its limit, the same request is retried on the next key straight away.
//
// Needs in package.json (project root):  "pdf-parse": "1.1.1", "jszip": "3.10.1", "pdf-lib": "1.17.1", "@vercel/functions": "^2.0.0"
// Needs in vercel.json:   { "functions": { "api/admin.js": { "maxDuration": 300 } } }
// The PDF / PowerPoint (.pptx) / Word (.docx) reader is built into this file. No api/_extract.js needed.
// Pictures (PNG / JPG / WEBP / GIF) and scanned PDFs are read with Gemini vision (equations come out as LaTeX).
// Needs in Supabase: run setup.sql once, then (for maths + diagrams):
//   alter table questions add column if not exists image_url text;
//   alter table questions add column if not exists svg text;

const crypto = require('crypto');

const URL_ = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SECRET = process.env.ADMIN_SESSION_SECRET || '';
const BUCKET = process.env.STORAGE_BUCKET || 'materials';
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const TARGET = Math.min(Math.max(parseInt(process.env.QUESTIONS_PER_PDF, 10) || 100, 10), 300);
// Newest first. If a model is missing on your key or its free quota is used up, the next one is tried.
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite'
].filter(Boolean);
const COOKIE = 'admin_session';
const WEEK = 7 * 24 * 3600;
const UPLOAD_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'];

// Optional helpers: they load only if installed, so a missing package can never break the whole admin API.
let waitUntil = null;
try { waitUntil = require('@vercel/functions').waitUntil; } catch (e) { waitUntil = null; }
let PDFLib = null;
try { PDFLib = require('pdf-lib'); } catch (e) { PDFLib = null; }

/* ---------- file reader: PDF, PowerPoint (.pptx), Word (.docx) ---------- */
// Built in on purpose, so it can never go missing from the deployment.
const xmlDecode = function (s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(+n); })
    .replace(/&amp;/g, '&');
};
function xmlText(xml) {
  return xmlDecode(
    xml
      .replace(/<\/a:p>|<\/w:p>/g, '\n')
      .replace(/<a:br\s*\/>|<w:br\s*\/>/g, '\n')
      .replace(/<w:tab\s*\/>/g, ' ')
      .replace(/<[^>]+>/g, '')
  ).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
function fileNum(name) { const m = name.match(/(\d+)\.xml$/); return m ? parseInt(m[1], 10) : 0; }

// Old PowerPoint (.ppt): reads the text records inside the binary file
function pptText(buf) {
  let CFB;
  try { CFB = require('cfb'); }
  catch (e) { throw new Error('The .ppt reader failed to load: ' + ((e && e.message) || e) + ' (add "cfb": "1.2.2" to package.json)'); }
  const cf = CFB.read(buf, { type: 'buffer' });
  const entry = CFB.find(cf, 'PowerPoint Document');
  if (!entry || !entry.content) throw new Error('This is not a PowerPoint .ppt file. Save it as .pptx and upload again.');
  const d = Buffer.from(entry.content);
  const seen = {}, out = [];
  function add(t) {
    t = t.replace(/\r\n?/g, '\n').replace(/[\u000b\u2028]/g, '\n').replace(/[\u0000-\u0008\u000c\u000e-\u001f]/g, '').trim();
    if (t && !seen[t]) { seen[t] = 1; out.push(t); }
  }
  function walk(start, end) {
    let p = start;
    while (p + 8 <= end) {
      const verInst = d.readUInt16LE(p), type = d.readUInt16LE(p + 2), len = d.readUInt32LE(p + 4);
      const body = p + 8, next = body + len;
      if (next > end) break;
      if ((verInst & 0xF) === 0xF) walk(body, next);                                  // container: look inside
      else if (type === 0x0FA0) add(d.slice(body, next).toString('utf16le'));        // text (unicode)
      else if (type === 0x0FA8) add(d.slice(body, next).toString('latin1'));         // text (plain)
      p = next;
    }
  }
  walk(0, d.length);
  return out.join('\n\n');
}

// Pictures are read by Gemini vision, so we only need to recognise them by their first bytes.
function imageMime(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0xFF && buf[1] === 0xD8) return 'image/jpeg';
  if (buf.slice(0, 4).toString() === 'GIF8') return 'image/gif';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}

async function extractText(buf) {
  if (!buf || !buf.length) throw new Error('The file is empty.');

  // Old PowerPoint .ppt (binary format starts with D0 CF 11 E0)
  if (buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0) return { text: pptText(buf) };

  // PDF
  if (buf.slice(0, 5).toString() === '%PDF-') {
    let pdfParse;
    try { pdfParse = require('pdf-parse/lib/pdf-parse.js'); }
    catch (e) {
      try { pdfParse = require('pdf-parse'); }
      catch (e2) { throw new Error('PDF reader failed to load: ' + ((e2 && e2.message) || e2) + ' (add "pdf-parse": "1.1.1" to package.json)'); }
    }
    const r = await pdfParse(buf);
    return { text: r.text || '' };
  }

  // PPTX / DOCX are zip files (they start with "PK")
  if (buf[0] === 0x50 && buf[1] === 0x4b) {
    let JSZip;
    try { JSZip = require('jszip'); }
    catch (e) { throw new Error('PowerPoint/Word reader failed to load: ' + ((e && e.message) || e) + ' (add "jszip": "3.10.1" to package.json in the project root)'); }
    const zip = await JSZip.loadAsync(buf);
    const names = Object.keys(zip.files);

    // PowerPoint: slide text, then that slide's speaker notes
    const slides = names
      .filter(function (n) { return /^ppt\/slides\/slide\d+\.xml$/.test(n); })
      .sort(function (a, b) { return fileNum(a) - fileNum(b); });
    if (slides.length) {
      let out = '';
      for (const s of slides) {
        const i = fileNum(s);
        out += '\n' + xmlText(await zip.file(s).async('string')) + '\n';
        const notes = zip.file('ppt/notesSlides/notesSlide' + i + '.xml');
        if (notes) out += xmlText(await notes.async('string')) + '\n';
      }
      return { text: out };
    }

    // Word
    if (zip.file('word/document.xml')) {
      return { text: xmlText(await zip.file('word/document.xml').async('string')) };
    }
  }

  throw new Error('Unsupported file. Use PDF, PPTX, DOCX or a picture. Old .doc files must be saved as .docx first.');
}

// Speed + size settings
const MAX_TEXT = 800000;      // max characters read from one file
const GEN_CONCURRENCY = Math.min(Math.max(parseInt(process.env.GEN_CONCURRENCY, 10) || 5, 1), 10);
const OCR_CONCURRENCY = Math.min(Math.max(parseInt(process.env.OCR_CONCURRENCY, 10) || 6, 1), 12);
const OCR_PAGES = 12;                    // pages per OCR request
const OCR_MAX_BYTES = 10 * 1024 * 1024;  // max size of one OCR piece

// What the panel may touch. columns = fields it may write. search = fields the search box looks in.
const TABLES = {
  support_tickets: { cols: ['status'], search: ['subject', 'email', 'message'], order: 'created_at', del: true },
  courses: { cols: ['title', 'code', 'description'], search: ['title', 'code'], order: 'title', asc: true, del: true },
  questions: { cols: ['course_id', 'question', 'options', 'correct_index', 'explanation', 'difficulty', 'image_url', 'svg'], search: ['question'], order: 'created_at', del: true },
  materials: { cols: ['title', 'course', 'topic', 'category', 'material_type', 'file_url', 'page_count', 'size_bytes'], search: ['title', 'course', 'topic'], order: 'created_at', del: true },
  achievements: { cols: ['title', 'slug', 'description', 'icon', 'metric', 'threshold', 'sort_order'], search: ['title', 'slug'], order: 'sort_order', asc: true, del: true },
  discussion_posts: { cols: ['title', 'body', 'is_pinned'], search: ['title', 'body'], order: 'created_at', del: true },
  discussion_replies: { cols: [], search: ['body'], order: 'created_at', asc: true, del: true },
  test_results: { cols: [], search: ['course_title', 'course_code'], order: 'created_at', del: false },
  schools: { cols: ['name', 'sort_order'], search: ['name'], order: 'sort_order', asc: true, del: true },
  departments: { cols: ['school_id', 'name', 'sort_order'], search: ['name'], order: 'sort_order', asc: true, del: true },
  levels: { cols: ['name', 'sort_order'], search: ['name'], order: 'sort_order', asc: true, del: true },
  reviews: { cols: ['status'], search: ['user_name', 'user_email', 'message'], order: 'created_at', del: true },
  material_levels: { cols: ['enabled'], search: [], order: 'level', asc: true, del: false },
  api_keys: { cols: ['label', 'key', 'enabled'], search: ['label'], order: 'created_at', asc: true, del: true }
};


class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

/* ---------- Supabase REST (server-side, service key) ---------- */
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
  if (!res.ok) {
    const msg = (data && (data.message || data.msg || data.error_description || data.error)) || 'Database error';
    if (/foreign key|violates/i.test(msg)) throw new HttpError(409, 'This item is still in use by other records. Remove those first.');
    throw new HttpError(res.status >= 500 ? 502 : 400, msg);
  }
  return { data: data, res: res };
}
const enc = encodeURIComponent;

/* ---------- PIN + session ---------- */
function hashPin(pin, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(pin, salt, 32).toString('hex');
}
function checkPin(pin, stored) {
  const parts = String(stored).split(':');
  const a = Buffer.from(hashPin(pin, parts[0]).split(':')[1], 'hex');
  const b = Buffer.from(parts[1] || '', 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function sign(str) { return crypto.createHmac('sha256', SECRET).update(str).digest('base64url'); }
function makeToken(version) {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + WEEK, v: version })).toString('base64url');
  return payload + '.' + sign(payload);
}
function readToken(req) {
  const m = (req.headers.cookie || '').split(';').map(function (s) { return s.trim(); }).filter(function (s) { return s.indexOf(COOKIE + '=') === 0; })[0];
  if (!m) return null;
  const tok = m.slice(COOKIE.length + 1), i = tok.indexOf('.');
  if (i < 1) return null;
  const payload = tok.slice(0, i), sig = tok.slice(i + 1);
  const good = Buffer.from(sign(payload)), got = Buffer.from(sig);
  if (good.length !== got.length || !crypto.timingSafeEqual(good, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return p.exp > Date.now() / 1000 ? p : null;
  } catch (e) { return null; }
}
function setCookie(res, value, maxAge) {
  res.setHeader('Set-Cookie', COOKIE + '=' + value + '; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=' + maxAge);
}
async function getConfig() {
  const r = await sb('/rest/v1/admin_config?id=eq.1&select=*');
  return r.data && r.data[0] ? r.data[0] : null;
}
async function requireAuth(req) {
  const tok = readToken(req);
  const cfg = await getConfig();
  if (!tok || !cfg || tok.v !== cfg.pin_version) throw new HttpError(401, 'Please sign in again.');
  return cfg;
}

/* ---------- helpers ---------- */
const clean = function (s) { return String(s == null ? '' : s).replace(/[,()*%\\"']/g, ' ').trim().slice(0, 80); };
const isId = function (s) { return typeof s === 'string' && /^[0-9a-zA-Z_-]{1,64}$/.test(s); };
// A file the question writer can read: PDF, PowerPoint (.pptx), Word (.docx) or a picture (PNG, JPG, WEBP, GIF).
const isPdfUrl = function (u) { return /\.(pdf|pptx?|docx|png|jpe?g|webp|gif)(\?|#|$)/i.test(String(u || '')); };
const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
function tableOf(name) {
  if (!Object.prototype.hasOwnProperty.call(TABLES, name)) throw new HttpError(400, 'Unknown section.');
  return TABLES[name];
}
function pick(obj, cols) {
  const out = {};
  cols.forEach(function (c) { if (obj && Object.prototype.hasOwnProperty.call(obj, c)) out[c] = obj[c]; });
  return out;
}
async function count(table, filter) {
  const r = await sb('/rest/v1/' + table + '?select=id' + (filter || '') + '&limit=1', { headers: { Prefer: 'count=exact' } });
  const cr = r.res.headers.get('content-range') || '';
  return parseInt(cr.split('/')[1], 10) || 0;
}
async function safeCount(table, filter) { try { return await count(table, filter); } catch (e) { return 0; } }

// Runs a job after the response is sent (Vercel keeps the function alive until it finishes).
function background(promise) {
  const safe = Promise.resolve(promise).catch(function (e) { console.error('background job failed:', e && e.message); });
  if (waitUntil) { try { waitUntil(safe); } catch (e) { /* ignore */ } }
}

/* ---------- question writing (Gemini) ---------- */
const normText = function (s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
// Maths-safe key: keeps + - = ^ and so on, so "x+2=5" and "x-2=5" are NOT treated as the same question,
// and the options "+3" and "-3" are not treated as the same option.
const normQ = function (s) { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, '').replace(/[.,;:?!"'`]/g, ''); };
// Only accepts a small, plain SVG drawing. No scripts, no links, no embedded images.
const cleanSvg = function (s) {
  s = String(s == null ? '' : s).trim();
  if (!/^<svg[\s>]/i.test(s) || s.length > 8000) return null;
  if (/<script|<foreignObject|<iframe|<image|\son\w+\s*=|javascript:|href\s*=\s*["']?(?!#)/i.test(s)) return null;
  return s;
};

function parseJsonArray(text) {
  text = String(text || '').replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  const start = text.indexOf('[');
  if (start < 0) return null;
  const end = text.lastIndexOf(']');
  if (end > start) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) { /* try to salvage below */ } }
  const lastObj = text.lastIndexOf('}');
  if (lastObj > start) { try { return JSON.parse(text.slice(start, lastObj + 1) + ']'); } catch (e) { /* give up */ } }
  return null;
}

const QUESTIONS_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      question: { type: 'STRING' },
      options: { type: 'ARRAY', items: { type: 'STRING' } },
      correct_index: { type: 'INTEGER' },
      explanation: { type: 'STRING' },
      difficulty: { type: 'STRING', enum: ['easy', 'medium', 'hard'] },
      source_quote: { type: 'STRING' },
      svg: { type: 'STRING' }
    },
    required: ['question', 'options', 'correct_index', 'explanation', 'difficulty', 'source_quote']
  }
};

/* ---------- API key rotation ---------- */
// Keys live in the Supabase table "api_keys" (Admin > API Keys). The Vercel GEMINI_API_KEY is only a last-resort fallback.
// When a key hits its limit it is parked and the SAME request is retried on the next key straight away.
const keyCool = {};   // "keyId|model" -> time (ms) when that key can be used again for that model

function nextPacificMidnight() {
  const now = new Date();
  const la = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const next = new Date(la); next.setHours(24, 0, 0, 0);
  return now.getTime() + (next - la);
}
function coolUntil(msg) {
  if (/PerDay|per day/i.test(msg)) return nextPacificMidnight();
  const m = String(msg).match(/retry in (?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?/i);
  const secs = m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 60;
  return Date.now() + Math.max(secs, 5) * 1000;
}
async function getKeys() {
  let rows = [];
  try { rows = (await sb('/rest/v1/api_keys?select=id,key,uses&enabled=eq.true&provider=eq.gemini&order=created_at.asc')).data || []; }
  catch (e) { rows = []; }   // table not created yet: fall back to the Vercel key
  const list = rows.map(function (r) { return { id: String(r.id), key: r.key, uses: r.uses || 0, db: true }; });
  if (GEMINI_KEY && !list.some(function (k) { return k.key === GEMINI_KEY; })) list.push({ id: 'env', key: GEMINI_KEY, uses: 0, db: false });
  return list;
}
async function hasKeys() { return (await getKeys()).length > 0; }

// One Gemini request. Asks for low "thinking" (much faster); if a model rejects that setting, it is switched off for good.
let thinkingOk = true;
async function geminiCall(model, body) {
  const keys = await getKeys();
  if (!keys.length) return { res: { ok: false, status: 401 }, data: { error: { message: 'No API key. Add one in the API Keys section.' } } };
  const send = function (bd, key) {
    return fetch('https://generativelanguage.googleapis.com/v1beta/models/' + enc(model) + ':generateContent', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(bd)
    });
  };
  let last = null;
  for (const k of keys) {
    const ck = k.id + '|' + model;
    if (keyCool[ck] && keyCool[ck] > Date.now()) continue;   // this key is at its limit for this model: skip it
    let bd = body;
    if (thinkingOk) bd = Object.assign({}, body, { generationConfig: Object.assign({}, body.generationConfig, { thinkingConfig: { thinkingLevel: 'low' } }) });
    let res = await send(bd, k.key);
    let data = await res.json().catch(function () { return {}; });
    if (res.status === 400 && thinkingOk && /thinking/i.test((data.error && data.error.message) || '')) {
      thinkingOk = false;
      res = await send(body, k.key);
      data = await res.json().catch(function () { return {}; });
    }
    if (res.ok) {
      if (k.db) { try { await sb('/rest/v1/api_keys?id=eq.' + enc(k.id), { method: 'PATCH', body: { uses: k.uses + 1, last_used: new Date().toISOString(), exhausted_until: null } }); } catch (e) { /* ignore */ } }
      return { res: res, data: data };
    }
    last = { res: res, data: data };
    const msg = JSON.stringify(data.error || {});
    if (res.status === 429) {                                  // limit hit: park this key, use the next one straight away
      const until = coolUntil(msg);
      keyCool[ck] = until;
      if (k.db) { try { await sb('/rest/v1/api_keys?id=eq.' + enc(k.id), { method: 'PATCH', body: { exhausted_until: new Date(until).toISOString(), last_error: msg.slice(0, 300) } }); } catch (e) { /* ignore */ } }
      continue;
    }
    if ((res.status === 400 || res.status === 401 || res.status === 403) && /api key/i.test(msg)) {   // bad or revoked key
      keyCool[ck] = Date.now() + 3600000;
      if (k.db) { try { await sb('/rest/v1/api_keys?id=eq.' + enc(k.id), { method: 'PATCH', body: { enabled: false, last_error: msg.slice(0, 300) } }); } catch (e) { /* ignore */ } }
      continue;
    }
    return last;   // any other error: let the model fallback in askGemini handle it
  }
  return last || { res: { ok: false, status: 429 }, data: { error: { message: 'All API keys are at their limit for this model.' } } };
}

async function askGemini(prompt, customBody) {
  const body = customBody || {
    systemInstruction: { parts: [{ text: 'You write multiple-choice exam questions for university students strictly from the course material you are given. Never use outside knowledge. Write all mathematics, formulas and chemical equations in LaTeX. Reply with a JSON array only, no other text.' }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 16000,
      responseMimeType: 'application/json',
      responseSchema: QUESTIONS_SCHEMA
    }
  };
  let lastMsg = '', lastStatus = 0;
  for (let round = 0; round < 3; round++) {
    const tried = {};
    for (const model of GEMINI_MODELS) {
      if (tried[model]) continue;
      tried[model] = 1;
      const r = await geminiCall(model, body), res = r.res, data = r.data;
      if (res.ok) {
        const cand = (data.candidates || [])[0];
        if (!cand) {
          const why = data.promptFeedback && data.promptFeedback.blockReason;
          throw new HttpError(502, 'The question writer returned no answer' + (why ? ' (' + why + ')' : '') + '. Try again.');
        }
        return ((cand.content && cand.content.parts) || []).map(function (p) { return p.text || ''; }).join('');
      }
      lastStatus = res.status;
      lastMsg = (data && data.error && data.error.message) || 'The question writer is not available.';
      if (res.status === 401 || (res.status === 400 && /api key/i.test(lastMsg))) throw new HttpError(500, 'Your Gemini API keys are not valid or missing. Add a working key in API Keys.');
      // model missing (404), not allowed (403), quota used up (429) or busy (503): try the next model
      if (res.status === 403 || res.status === 404 || res.status === 429 || res.status === 503) continue;
      throw new HttpError(502, lastMsg);
    }
    // every model said "quota" or "busy": wait for the per-minute limit to reset, then go round again
    if (lastStatus === 503 || (lastStatus === 429 && round < 1)) { await sleep(8000); continue; }
    break;
  }
  throw new HttpError(502, lastMsg || 'The question writer is not available. Check your Gemini keys and quota in Google AI Studio.');
}

// Splits long text into n parts, cutting at a line break where possible.
function splitText(text, n) {
  if (n <= 1) return [text];
  const size = Math.ceil(text.length / n), out = [];
  let pos = 0;
  while (pos < text.length && out.length < n) {
    let end = Math.min(text.length, pos + size);
    if (end < text.length) { const nl = text.indexOf('\n', end); if (nl > -1 && nl - end < 800) end = nl; }
    out.push(text.slice(pos, end));
    pos = end;
  }
  if (pos < text.length && out.length) out[out.length - 1] += text.slice(pos);
  return out;
}

// Mixes the options so the right answer is not always in the same place. Skips "all of the above" style options.
function shuffleOptions(options, correct) {
  if (options.some(function (o) { return /\b(all|none|both)\b.*\b(above|these|them)\b|\bany of the above\b/i.test(o); })) return { options: options, correct_index: correct };
  const items = options.map(function (t, i) { return { t: t, ok: i === correct }; });
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = items[i]; items[i] = items[j]; items[j] = x;
  }
  return { options: items.map(function (i) { return i.t; }), correct_index: items.findIndex(function (i) { return i.ok; }) };
}

// Scanned PDFs and pictures have no text layer. Gemini reads them as images, so it writes the text out for us.
// One OCR request for one small PDF piece or one picture.
async function ocrPiece(bytes, mime) {
  const data = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length).toString('base64');
  const body = {
    contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: mime || 'application/pdf', data: data } },
      { text: 'Transcribe all the text in this document in reading order, page by page. Write every equation and formula in LaTeX inside \\( ... \\). Do not summarise, translate or comment. Output the transcription only.' }
    ] }],
    generationConfig: { temperature: 0, maxOutputTokens: 24000 }
  };
  return String(await askGemini('', body) || '');
}

// Scanned PDF of ANY size: cut into small page groups and read them in parallel.
async function ocrPdfWithGemini(buf) {
  let src = null;
  if (PDFLib) { try { src = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false }); } catch (e) { src = null; } }
  if (!src) {
    if (buf.length > 14 * 1024 * 1024) throw new HttpError(400, 'Large scanned PDFs need the "pdf-lib" package. Add "pdf-lib": "1.17.1" to package.json and redeploy.');
    return ocrPiece(new Uint8Array(buf));
  }
  const total = src.getPageCount(), ranges = [];
  for (let i = 0; i < total; i += OCR_PAGES) ranges.push([i, Math.min(i + OCR_PAGES, total)]);
  const results = new Array(ranges.length).fill('');
  let next = 0, chars = 0, lastErr = '';

  async function piece(from, to) {
    const doc = await PDFLib.PDFDocument.create();
    const idx = []; for (let k = from; k < to; k++) idx.push(k);
    (await doc.copyPages(src, idx)).forEach(function (p) { doc.addPage(p); });
    const bytes = await doc.save({ useObjectStreams: false });
    if (bytes.length > OCR_MAX_BYTES) {
      if (to - from <= 1) return '';   // one enormous page: skip it
      const mid = from + Math.ceil((to - from) / 2);
      return (await piece(from, mid)) + '\n' + (await piece(mid, to));
    }
    try { return await ocrPiece(bytes); } catch (e) { return await ocrPiece(bytes); }   // one retry
  }
  async function worker() {
    while (next < ranges.length && chars < MAX_TEXT) {
      const i = next++;
      try { results[i] = await piece(ranges[i][0], ranges[i][1]); chars += results[i].length; }
      catch (e) { lastErr = (e && e.message) || 'OCR failed'; if (/not valid/i.test(lastErr)) next = ranges.length; }
    }
  }
  await Promise.all(Array.from({ length: OCR_CONCURRENCY }, worker));
  const text = results.join('\n');
  if (!text.replace(/\s+/g, '').length && lastErr) throw new HttpError(502, lastErr);
  return text;
}

// Downloads the file (PDF, .pptx, .docx or picture) and returns its text. Scans and pictures are read with AI (OCR).
// "fallback" is text the admin page already read in the browser; it is used only if the server cannot read the file.
async function loadMaterialText(mat, fallback) {
  let text = '', problem = '', buf = null, usedFallback = false;
  if (mat && mat.file_url) {
    try {
      const dl = await fetch(mat.file_url);
      if (dl.ok) buf = Buffer.from(await dl.arrayBuffer());
      else problem = 'Could not download the file (' + dl.status + ').';
    } catch (e) { problem = (e && e.message) || ''; }
  }
  if (buf) { try { text = (await extractText(buf)).text; } catch (e) { problem = (e && e.message) || problem; } }
  text = String(text || '');
  const tooShort = function (t, min) { return String(t).replace(/\s+/g, '').length < (min || 200); };

  // A picture, or a PDF with no text layer: read it with Gemini vision (equations come out as LaTeX)
  if (tooShort(text) && buf && (await hasKeys())) {
    const mime = imageMime(buf);
    try {
      if (buf.slice(0, 5).toString() === '%PDF-') { text = await ocrPdfWithGemini(buf); problem = ''; }
      else if (mime) {
        if (buf.length > 14 * 1024 * 1024) throw new HttpError(400, 'This picture is too large to read. Use a smaller one.');
        text = await ocrPiece(new Uint8Array(buf), mime); problem = '';
      }
    } catch (e) { problem = (e && e.message) || problem; }
  }

  // Last resort: text the admin page read in the browser
  if (tooShort(text) && fallback && !tooShort(fallback, 80)) { text = String(fallback); usedFallback = true; }

  text = String(text || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ');
  if (tooShort(text, usedFallback ? 80 : 200)) throw new HttpError(400, problem || 'No readable text could be found in this file, even after reading its pages as images.');
  return text.slice(0, MAX_TEXT);
}

async function setStatus(matId, patch) {
  try { await sb('/rest/v1/materials?id=eq.' + enc(matId), { method: 'PATCH', body: patch }); } catch (e) { /* columns not added yet: ignore */ }
}

async function insertQuestions(rows) {
  try {
    await sb('/rest/v1/questions', { method: 'POST', body: rows });
  } catch (e) {
    // If the table has no source_material_id / source_quote / ai_generated / svg / image_url columns yet, save without them.
    if (/column|schema cache/i.test(e.message)) {
      await sb('/rest/v1/questions', { method: 'POST', body: rows.map(function (r) { const c = Object.assign({}, r); delete c.source_material_id; delete c.source_quote; delete c.ai_generated; delete c.svg; delete c.image_url; return c; }) });
    } else throw e;
  }
}

/* ---------- run locks ---------- */
// One question-writing run per file at a time. A lock older than RUN_STALE_MS is treated as dead,
// so a crashed or timed-out run can never leave a file blocked.
const running = {};
const RUN_STALE_MS = 6 * 60000;
function tryLock(key) {
  const t = running[key];
  if (t && Date.now() - t < RUN_STALE_MS) return false;
  running[key] = Date.now();
  return true;
}
function unlock(key) { delete running[key]; }
// Another server instance may be working on the file: the database status tells us.
function recentlyProcessing(mat) {
  return !!(mat && mat.qgen_status === 'processing' && mat.qgen_started_at && Date.now() - new Date(mat.qgen_started_at).getTime() < RUN_STALE_MS);
}

// Writes questions for ONE material until it has `target` questions saved. Safe to run again: it only writes what is missing.
async function generateForMaterial(mat, courseId, opts) {
  opts = opts || {};
  const target = opts.target || TARGET;
  const matKey = String(mat.id);

  const course = ((await sb('/rest/v1/courses?id=eq.' + enc(courseId) + '&select=title,code')).data || [])[0];
  if (!course) throw new HttpError(400, 'Course not found.');

  const have = await safeCount('questions', '&source_material_id=eq.' + enc(matKey));
  const need = target - have;
  if (need <= 0) {
    await setStatus(mat.id, { qgen_status: 'done', qgen_count: have, qgen_error: null });
    return { saved: 0, rejected: 0, duplicates: 0, total: have, already: true, course_title: course.title };
  }

  await setStatus(mat.id, { qgen_status: 'processing', qgen_started_at: new Date().toISOString(), qgen_error: null });

  let finished = false;
  try {
    const text = await loadMaterialText(mat, opts.text);

    const haystack = normText(text);
    const existing = {}, stems = [];
    ((await sb('/rest/v1/questions?course_id=eq.' + enc(courseId) + '&select=question&limit=5000')).data || []).forEach(function (q) {
      existing[normQ(q.question)] = 1; stems.push(String(q.question).slice(0, 110));
    });

    const stats = { saved: 0, rejected: 0, duplicates: 0, apiErrors: 0, lastError: '' };

    function validateAndKeep(items) {
      const rows = [];
      (items || []).forEach(function (it) {
        if (stats.saved + rows.length >= need) return;
        const options = it && Array.isArray(it.options) ? it.options.map(function (o) { return String(o == null ? '' : o).trim(); }) : [];
        const ok = it && typeof it.question === 'string' && it.question.trim().length > 10 &&
          options.length === 4 && options.every(Boolean) &&
          new Set(options.map(normQ)).size === 4 &&
          Number.isInteger(it.correct_index) && it.correct_index >= 0 && it.correct_index < 4 &&
          typeof it.source_quote === 'string';
        const quote = ok ? normText(it.source_quote) : '';
        if (!ok || quote.length < 15 || haystack.indexOf(quote) < 0) { stats.rejected++; return; }   // the quoted passage must really exist in the file
        const key = normQ(it.question);
        if (existing[key]) { stats.duplicates++; return; }
        existing[key] = 1;
        stems.push(it.question.trim().slice(0, 110));
        const mixed = shuffleOptions(options, it.correct_index);
        rows.push({
          course_id: courseId,
          question: it.question.trim(),
          options: mixed.options,
          correct_index: mixed.correct_index,
          explanation: (it.explanation || '').toString().trim() || null,
          difficulty: ['easy', 'medium', 'hard'].indexOf(it.difficulty) > -1 ? it.difficulty : null,
          source_material_id: matKey,
          source_quote: it.source_quote.trim().slice(0, 400),
          ai_generated: true,
          svg: cleanSvg(it.svg)
        });
      });
      return rows;
    }

    function buildPrompt(chunk, n) {
      const avoid = stems.slice(-60).map(function (s) { return '- ' + s; }).join('\n');
      return 'Course: ' + course.title + (course.code ? ' (' + course.code + ')' : '') + '\n' +
        'Material: ' + (mat.title || 'File') + '\n\n' +
        'Write ' + n + ' multiple-choice questions (fewer if the material does not support that many) using ONLY the text between the <material> tags.\n' +
        'Rules:\n' +
        '- Cover many different facts. Never write two questions about the same fact.\n' +
        '- Each question has exactly 4 options and exactly one correct option.\n' +
        '- "source_quote" must be copied word for word from the material (15 to 200 characters) and must support the correct answer. It must stay plain text copied from the material, never LaTeX.\n' +
        '- Do not mention "the text", "the slide" or "the material" inside a question.\n' +
        '- "difficulty" is one of easy, medium, hard. Mix them. "explanation" is one or two sentences.\n' +
        '- "correct_index" is the position of the correct option, starting at 0.\n' +
        '- Write all maths, formulas and chemical equations in LaTeX. Inline: \\( ... \\)  On its own line: \\[ ... \\]  Chemistry: \\(\\ce{H2SO4}\\). Never use a single dollar sign for maths. Inside the JSON every backslash must be doubled.\n' +
        '- Add "svg" only when a question truly needs a diagram you can draw exactly (triangles, number lines, simple angles): a small clean <svg viewBox="0 0 400 300"> with dark strokes, no scripts, no images, under 6000 characters. Otherwise leave "svg" out.\n' +
        (avoid ? '- These questions already exist. Do not repeat or reword them:\n' + avoid + '\n' : '') +
        'Return a JSON array only, in this shape:\n' +
        '[{"question":"","options":["","","",""],"correct_index":0,"explanation":"","difficulty":"easy","source_quote":""}]\n\n' +
        '<material>\n' + chunk + '\n</material>';
    }

    async function pass(chunks, perChunk) {
      let next = 0;
      async function worker() {
        while (next < chunks.length && stats.saved < need) {
          const i = next++;
          try {
            const items = parseJsonArray(await askGemini(buildPrompt(chunks[i], perChunk)));
            const rows = validateAndKeep(items);
            if (rows.length) { await insertQuestions(rows); stats.saved += rows.length; }
          } catch (e) {
            stats.apiErrors++; stats.lastError = e.message || 'Unknown error';
            if (/not valid/i.test(stats.lastError)) next = chunks.length;   // bad keys will fail every call: stop now
          }
        }
      }
      await Promise.all(Array.from({ length: GEN_CONCURRENCY }, worker));
    }

    // Pass 1: split the file into parts and write about 10 to 15 questions per part (asking for a few extra, since weak ones are thrown away).
    // Long files get more parts so every part stays small and fast.
    const parts = Math.min(Math.max(Math.ceil(need / 10), Math.ceil(text.length / 70000), 1), 16);
    const chunks = splitText(text, parts);
    await pass(chunks, Math.min(Math.max(Math.ceil(need / parts * 1.35), 5), 30));

    // Pass 2: top up whatever is still missing.
    const missing = need - stats.saved;
    if (missing >= 3 && stats.lastError.indexOf('not valid') < 0) {
      await pass(chunks, Math.min(Math.max(Math.ceil(missing / parts * 1.6), 3), 25));
    }

    const total = have + stats.saved;
    let status = 'done', note = null;
    if (total < target * 0.9) {
      if (stats.apiErrors > 0) { status = 'partial'; note = stats.lastError; }          // will be retried automatically later
      else { note = 'This file only supports about ' + total + ' good questions.'; }      // nothing more to get from it
    }
    await setStatus(mat.id, { qgen_status: status, qgen_count: total, qgen_error: note });
    finished = true;
    if (!stats.saved && stats.apiErrors > 0) throw new HttpError(502, stats.lastError);
    return { saved: stats.saved, rejected: stats.rejected, duplicates: stats.duplicates, total: total, course_title: course.title };
  } catch (e) {
    // Never leave a file stuck on "processing" if something unexpected went wrong.
    if (!finished) await setStatus(mat.id, { qgen_status: 'failed', qgen_error: (e && e.message) || 'Question writing failed.' });
    throw e;
  }
}

/* ---------- fix old questions: plain-text maths -> LaTeX ---------- */
// Finds equations written as plain text (x^2, sqrt(3), 1/2, H2SO4 ...) in questions that have no LaTeX yet.
const HAS_LATEX = /\\\(|\\\[|\$/;
const MATHY = /(\^|\u221a|\u222b|\u2211|\u03c0|\u2264|\u2265|\u2248|\u2192|\u21cc|\bsqrt\b|\bfrac\b|\b(?:sin|cos|tan|log|ln|lim)\b|[0-9a-z)]\s*[=<>]\s*[-0-9a-z(]|\d\s*\/\s*\d|\b[A-Z][a-z]?\d|\bd[xy]\s*\/\s*d[xy]\b)/;
function needsMathFix(r) {
  if (!r || typeof r.question !== 'string' || !Array.isArray(r.options) || !r.options.every(function (o) { return typeof o === 'string'; })) return false;
  const all = [r.question, r.explanation || ''].concat(r.options).join('\n');
  if (HAS_LATEX.test(all)) return false;
  return MATHY.test(all);
}
// Safety check: the rewrite must keep (almost) all the ordinary words of the original, so the meaning cannot drift.
function wordsKept(a, b) {
  const words = String(a || '').toLowerCase().match(/[a-z]{4,}/g) || [];
  if (!words.length) return true;
  const low = String(b || '').toLowerCase();
  let kept = 0;
  words.forEach(function (w) { if (low.indexOf(w) > -1) kept++; });
  return kept / words.length >= 0.8;
}

/* ---------- automatic runs ---------- */
// Picks the course a material belongs to. Several courses can share one code (e.g. three "CHM 101" courses),
// so when the code is not enough the words of the file name are compared with each course title.
function titleScore(c, hay) {
  const toks = normText(c.title).split(' ').filter(function (t) { return t.length >= 4; });
  if (!toks.length) return 0;
  let hit = 0;
  toks.forEach(function (t) { if (hay.indexOf(t) > -1 || (t.length >= 7 && hay.indexOf(t.slice(0, 6)) > -1)) hit++; });
  return hit / toks.length;
}
function pickCourse(mat, courses) {
  const want = normText(mat.course), title = normText(mat.title);
  let cands = [];
  if (want) {
    cands = courses.filter(function (c) { return normText(c.title) === want; });
    if (!cands.length) cands = courses.filter(function (c) { return normText(c.code) === want; });
    if (!cands.length) cands = courses.filter(function (c) { const k = normText(c.code); return k && want.indexOf(k) > -1; });
  }
  if (!cands.length) cands = courses.filter(function (c) { const k = normText(c.code); return k && (' ' + title + ' ').indexOf(' ' + k + ' ') > -1; });
  if (cands.length <= 1) return { course: cands[0] || null };
  const hay = ' ' + normText((mat.title || '') + ' ' + (mat.topic || '')) + ' ';
  const scored = cands.map(function (c) { return { c: c, s: titleScore(c, hay) }; }).sort(function (a, b) { return b.s - a.s; });
  if (scored[0].s >= 0.5 && scored[0].s > scored[1].s) return { course: scored[0].c };
  return { course: null, ambiguous: cands };
}
async function courseForMaterial(mat) {
  const courses = (await sb('/rest/v1/courses?select=id,title,code&limit=1000')).data || [];
  return pickCourse(mat, courses);
}

async function autoGenerate(matId) {
  const key = String(matId);
  if (!(await hasKeys()) || !tryLock(key)) return null;
  try {
    const mat = ((await sb('/rest/v1/materials?id=eq.' + enc(matId) + '&select=*')).data || [])[0];
    if (!mat || !isPdfUrl(mat.file_url) || mat.qgen_status === 'done' || recentlyProcessing(mat)) return null;
    const picked = await courseForMaterial(mat);
    if (picked.ambiguous) {
      await setStatus(mat.id, { qgen_status: 'failed', qgen_error: 'Several courses share the code "' + (mat.course || '') + '". Open Questions and use "Questions from PDFs" on the exact course.' });
      return null;
    }
    if (!picked.course) {
      await setStatus(mat.id, { qgen_status: 'failed', qgen_error: 'No course matches "' + (mat.course || mat.title || '') + '". Create a course with that code or title, then press Make questions.' });
      return null;
    }
    return await generateForMaterial(mat, picked.course.id);
  } catch (e) {
    console.error('auto generate failed:', e && e.message);
    return null;
  } finally { unlock(key); }
}

// Picks up any file that has no questions yet (or a stuck / half-finished run). One file at a time.
async function sweep() {
  if (!(await hasKeys())) return;
  let rows;
  try {
    rows = (await sb('/rest/v1/materials?select=id,file_url,qgen_status,qgen_started_at&or=(qgen_status.is.null,qgen_status.eq.partial,qgen_status.eq.processing)&limit=25')).data || [];
  } catch (e) { return; }   // setup.sql has not been run yet
  const stale = Date.now() - RUN_STALE_MS;
  for (const m of rows) {
    if (!isPdfUrl(m.file_url)) { await setStatus(m.id, { qgen_status: 'skipped' }); continue; }
    if (m.qgen_status && m.qgen_started_at && new Date(m.qgen_started_at).getTime() > stale) continue;
    await autoGenerate(m.id);
    return;
  }
}

/* ---------- file uploads (Supabase Storage) ---------- */
let bucketReady = false;
async function ensureBucket() {
  if (bucketReady) return;
  try {
    await sb('/storage/v1/bucket/' + enc(BUCKET));
  } catch (e) {
    try { await sb('/storage/v1/bucket', { method: 'POST', body: { id: BUCKET, name: BUCKET, public: true } }); }
    catch (e2) {
      if (!/already exists|duplicate/i.test(e2.message)) throw new HttpError(500, 'Could not create the "' + BUCKET + '" storage bucket: ' + e2.message);
    }
  }
  bucketReady = true;
}
async function signUpload(path) {
  const r = await sb('/storage/v1/object/upload/sign/' + BUCKET + '/' + enc(path), { method: 'POST', body: {} });
  const d = r.data || {};
  let signed = d.url || d.signedURL || d.signedUrl || '';
  if (!signed) throw new HttpError(502, 'Storage did not return an upload link.');
  if (signed.indexOf('http') !== 0) {
    if (signed.indexOf('/storage/v1') !== 0) signed = '/storage/v1' + (signed.charAt(0) === '/' ? '' : '/') + signed;
    signed = URL_ + signed;
  }
  return signed;
}

/* ---------- actions ---------- */
const actions = {
  async status(req) {
    const cfg = await getConfig();
    const tok = readToken(req);
    return { setup: !!cfg, authed: !!(cfg && tok && tok.v === cfg.pin_version) };
  },

  async setup(req, res, b) {
    if (await getConfig()) throw new HttpError(409, 'A PIN already exists. Enter it to sign in.');
    if (!/^\d{4}$/.test(String(b.pin))) throw new HttpError(400, 'PIN must be exactly 4 digits.');
    await sb('/rest/v1/admin_config', { method: 'POST', body: { id: 1, pin_hash: hashPin(String(b.pin)), pin_version: 1 } });
    setCookie(res, makeToken(1), WEEK);
    return { ok: true };
  },

  async login(req, res, b) {
    const cfg = await getConfig();
    if (!cfg) throw new HttpError(409, 'No PIN yet.');
    if (cfg.locked_until && new Date(cfg.locked_until) > new Date()) throw new HttpError(429, 'Too many wrong tries. Wait 15 minutes.');
    if (!/^\d{4}$/.test(String(b.pin)) || !checkPin(String(b.pin), cfg.pin_hash)) {
      const fails = (cfg.failed_attempts || 0) + 1;
      const patch = fails >= 5 ? { failed_attempts: 0, locked_until: new Date(Date.now() + 15 * 60000).toISOString() } : { failed_attempts: fails };
      await sb('/rest/v1/admin_config?id=eq.1', { method: 'PATCH', body: patch });
      throw new HttpError(401, 'Wrong PIN.');
    }
    await sb('/rest/v1/admin_config?id=eq.1', { method: 'PATCH', body: { failed_attempts: 0, locked_until: null } });
    setCookie(res, makeToken(cfg.pin_version), WEEK);
    return { ok: true };
  },

  async logout(req, res) { setCookie(res, '', 0); return { ok: true }; },

  async change_pin(req, res, b) {
    const cfg = await requireAuth(req);
    if (!checkPin(String(b.current), cfg.pin_hash)) throw new HttpError(400, 'Current PIN is wrong.');
    if (!/^\d{4}$/.test(String(b.pin))) throw new HttpError(400, 'PIN must be exactly 4 digits.');
    const v = cfg.pin_version + 1;
    await sb('/rest/v1/admin_config?id=eq.1', { method: 'PATCH', body: { pin_hash: hashPin(String(b.pin)), pin_version: v } });
    setCookie(res, makeToken(v), WEEK);
    return { ok: true };
  },

  async stats(req) {
    await requireAuth(req);
    background(sweep());   // automatically writes questions for any file that still has none
    const since = new Date(Date.now() - 5 * 60000).toISOString();
    const r = await Promise.all([
      safeCount('profiles', '&last_seen=gte.' + enc(since)), safeCount('profiles'), safeCount('test_results'), safeCount('questions'),
      safeCount('courses'), safeCount('materials'), safeCount('discussion_posts'), safeCount('support_tickets'),
      safeCount('reviews', '&status=eq.new')
    ]);
    return { online: r[0], students: r[1], tests: r[2], questions: r[3], courses: r[4], materials: r[5], posts: r[6], tickets: r[7], reviews: r[8] };
  },

  async students(req) {
    await requireAuth(req);
    const prof = (await sb('/rest/v1/profiles?select=*&limit=5000')).data || [];
    const users = {};
    try {
      const u = (await sb('/auth/v1/admin/users?per_page=1000')).data;
      (u.users || []).forEach(function (x) { users[x.id] = x; });
    } catch (e) { /* profiles alone is fine */ }
    const out = prof.map(function (p) {
      const u = users[p.id] || {}, meta = u.user_metadata || {};
      return {
        id: p.id,
        name: p.full_name || p.name || meta.full_name || meta.name || '',
        email: p.email || u.email || '',
        phone: p.phone || u.phone || '',
        institution: p.institution || p.school || '',
        department: p.department || '',
        level: p.level || '',
        plan: p.plan || '',
        xp: p.xp || 0,
        streak: p.streak || 0,
        exam_date: p.exam_date || '',
        provider: (u.app_metadata && u.app_metadata.provider) || '',
        joined: p.created_at || u.created_at || null,
        last_seen: p.last_seen || u.last_sign_in_at || null
      };
    });
    out.sort(function (a, b) { return String(b.last_seen || '').localeCompare(String(a.last_seen || '')); });
    return { students: out };
  },

  async list(req, res, b) {
    await requireAuth(req);
    const t = tableOf(b.table);
    const limit = Math.min(Math.max(parseInt(b.limit, 10) || 30, 1), 500);
    const offset = Math.max(parseInt(b.offset, 10) || 0, 0);
    let qs = '?select=*&limit=' + limit + '&offset=' + offset + '&order=' + t.order + '.' + (t.asc ? 'asc' : 'desc');
    const groups = [];
    const q = clean(b.q);
    if (q) groups.push(t.search.map(function (c) { return c + '.ilike.*' + enc(q) + '*'; }).join(','));
    // A filter value may be plain text (e.g. "WMA 201"), so spaces are fine. Quotes, slashes and control characters are not.
    const okVal = function (s) { return typeof s === 'string' && s.length > 0 && s.length <= 120 && !/[\u0000-\u001f"\\]/.test(s); };
    const okOr = function (s) { return okVal(s) && !/[,()*%]/.test(s); };
    Object.keys(b.filters || {}).forEach(function (k) {
      if (!/^[a-z_]+$/.test(k)) return;
      const v = b.filters[k];
      if (Array.isArray(v)) {
        // several accepted spellings (e.g. course code OR course title), case-insensitive
        const vals = v.map(String).filter(okOr).slice(0, 6);
        if (vals.length === 1) qs += '&' + k + '=ilike.' + enc(vals[0]);
        else if (vals.length > 1) groups.push(vals.map(function (x) { return k + '.ilike.' + enc(x); }).join(','));
      } else if (okVal(String(v))) {
        qs += '&' + k + '=eq.' + enc(String(v));
      }
    });
    if (groups.length === 1) qs += '&or=(' + groups[0] + ')';
    else if (groups.length > 1) qs += '&and=(' + groups.map(function (g) { return 'or(' + g + ')'; }).join(',') + ')';
    const r = await sb('/rest/v1/' + b.table + qs, { headers: { Prefer: 'count=exact' } });
    const total = parseInt((r.res.headers.get('content-range') || '').split('/')[1], 10) || 0;
    return { rows: r.data || [], total: total };
  },

  async save(req, res, b) {
    await requireAuth(req);
    const t = tableOf(b.table);
    const data = pick(b.data, t.cols);
    if (!Object.keys(data).length) throw new HttpError(400, 'Nothing to save.');
    // API keys: trim spaces so a pasted key never has hidden characters.
    if (b.table === 'api_keys' && 'key' in data) {
      data.key = String(data.key || '').trim();
      if (!data.key) throw new HttpError(400, 'Paste the API key.');
    }
    // The student site reads "category", so keep it in step with the material type.
    if (b.table === 'materials' && data.material_type && !data.category) data.category = data.material_type;
    // Questions: only keep a diagram that is a plain https image link or a clean SVG.
    if (b.table === 'questions') {
      if ('svg' in data) data.svg = cleanSvg(data.svg);
      if ('image_url' in data) data.image_url = /^https:\/\//i.test(String(data.image_url || '')) ? String(data.image_url).trim() : null;
    }
    async function write(body) {
      if (b.id) {
        if (!isId(String(b.id))) throw new HttpError(400, 'Bad id.');
        await sb('/rest/v1/' + b.table + '?id=eq.' + enc(b.id), { method: 'PATCH', body: body });
        return b.id;
      }
      const r = await sb('/rest/v1/' + b.table, { method: 'POST', body: body, headers: b.table === 'materials' ? { Prefer: 'return=representation' } : {} });
      return r.data && r.data[0] ? r.data[0].id : null;
    }
    let savedId = null;
    try {
      savedId = await write(data);
    } catch (e) {
      // If the "category" column has not been added in Supabase yet, save without it.
      if (b.table === 'materials' && 'category' in data && /category|schema cache/i.test(e.message)) {
        const rest = Object.assign({}, data); delete rest.category;
        savedId = await write(rest);
      } else if (b.table === 'questions' && ('svg' in data || 'image_url' in data) && /svg|image_url|schema cache/i.test(e.message)) {
        // The image_url / svg columns have not been added in Supabase yet: save the question without them.
        const rest = Object.assign({}, data); delete rest.svg; delete rest.image_url;
        savedId = await write(rest);
      } else if (b.table === 'api_keys' && /duplicate|unique/i.test(e.message)) {
        throw new HttpError(400, 'This API key is already saved.');
      } else throw e;
    }
    // A readable file was added: write its questions automatically in the background.
    if (b.table === 'materials' && savedId != null && isPdfUrl(data.file_url)) background(autoGenerate(savedId));
    return { ok: true, id: savedId };
  },

  async remove(req, res, b) {
    await requireAuth(req);
    const t = tableOf(b.table);
    if (!t.del) throw new HttpError(400, 'This cannot be deleted here.');
    if (!isId(String(b.id))) throw new HttpError(400, 'Bad id.');
    await sb('/rest/v1/' + b.table + '?id=eq.' + enc(b.id), { method: 'DELETE' });
    return { ok: true };
  },

  // Gives the admin page a one-time link to upload a file straight to Supabase Storage,
  // and the public link to save in the "File link" box.
  async upload_url(req, res, b) {
    await requireAuth(req);
    const original = String(b.name || 'file');
    const ext = (original.split('.').pop() || '').toLowerCase();
    if (UPLOAD_EXT.indexOf(ext) < 0) throw new HttpError(400, 'This file type is not allowed.');
    const base = original.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'file';
    const path = Date.now() + '-' + crypto.randomBytes(3).toString('hex') + '-' + base + '.' + ext;

    await ensureBucket();
    let signedUrl;
    try {
      signedUrl = await signUpload(path);
    } catch (e) {
      // Bucket may have been removed after we cached it: create it again and retry once.
      if (/not found|does not exist|related resource/i.test(e.message)) {
        bucketReady = false;
        await ensureBucket();
        signedUrl = await signUpload(path);
      } else throw e;
    }
    return { signedUrl: signedUrl, publicUrl: URL_ + '/storage/v1/object/public/' + BUCKET + '/' + enc(path) };
  },

  // The "Make questions" button. Questions are normally written automatically when a file is saved,
  // so if a run is already in progress this answers "busy" (not an error) instead of starting a second one.
  async generate_questions(req, res, b) {
    await requireAuth(req);
    if (!(await hasKeys())) throw new HttpError(500, 'No Gemini API key found. Open the API Keys section in this panel and add one.');
    if (!isId(String(b.course_id)) || !isId(String(b.material_id))) throw new HttpError(400, 'Missing course or material.');
    const mat = ((await sb('/rest/v1/materials?id=eq.' + enc(b.material_id) + '&select=*')).data || [])[0];
    if (!mat) throw new HttpError(400, 'Material not found.');
    const key = String(mat.id);
    // The server decides the course, so questions always go to the course the file really belongs to.
    const picked = await courseForMaterial(mat);
    let courseId = b.course_id;
    if (picked.course) courseId = picked.course.id;
    else if (picked.ambiguous) {
      // Several courses share this code. Only an explicit choice (the "Questions from PDFs" button) decides.
      const chosen = b.chosen ? picked.ambiguous.filter(function (c) { return String(c.id) === String(b.course_id); })[0] : null;
      if (!chosen) throw new HttpError(409, 'Several courses share the code "' + (mat.course || '') + '" (' + picked.ambiguous.map(function (c) { return c.title; }).join(', ') + '). Open Questions and use "Questions from PDFs" on the exact course.');
      courseId = chosen.id;
    }
    const busy = { saved: 0, rejected: 0, duplicates: 0, total: 0, busy: true };
    if (recentlyProcessing(mat)) return busy;
    if (!tryLock(key)) return busy;
    try {
      const out = await generateForMaterial(mat, courseId, { text: String(b.text || '').slice(0, MAX_TEXT) });
      return { saved: out.saved, rejected: out.rejected, duplicates: out.duplicates, total: out.total, already: !!out.already, course_title: out.course_title };
    } finally { unlock(key); }
  },

  // Rewrites OLD questions that show maths as plain text (x^2, sqrt(3), H2SO4 ...) in LaTeX, a few at a time.
  // The admin page calls this again and again with the returned "next_after" until "done" is true.
  // Options keep their order, so the correct answer stays correct. Nothing is changed unless the ordinary words survive.
  async fix_math(req, res, b) {
    await requireAuth(req);
    if (!(await hasKeys())) throw new HttpError(500, 'No Gemini API key found. Open the API Keys section in this panel and add one.');
    const ids = Array.isArray(b.course_ids) ? b.course_ids.map(String).filter(isId).slice(0, 200) : [];
    const limit = Math.min(Math.max(parseInt(b.limit, 10) || 12, 1), 20);
    let cursor = b.after ? String(b.after) : '';
    if (cursor && !isId(cursor)) throw new HttpError(400, 'Bad position.');
    const filter = ids.length ? '&course_id=in.(' + ids.map(enc).join(',') + ')' : '';

    // collect up to `limit` questions that still show maths as plain text
    const batch = [];
    let scanned = 0, done = false, filled = false;
    for (let guard = 0; guard < 10 && !filled && !done; guard++) {
      const rows = (await sb('/rest/v1/questions?select=id,question,options,explanation&order=id.asc&limit=100' + (cursor ? '&id=gt.' + enc(cursor) : '') + filter)).data || [];
      if (!rows.length) { done = true; break; }
      for (const r of rows) {
        cursor = String(r.id); scanned++;
        if (needsMathFix(r)) { batch.push(r); if (batch.length >= limit) { filled = true; break; } }
      }
      if (!filled && rows.length < 100) done = true;
    }
    if (!batch.length) return { scanned: scanned, changed: 0, rejected: 0, next_after: cursor, done: done };

    const payload = batch.map(function (r) { return { id: String(r.id), question: r.question, options: r.options, explanation: r.explanation || '' }; });
    const prompt =
      'Below are exam questions as a JSON array. Some write mathematics, formulas or chemical equations as plain text (for example x^2, sqrt(3), 1/2, H2SO4).\n' +
      'Rewrite ONLY those mathematical parts in LaTeX: inline \\( ... \\), on its own line \\[ ... \\], chemistry \\(\\ce{H2SO4}\\). Never use a single dollar sign.\n' +
      'Rules: keep every ordinary word, the meaning, the number of options and their ORDER exactly the same. Do not solve, correct, shorten or reword anything. ' +
      'If an item needs no LaTeX, return it unchanged. Return ALL the items with the same "id". Inside the JSON every backslash must be doubled.\n\n' +
      JSON.stringify(payload);
    const body = {
      systemInstruction: { parts: [{ text: 'You are a careful LaTeX typesetter for university exam questions. Reply with a JSON array only, no other text.' }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 16000,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { id: { type: 'STRING' }, question: { type: 'STRING' }, options: { type: 'ARRAY', items: { type: 'STRING' } }, explanation: { type: 'STRING' } },
            required: ['id', 'question', 'options', 'explanation']
          }
        }
      }
    };
    const out = parseJsonArray(await askGemini('', body));
    if (!out) throw new HttpError(502, 'The maths fixer returned an unreadable answer. Try again.');
    const byId = {};
    out.forEach(function (it) { if (it && it.id != null) byId[String(it.id)] = it; });

    let changed = 0, rejected = 0;
    for (const r of batch) {
      const it = byId[String(r.id)];
      const okShape = it && typeof it.question === 'string' && it.question.trim() &&
        Array.isArray(it.options) && it.options.length === r.options.length &&
        it.options.every(function (o) { return typeof o === 'string' && o.trim(); });
      if (!okShape) { rejected++; continue; }
      const expl = String(it.explanation || '').trim();
      const same = it.question.trim() === String(r.question).trim() &&
        it.options.every(function (o, i) { return o.trim() === String(r.options[i]).trim(); }) &&
        (!expl || expl === String(r.explanation || '').trim());
      if (same) continue;
      const kept = wordsKept(r.question, it.question) &&
        r.options.every(function (o, i) { return wordsKept(o, it.options[i]); }) &&
        (!r.explanation || !expl || wordsKept(r.explanation, expl));
      if (!kept) { rejected++; continue; }
      const patch = { question: it.question.trim(), options: it.options.map(function (o) { return o.trim(); }) };
      if (expl && r.explanation) patch.explanation = expl;
      await sb('/rest/v1/questions?id=eq.' + enc(String(r.id)), { method: 'PATCH', body: patch });
      changed++;
    }
    return { scanned: scanned, changed: changed, rejected: rejected, next_after: cursor, done: done };
  },

  // Moves questions that were filed under the wrong course (e.g. another course with the same code) to the right one.
  async refile_questions(req) {
    await requireAuth(req);
    const courses = (await sb('/rest/v1/courses?select=id,title,code&limit=1000')).data || [];
    const mats = (await sb('/rest/v1/materials?select=id,title,course,topic&limit=1000')).data || [];
    let moved = 0, unclear = 0;
    for (const m of mats) {
      const r = pickCourse(m, courses);
      if (!r.course) { if (r.ambiguous) unclear++; continue; }
      const f = '&source_material_id=eq.' + enc(String(m.id)) + '&course_id=neq.' + enc(r.course.id);
      const wrong = await safeCount('questions', f);
      if (!wrong) continue;
      await sb('/rest/v1/questions?select=id' + f, { method: 'PATCH', body: { course_id: r.course.id } });
      moved += wrong;
    }
    return { moved: moved, unclear: unclear };
  },

  // Shows, for every file that has written questions, which course those questions are filed under.
  async question_sources(req) {
    await requireAuth(req);
    const courses = (await sb('/rest/v1/courses?select=id,title,code&limit=1000')).data || [];
    const mats = (await sb('/rest/v1/materials?select=id,title&limit=1000')).data || [];
    const byMat = {};
    for (let off = 0; off < 50000; off += 1000) {
      const rows = (await sb('/rest/v1/questions?select=source_material_id,course_id&source_material_id=not.is.null&order=id.asc&limit=1000&offset=' + off)).data || [];
      rows.forEach(function (r) { const k = String(r.source_material_id); byMat[k] = byMat[k] || {}; byMat[k][r.course_id] = (byMat[k][r.course_id] || 0) + 1; });
      if (rows.length < 1000) break;
    }
    const label = {}; courses.forEach(function (c) { label[c.id] = (c.code ? c.code + ' - ' : '') + c.title; });
    return {
      materials: mats.filter(function (m) { return byMat[String(m.id)]; }).map(function (m) {
        return { id: m.id, title: m.title, where: Object.keys(byMat[String(m.id)]).map(function (cid) { return { course_id: cid, title: label[cid] || 'A course that no longer exists', count: byMat[String(m.id)][cid] }; }) };
      }),
      courses: courses.map(function (c) { return { id: c.id, label: label[c.id] }; })
    };
  },

  async move_material_questions(req, res, b) {
    await requireAuth(req);
    if (!isId(String(b.material_id)) || !isId(String(b.course_id))) throw new HttpError(400, 'Choose a file and a course.');
    const f = '&source_material_id=eq.' + enc(String(b.material_id)) + '&course_id=neq.' + enc(String(b.course_id));
    const n = await safeCount('questions', f);
    if (n) await sb('/rest/v1/questions?select=id' + f, { method: 'PATCH', body: { course_id: b.course_id } });
    return { moved: n };
  },

  // Courses that share one code (e.g. several CHM 101 topics) with how many questions each has.
  async duplicate_courses(req) {
    await requireAuth(req);
    const courses = (await sb('/rest/v1/courses?select=id,title,code&limit=1000')).data || [];
    const groups = {};
    courses.forEach(function (c) { const k = normText(c.code); if (!k) return; (groups[k] = groups[k] || []).push(c); });
    const out = [];
    for (const k of Object.keys(groups)) {
      if (groups[k].length < 2) continue;
      const list = [];
      for (const c of groups[k]) list.push({ id: c.id, title: c.title, questions: await safeCount('questions', '&course_id=eq.' + enc(String(c.id))) });
      list.sort(function (a, b) { return b.questions - a.questions; });
      out.push({ code: String(groups[k][0].code).trim(), courses: list });
    }
    return { groups: out };
  },

  // Merges courses that share a code into one: every question moves to the course being kept, the others are removed.
  async merge_courses(req, res, b) {
    await requireAuth(req);
    const ids = Array.isArray(b.ids) ? b.ids.map(String) : [];
    if (ids.length < 2 || !ids.every(isId) || !isId(String(b.keep)) || ids.indexOf(String(b.keep)) < 0) throw new HttpError(400, 'Choose the courses to merge.');
    const rows = (await sb('/rest/v1/courses?select=id,code&id=in.(' + ids.map(enc).join(',') + ')')).data || [];
    const codes = {}; rows.forEach(function (r) { codes[normText(r.code)] = 1; });
    if (rows.length !== ids.length || Object.keys(codes).length !== 1 || !Object.keys(codes)[0]) throw new HttpError(400, 'Only courses with the same code can be merged.');
    const keep = String(b.keep), title = String(b.title || '').trim().slice(0, 150);
    let moved = 0, removed = 0, notRemoved = 0;
    for (const id of ids.filter(function (x) { return x !== keep; })) {
      const n = await safeCount('questions', '&course_id=eq.' + enc(id));
      if (n) await sb('/rest/v1/questions?course_id=eq.' + enc(id), { method: 'PATCH', body: { course_id: b.keep } });
      moved += n;
      try { await sb('/rest/v1/courses?id=eq.' + enc(id), { method: 'DELETE' }); removed++; }
      catch (e) { notRemoved++; }   // something else still points at it: the questions are already moved, so it is just left empty
    }
    if (title) await sb('/rest/v1/courses?id=eq.' + enc(keep), { method: 'PATCH', body: { title: title } });
    return { moved: moved, removed: removed, notRemoved: notRemoved };
  },

  // Materials are filed by course code only: a material saved under a course title is switched to that course's code.
  async normalize_material_courses(req) {
    await requireAuth(req);
    const courses = (await sb('/rest/v1/courses?select=title,code&limit=1000')).data || [];
    const mats = (await sb('/rest/v1/materials?select=id,course&limit=2000')).data || [];
    const byTitle = {};
    courses.forEach(function (c) { if (c.code && c.title) byTitle[normText(c.title)] = String(c.code).trim(); });
    let changed = 0;
    for (const m of mats) {
      const t = normText(m.course), code = byTitle[t];
      if (code && normText(code) !== t) {
        await sb('/rest/v1/materials?id=eq.' + enc(String(m.id)), { method: 'PATCH', body: { course: code } });
        changed++;
      }
    }
    return { changed: changed };
  },

  async notify(req, res, b) {
    await requireAuth(req);
    const title = String(b.title || '').trim().slice(0, 120);
    if (!title) throw new HttpError(400, 'Add a title.');
    const base = { title: title, body: String(b.body || '').slice(0, 600), type: ['info', 'exam', 'study', 'community', 'welcome', 'announcement'].indexOf(b.type) > -1 ? b.type : 'info' };
    let ids;
    if (b.to === 'all') ids = ((await sb('/rest/v1/profiles?select=id&limit=20000')).data || []).map(function (x) { return x.id; });
    else if (isId(String(b.to))) ids = [b.to];
    else throw new HttpError(400, 'Choose who to send to.');
    for (let i = 0; i < ids.length; i += 500) {
      await sb('/rest/v1/notifications', { method: 'POST', body: ids.slice(i, i + 500).map(function (id) { return Object.assign({ user_id: id }, base); }) });
    }
    return { sent: ids.length };
  },

  async notif_history(req) {
    await requireAuth(req);
    const rows = (await sb('/rest/v1/notifications?select=title,body,type,created_at&order=created_at.desc&limit=2000')).data || [];
    const groups = {}, order = [];
    rows.forEach(function (r) {
      const k = r.title + '\u0001' + (r.body || '');
      if (!groups[k]) { groups[k] = { title: r.title, body: r.body || '', type: r.type, count: 0, last_at: r.created_at }; order.push(k); }
      groups[k].count++;
    });
    return { items: order.slice(0, 30).map(function (k) { return groups[k]; }) };
  },

  async del_notifs(req, res, b) {
    await requireAuth(req);
    if (!b.title) throw new HttpError(400, 'Missing title.');
    const body = b.body ? 'body=eq.' + enc(b.body) : 'or=(body.is.null,body.eq.)';
    await sb('/rest/v1/notifications?title=eq.' + enc(b.title) + '&' + body, { method: 'DELETE' });
    return { ok: true };
  },

  async import_questions(req, res, b) {
    await requireAuth(req);
    if (!isId(String(b.course_id))) throw new HttpError(400, 'Choose a course.');
    const items = b.items;
    if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'No questions found.');
    if (items.length > 300) throw new HttpError(400, 'Import up to 300 questions at a time.');
    const rows = items.map(function (it, i) {
      const n = 'Question ' + (i + 1) + ': ';
      if (!it || typeof it.question !== 'string' || !it.question.trim()) throw new HttpError(400, n + 'missing "question".');
      if (!Array.isArray(it.options) || it.options.length < 2 || it.options.length > 8 || !it.options.every(function (o) { return typeof o === 'string' && o.trim(); })) throw new HttpError(400, n + '"options" needs 2 to 8 non-empty texts.');
      if (!Number.isInteger(it.correct_index) || it.correct_index < 0 || it.correct_index >= it.options.length) throw new HttpError(400, n + '"correct_index" must point at one of the options (first is 0).');
      const row = { course_id: b.course_id, question: it.question.trim(), options: it.options.map(function (o) { return o.trim(); }), correct_index: it.correct_index, explanation: it.explanation || null, difficulty: it.difficulty || null };
      // Optional diagram: an https image link or a clean SVG. Only sent when given, so older databases keep working.
      const img = /^https:\/\//i.test(String(it.image_url || '')) ? String(it.image_url).trim() : null;
      const svg = cleanSvg(it.svg);
      if (img) row.image_url = img;
      if (svg) row.svg = svg;
      return row;
    });
    try {
      await sb('/rest/v1/questions', { method: 'POST', body: rows });
    } catch (e) {
      // image_url / svg columns not added yet: save the questions without the diagrams
      if (/svg|image_url|schema cache/i.test(e.message)) {
        await sb('/rest/v1/questions', { method: 'POST', body: rows.map(function (r) { const c = Object.assign({}, r); delete c.svg; delete c.image_url; return c; }) });
      } else throw e;
    }
    return { added: rows.length };
  }
};

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed.' }); return; }
  if (!URL_ || !KEY || !SECRET || SECRET.length < 20) {
    res.status(500).json({ error: 'Admin is not set up on the server yet. Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_SESSION_SECRET in Vercel, then redeploy.' });
    return;
  }
  try {
    let b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    b = b || {};
    if (!Object.prototype.hasOwnProperty.call(actions, b.action)) throw new HttpError(400, 'Unknown action.');
    const out = await actions[b.action](req, res, b);
    res.status(200).json(out);
  } catch (e) {
    if (e instanceof HttpError) res.status(e.status).json({ error: e.message });
    else { console.error(e); res.status(500).json({ error: 'Something went wrong on the server.' }); }
  }
};
