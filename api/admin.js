// PRIME-CBT admin API  ->  put this file at  api/admin.js  (project root)
// Secrets come ONLY from Vercel Environment Variables. Never type keys in this file.
//   SUPABASE_URL                 e.g. https://xuofkjjhupgmrphzgyun.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    Supabase > Settings > API Keys > secret / service_role key
//   ADMIN_SESSION_SECRET         any long random text (40+ characters)
//   ANTHROPIC_API_KEY            needed for "Make questions" (console.anthropic.com > API keys)
//   STORAGE_BUCKET               (optional) Supabase Storage bucket for uploads. Defaults to "materials".
//   ANTHROPIC_MODEL              (optional) model used to write questions. Defaults to claude-sonnet-5-5.

const crypto = require('crypto');

const URL_ = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SECRET = process.env.ADMIN_SESSION_SECRET || '';
const BUCKET = process.env.STORAGE_BUCKET || 'materials';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const COOKIE = 'admin_session';
const WEEK = 7 * 24 * 3600;
const UPLOAD_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'];

// What the panel may touch. columns = fields it may write. search = fields the search box looks in.
const TABLES = {
  support_tickets: { cols: ['status'], search: ['subject', 'email', 'message'], order: 'created_at', del: true },
  courses: { cols: ['title', 'code', 'description'], search: ['title', 'code'], order: 'title', asc: true, del: true },
  questions: { cols: ['course_id', 'question', 'options', 'correct_index', 'explanation', 'difficulty'], search: ['question'], order: 'created_at', del: true },
  materials: { cols: ['title', 'course', 'topic', 'material_type', 'file_url', 'page_count', 'size_bytes'], search: ['title', 'course', 'topic'], order: 'created_at', del: true },
  achievements: { cols: ['title', 'slug', 'description', 'icon', 'metric', 'threshold', 'sort_order'], search: ['title', 'slug'], order: 'sort_order', asc: true, del: true },
  discussion_posts: { cols: ['title', 'body', 'is_pinned'], search: ['title', 'body'], order: 'created_at', del: true },
  discussion_replies: { cols: [], search: ['body'], order: 'created_at', asc: true, del: true },
  test_results: { cols: [], search: ['course_title', 'course_code'], order: 'created_at', del: false },
  schools: { cols: ['name', 'sort_order'], search: ['name'], order: 'sort_order', asc: true, del: true },
  departments: { cols: ['school_id', 'name', 'sort_order'], search: ['name'], order: 'sort_order', asc: true, del: true },
  levels: { cols: ['name', 'sort_order'], search: ['name'], order: 'sort_order', asc: true, del: true }
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

/* ---------- question writing from a PDF ---------- */
const normText = function (s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };

function parseJsonArray(text) {
  const start = text.indexOf('[');
  if (start < 0) return null;
  const end = text.lastIndexOf(']');
  if (end > start) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) { /* try to salvage below */ } }
  const lastObj = text.lastIndexOf('}');
  if (lastObj > start) { try { return JSON.parse(text.slice(start, lastObj + 1) + ']'); } catch (e) { /* give up */ } }
  return null;
}

async function askClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system: 'You write multiple-choice exam questions for university students strictly from the course material you are given. Never use outside knowledge. Reply with a JSON array only, no other text.',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json().catch(function () { return {}; });
  if (!res.ok) {
    const msg = (data && data.error && data.error.message) || 'The question writer is not available.';
    throw new HttpError(res.status === 401 ? 500 : 502, res.status === 401 ? 'The ANTHROPIC_API_KEY in Vercel is not valid.' : msg);
  }
  return ((data.content || []).filter(function (c) { return c.type === 'text'; }).map(function (c) { return c.text; })).join('');
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
    const since = new Date(Date.now() - 5 * 60000).toISOString();
    const r = await Promise.all([
      safeCount('profiles', '&last_seen=gte.' + enc(since)), safeCount('profiles'), safeCount('test_results'), safeCount('questions'),
      safeCount('courses'), safeCount('materials'), safeCount('discussion_posts'), safeCount('support_tickets')
    ]);
    return { online: r[0], students: r[1], tests: r[2], questions: r[3], courses: r[4], materials: r[5], posts: r[6], tickets: r[7] };
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
    const q = clean(b.q);
    if (q) qs += '&or=(' + t.search.map(function (c) { return c + '.ilike.*' + enc(q) + '*'; }).join(',') + ')';
    Object.keys(b.filters || {}).forEach(function (k) {
      if (/^[a-z_]+$/.test(k) && isId(String(b.filters[k]))) qs += '&' + k + '=eq.' + enc(b.filters[k]);
    });
    const r = await sb('/rest/v1/' + b.table + qs, { headers: { Prefer: 'count=exact' } });
    const total = parseInt((r.res.headers.get('content-range') || '').split('/')[1], 10) || 0;
    return { rows: r.data || [], total: total };
  },

  async save(req, res, b) {
    await requireAuth(req);
    const t = tableOf(b.table);
    const data = pick(b.data, t.cols);
    if (!Object.keys(data).length) throw new HttpError(400, 'Nothing to save.');
    if (b.id) {
      if (!isId(String(b.id))) throw new HttpError(400, 'Bad id.');
      await sb('/rest/v1/' + b.table + '?id=eq.' + enc(b.id), { method: 'PATCH', body: data });
    } else {
      await sb('/rest/v1/' + b.table, { method: 'POST', body: data });
    }
    return { ok: true };
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

  async generate_questions(req, res, b) {
    await requireAuth(req);
    if (!ANTHROPIC_KEY) throw new HttpError(500, 'Add ANTHROPIC_API_KEY in Vercel > Settings > Environment Variables, then redeploy.');
    if (!isId(String(b.course_id)) || !isId(String(b.material_id))) throw new HttpError(400, 'Missing course or material.');
    const text = String(b.text || '').slice(0, 150000);
    if (text.length < 200) throw new HttpError(400, 'This PDF has no readable text. Scanned PDFs cannot be used.');
    const count = Math.min(Math.max(parseInt(b.count, 10) || 20, 5), 40);

    const course = ((await sb('/rest/v1/courses?id=eq.' + enc(b.course_id) + '&select=title,code')).data || [])[0];
    if (!course) throw new HttpError(400, 'Course not found.');
    const mat = ((await sb('/rest/v1/materials?id=eq.' + enc(b.material_id) + '&select=title')).data || [])[0];

    const prompt = 'Course: ' + course.title + (course.code ? ' (' + course.code + ')' : '') + '\n' +
      'Material: ' + ((mat && mat.title) || 'PDF') + '\n\n' +
      'Write ' + count + ' multiple-choice questions (fewer if the material does not support that many) using ONLY the text between the <material> tags.\n' +
      'Rules:\n' +
      '- Each question has exactly 4 options and exactly one correct option.\n' +
      '- "source_quote" must be copied word for word from the material (15 to 200 characters) and must support the correct answer.\n' +
      '- Do not mention "the text", "the slide" or "the material" inside a question.\n' +
      '- "difficulty" is one of easy, medium, hard. "explanation" is one or two sentences.\n' +
      '- "correct_index" is the position of the correct option, starting at 0.\n' +
      'Return a JSON array only, in this shape:\n' +
      '[{"question":"","options":["","","",""],"correct_index":0,"explanation":"","difficulty":"easy","source_quote":""}]\n\n' +
      '<material>\n' + text + '\n</material>';

    const reply = await askClaude(prompt);
    const items = parseJsonArray(reply);
    if (!Array.isArray(items) || !items.length) throw new HttpError(502, 'The question writer returned nothing usable. Try again.');

    const haystack = normText(text);
    const existing = {};
    ((await sb('/rest/v1/questions?course_id=eq.' + enc(b.course_id) + '&select=question&limit=5000')).data || []).forEach(function (q) { existing[normText(q.question)] = 1; });

    let rejected = 0, duplicates = 0;
    const rows = [];
    items.forEach(function (it) {
      const ok = it && typeof it.question === 'string' && it.question.trim() &&
        Array.isArray(it.options) && it.options.length >= 2 && it.options.length <= 8 &&
        it.options.every(function (o) { return typeof o === 'string' && o.trim(); }) &&
        Number.isInteger(it.correct_index) && it.correct_index >= 0 && it.correct_index < it.options.length &&
        typeof it.source_quote === 'string';
      const quote = ok ? normText(it.source_quote) : '';
      if (!ok || quote.length < 15 || haystack.indexOf(quote) < 0) { rejected++; return; }
      const key = normText(it.question);
      if (existing[key]) { duplicates++; return; }
      existing[key] = 1;
      rows.push({
        course_id: b.course_id,
        question: it.question.trim(),
        options: it.options.map(function (o) { return o.trim(); }),
        correct_index: it.correct_index,
        explanation: (it.explanation || '').toString().trim() || null,
        difficulty: ['easy', 'medium', 'hard'].indexOf(it.difficulty) > -1 ? it.difficulty : null,
        source_quote: it.source_quote.trim().slice(0, 400),
        ai_generated: true
      });
    });

    if (rows.length) {
      try {
        await sb('/rest/v1/questions', { method: 'POST', body: rows });
      } catch (e) {
        // If the table has no source_quote / ai_generated columns yet, save without them.
        if (/column|schema cache/i.test(e.message)) {
          await sb('/rest/v1/questions', { method: 'POST', body: rows.map(function (r) { const c = Object.assign({}, r); delete c.source_quote; delete c.ai_generated; return c; }) });
        } else throw e;
      }
    }
    return { saved: rows.length, rejected: rejected, duplicates: duplicates };
  },

  async notify(req, res, b) {
    await requireAuth(req);
    const title = String(b.title || '').trim().slice(0, 120);
    if (!title) throw new HttpError(400, 'Add a title.');
    const base = { title: title, body: String(b.body || '').slice(0, 600), type: ['info', 'exam', 'study', 'community', 'welcome'].indexOf(b.type) > -1 ? b.type : 'info' };
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
      return { course_id: b.course_id, question: it.question.trim(), options: it.options.map(function (o) { return o.trim(); }), correct_index: it.correct_index, explanation: it.explanation || null, difficulty: it.difficulty || null };
    });
    await sb('/rest/v1/questions', { method: 'POST', body: rows });
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
