// Vercel Edge Function: /api/admin  (the WHOLE admin panel in one file)
//
// - Open  yoursite.com/api/admin  in your browser to see the panel (GET)
// - The panel talks back to this same address to read/write data (POST)
//
// - Checks your 4-digit PIN on the server (stored hashed, never in page code)
// - Locks out repeated wrong guesses
// - Gives you a signed login cookie so you stay signed in on your device
// - Reads and writes your Supabase data with the service key (kept secret here)
//
// Environment variables (Vercel -> Project -> Settings -> Environment Variables):
//   SUPABASE_SERVICE_ROLE_KEY  required  (Supabase -> Settings -> API keys -> secret / service_role)
//   ADMIN_SESSION_SECRET       required  (any long random text, 32+ characters)
//   SUPABASE_URL               optional  (defaults to your project URL)

export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xuofkjjhupgmrphzgyun.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';

const SESSION_DAYS = 7;          // how long you stay signed in on a device
const IP_MAX_TRIES = 5;          // wrong PINs from one device before it is locked
const GLOBAL_MAX_TRIES = 20;     // wrong PINs from everywhere before a safety lock
const PBKDF2_ITER = 100000;
const COOKIE = 'admin_session';
const DAY = 86400000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------- which tables the panel may touch ----------
const TABLES = {
  courses: {
    cols: ['title', 'code', 'description'], required: ['title'],
    order: 'created_at.desc', search: ['title', 'code'],
  },
  questions: {
    cols: ['course_id', 'question', 'options', 'correct_index', 'explanation', 'difficulty'],
    required: ['course_id', 'question'], nums: ['correct_index'],
    order: 'created_at.desc', search: ['question'], filters: ['course_id'],
  },
  materials: {
    cols: ['title', 'course', 'topic', 'material_type', 'file_url', 'page_count', 'size_bytes'],
    required: ['title', 'file_url'], nums: ['page_count', 'size_bytes'], touch: true,
    order: 'created_at.desc', search: ['title', 'course', 'topic'],
  },
  achievements: {
    cols: ['slug', 'title', 'description', 'icon', 'metric', 'threshold', 'sort_order'],
    required: ['slug', 'title', 'metric'], nums: ['threshold', 'sort_order'],
    order: 'sort_order.asc', search: ['title', 'slug'],
  },
  schools: { cols: ['name', 'sort_order'], required: ['name'], nums: ['sort_order'], order: 'sort_order.asc' },
  departments: {
    cols: ['school_id', 'name', 'sort_order'], required: ['school_id', 'name'], nums: ['sort_order'],
    order: 'sort_order.asc', search: ['name'], filters: ['school_id'],
  },
  levels: { cols: ['name', 'sort_order'], required: ['name'], nums: ['sort_order'], order: 'sort_order.asc' },
  discussion_posts: {
    cols: ['title', 'body', 'course', 'is_pinned'], required: ['title'], bools: ['is_pinned'], noInsert: true,
    order: 'created_at.desc', search: ['title', 'body', 'course'],
    cascade: [['discussion_reply_likes', 'post_id'], ['discussion_replies', 'post_id'], ['discussion_post_likes', 'post_id']],
  },
  discussion_replies: {
    cols: [], noInsert: true, noUpdate: true, order: 'created_at.asc', filters: ['post_id'],
    cascade: [['discussion_reply_likes', 'reply_id']],
  },
  support_tickets: {
    cols: ['status'], noInsert: true, order: 'created_at.desc',
    search: ['subject', 'email', 'message'], filters: ['status'],
  },
  test_results: {
    cols: [], noInsert: true, noUpdate: true, noDelete: true, order: 'created_at.desc',
    search: ['course_code', 'course_title'], filters: ['course_code'],
  },
};

// ---------- the admin panel page (served on GET) ----------
const PAGE = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, viewport-fit=cover\">\n  <meta name=\"robots\" content=\"noindex, nofollow\">\n  <title>PRIME-CBT Admin</title>\n  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n  <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n  <style>\n    :root {\n      --bg: #060b1a; --card: #0f172a; --card-2: #1e293b; --line: #334155;\n      --text: #f1f5f9; --muted: #94a3b8; --faint: #64748b;\n      --primary: #34d399; --primary-2: #10b981; --danger: #f87171; --amber: #fbbf24; --blue: #60a5fa;\n      --r: 14px;\n    }\n    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }\n    html, body { height: 100%; }\n    body { background: var(--bg); color: var(--text); -webkit-text-size-adjust: 100%; }\n    button { font: inherit; color: inherit; cursor: pointer; }\n    [hidden] { display: none !important; }\n    :focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }\n\n    /* ---------- PIN lock screen ---------- */\n    .lock { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; gap: 8px; }\n    .lock h1 { font-size: 1.35rem; font-weight: 700; margin-top: 8px; text-align: center; }\n    .lock .sub { color: var(--muted); font-size: .9rem; text-align: center; min-height: 1.3em; max-width: 280px; }\n    .lock .sub.err { color: var(--danger); }\n    .dots { display: flex; gap: 16px; margin: 22px 0 18px; }\n    .dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--line); transition: background .12s, border-color .12s; }\n    .dot.on { background: var(--primary); border-color: var(--primary); }\n    .dots.shake { animation: shake .35s; }\n    @keyframes shake { 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }\n    .pad { display: grid; grid-template-columns: repeat(3, 74px); gap: 14px; }\n    .pad button { height: 74px; border-radius: 50%; background: var(--card); border: 1px solid var(--line); font-size: 1.5rem; font-weight: 500; transition: background .12s, transform .08s; }\n    .pad button:active { background: var(--card-2); transform: scale(.94); }\n    .pad .ghost { background: none; border-color: transparent; font-size: 1.1rem; color: var(--muted); }\n    .pad button:disabled { opacity: .4; }\n    @media (prefers-reduced-motion: reduce) { .dots.shake { animation: none; } }\n\n    /* ---------- shell ---------- */\n    .app { max-width: 760px; margin: 0 auto; min-height: 100dvh; display: flex; flex-direction: column; }\n    .topbar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(6,11,26,.92); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }\n    .topbar h2 { flex: 1; font-size: 1.05rem; font-weight: 700; }\n    .iconbtn { width: 40px; height: 40px; border-radius: 50%; background: var(--card); border: 1px solid var(--line); display: grid; place-items: center; }\n    .iconbtn svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }\n    .content { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 14px; padding-bottom: 80px; }\n\n    .drawer-back { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 30; opacity: 0; pointer-events: none; transition: opacity .2s; }\n    .drawer { position: fixed; top: 0; bottom: 0; left: 0; width: min(300px, 84vw); background: var(--card); border-right: 1px solid var(--line); z-index: 31; transform: translateX(-100%); transition: transform .22s; overflow-y: auto; padding: 18px 12px 28px; }\n    body.menu-open .drawer { transform: none; }\n    body.menu-open .drawer-back { opacity: 1; pointer-events: auto; }\n    .brand { font-weight: 700; font-size: 1.1rem; padding: 4px 10px 14px; }\n    .brand small { display: block; color: var(--muted); font-weight: 500; font-size: .78rem; margin-top: 2px; }\n    .nav-group { color: var(--faint); font-size: .76rem; font-weight: 600; padding: 14px 10px 6px; }\n    .nav { display: block; width: 100%; text-align: left; background: none; border: 0; padding: 11px 10px; border-radius: 10px; font-size: .95rem; color: var(--text); }\n    .nav:hover { background: var(--card-2); }\n    .nav.active { background: rgba(52,211,153,.14); color: var(--primary); font-weight: 600; }\n\n    /* ---------- common bits ---------- */\n    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; }\n    .toolbar input, .toolbar select { flex: 1 1 150px; min-width: 0; }\n    input, select, textarea { width: 100%; background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 10px; padding: 11px 12px; font-size: .95rem; }\n    textarea { resize: vertical; line-height: 1.45; }\n    input::placeholder, textarea::placeholder { color: var(--faint); }\n    select { appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%); background-position: calc(100% - 18px) 55%, calc(100% - 13px) 55%; background-size: 5px 5px; background-repeat: no-repeat; padding-right: 32px; }\n    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 16px; border-radius: 10px; border: 1px solid var(--line); background: var(--card); font-weight: 600; font-size: .92rem; }\n    .btn:active { transform: scale(.98); }\n    .btn.primary { background: linear-gradient(135deg, #34d399, #10b981); color: #052e1f; border: 0; }\n    .btn.danger { color: var(--danger); }\n    .btn.small { padding: 7px 11px; font-size: .82rem; border-radius: 8px; }\n    .btn:disabled { opacity: .5; }\n\n    .card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 14px; }\n    .row { display: flex; gap: 10px; align-items: flex-start; background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 13px 14px; }\n    .row.tap { cursor: pointer; }\n    .row.tap:hover { background: var(--card-2); }\n    .row-main { flex: 1; min-width: 0; }\n    .row-title { font-weight: 600; font-size: .95rem; overflow-wrap: anywhere; }\n    .row-sub { color: var(--muted); font-size: .82rem; margin-top: 3px; overflow-wrap: anywhere; }\n    .row-actions { display: flex; gap: 6px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }\n    .tag { display: inline-block; font-size: .72rem; font-weight: 600; padding: 2px 8px; border-radius: 99px; background: rgba(96,165,250,.15); color: var(--blue); margin-left: 6px; vertical-align: middle; }\n    .tag.green { background: rgba(52,211,153,.15); color: var(--primary); }\n    .tag.amber { background: rgba(251,191,36,.15); color: var(--amber); }\n    .empty { text-align: center; color: var(--muted); padding: 36px 12px; font-size: .92rem; }\n    .count { color: var(--muted); font-size: .82rem; }\n    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }\n    @media (min-width: 560px) { .stats { grid-template-columns: repeat(4, 1fr); } }\n    .stat { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 14px; text-align: left; }\n    .stat b { display: block; font-size: 1.6rem; font-weight: 700; }\n    .stat span { color: var(--muted); font-size: .8rem; }\n    .stat.hot b { color: var(--primary); }\n    .h3 { font-size: .95rem; font-weight: 700; }\n    .kv { display: grid; grid-template-columns: 110px 1fr; gap: 8px 12px; font-size: .9rem; }\n    .kv dt { color: var(--muted); }\n    .kv dd { overflow-wrap: anywhere; }\n\n    /* ---------- bottom sheet ---------- */\n    .sheet-back { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 40; display: flex; align-items: flex-end; justify-content: center; }\n    .sheet { width: 100%; max-width: 640px; max-height: 92dvh; background: var(--card); border: 1px solid var(--line); border-bottom: 0; border-radius: 20px 20px 0 0; display: flex; flex-direction: column; animation: up .2s ease-out; }\n    @keyframes up { from { transform: translateY(24px); opacity: .6; } }\n    @media (prefers-reduced-motion: reduce) { .sheet { animation: none; } }\n    .sheet-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--line); }\n    .sheet-head h3 { flex: 1; font-size: 1rem; }\n    .sheet-body { padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }\n    .sheet-foot { padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid var(--line); display: flex; gap: 10px; }\n    .sheet-foot .btn { flex: 1; }\n    .fld label { display: block; font-size: .82rem; font-weight: 600; color: var(--muted); margin-bottom: 6px; }\n    .fld .hint { font-size: .78rem; color: var(--faint); margin-top: 5px; }\n    .check { display: flex; align-items: center; gap: 10px; }\n    .check input { width: 20px; height: 20px; accent-color: var(--primary); }\n    .static { background: var(--bg); border: 1px dashed var(--line); border-radius: 10px; padding: 11px 12px; font-size: .92rem; white-space: pre-wrap; overflow-wrap: anywhere; }\n    .mcq-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }\n    .mcq-row input[type=radio] { width: 22px; height: 22px; flex: none; accent-color: var(--primary); }\n    .mcq-row .letter { width: 18px; color: var(--muted); font-weight: 600; flex: none; }\n    .toast { position: fixed; left: 50%; bottom: calc(20px + env(safe-area-inset-bottom)); transform: translateX(-50%) translateY(20px); background: var(--card-2); border: 1px solid var(--line); padding: 11px 16px; border-radius: 12px; font-size: .9rem; z-index: 60; opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s; max-width: 90vw; }\n    .toast.show { opacity: 1; transform: translateX(-50%); }\n    .toast.err { border-color: var(--danger); color: #fecaca; }\n    .loading { color: var(--muted); text-align: center; padding: 30px; font-size: .9rem; }\n  </style>\n</head>\n<body>\n\n  <!-- PIN screen -->\n  <section class=\"lock\" id=\"lock\" hidden>\n    <h1 id=\"lockTitle\">PRIME-CBT Admin</h1>\n    <p class=\"sub\" id=\"lockSub\"></p>\n    <div class=\"dots\" id=\"dots\"><span class=\"dot\"></span><span class=\"dot\"></span><span class=\"dot\"></span><span class=\"dot\"></span></div>\n    <div class=\"pad\" id=\"pad\"></div>\n  </section>\n\n  <!-- Panel -->\n  <div class=\"app\" id=\"app\" hidden>\n    <header class=\"topbar\">\n      <button class=\"iconbtn\" id=\"menuBtn\" aria-label=\"Open menu\"><svg viewBox=\"0 0 24 24\"><path d=\"M4 7h16M4 12h16M4 17h16\"/></svg></button>\n      <h2 id=\"pageTitle\">Dashboard</h2>\n    </header>\n    <main class=\"content\" id=\"view\"></main>\n  </div>\n\n  <div class=\"drawer-back\" id=\"drawerBack\"></div>\n  <nav class=\"drawer\" id=\"drawer\" aria-label=\"Admin sections\"></nav>\n  <div id=\"sheetRoot\"></div>\n  <div class=\"toast\" id=\"toast\" role=\"status\"></div>\n\n<script>\n(function () {\n  'use strict';\n  // Where the server function lives. Keep '/api/admin' if the api folder is at the root of your Vercel project.\n  var API_URL = '/api/admin';\n  var $ = function (id) { return document.getElementById(id); };\n  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>\"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c]; }); };\n  var clip = function (s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '\u2026' : s; };\n\n  function ago(iso) {\n    if (!iso) return 'never';\n    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);\n    if (s < 90) return 'just now';\n    if (s < 3600) return Math.round(s / 60) + ' min ago';\n    if (s < 86400) return Math.round(s / 3600) + ' h ago';\n    if (s < 86400 * 30) return Math.round(s / 86400) + ' d ago';\n    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });\n  }\n  function fmtDate(iso) { return iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''; }\n\n  var toastTimer;\n  function toast(msg, isErr) {\n    var t = $('toast');\n    t.textContent = msg;\n    t.className = 'toast show' + (isErr ? ' err' : '');\n    clearTimeout(toastTimer);\n    toastTimer = setTimeout(function () { t.className = 'toast'; }, isErr ? 4500 : 2400);\n  }\n\n  /* ================= server calls ================= */\n  async function api(action, payload) {\n    var res;\n    try {\n      res = await fetch(API_URL, {\n        method: 'POST', credentials: 'same-origin',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(Object.assign({ action: action }, payload || {}))\n      });\n    } catch (e) { throw new Error('No connection. Check your internet and try again.'); }\n    var data = {};\n    try { data = await res.json(); } catch (e) { /* not JSON */ }\n    if (res.status === 401 && action !== 'login') { showLock(); setMode('login'); }\n    if (!res.ok) {\n      var err = new Error(data.error || ('Request failed (' + res.status + ').'));\n      err.status = res.status; err.data = data;\n      throw err;\n    }\n    return data;\n  }\n\n  /* ================= PIN screen ================= */\n  var mode = 'login', pin = '', firstPin = '', pinBusy = false;\n  var lockCopy = {\n    login: ['Enter your PIN', 'PRIME-CBT admin'],\n    create: ['Create your PIN', 'Choose 4 digits. You only do this once.'],\n    confirm: ['Confirm your PIN', 'Enter the same 4 digits again.']\n  };\n\n  (function buildPad() {\n    var html = '';\n    '123456789'.split('').forEach(function (n) { html += '<button type=\"button\" data-k=\"' + n + '\">' + n + '</button>'; });\n    html += '<button type=\"button\" class=\"ghost\" disabled aria-hidden=\"true\"></button>';\n    html += '<button type=\"button\" data-k=\"0\">0</button>';\n    html += '<button type=\"button\" class=\"ghost\" data-k=\"back\" aria-label=\"Delete\">\u232b</button>';\n    $('pad').innerHTML = html;\n    $('pad').addEventListener('click', function (e) {\n      var b = e.target.closest('button[data-k]');\n      if (b) press(b.getAttribute('data-k'));\n    });\n    document.addEventListener('keydown', function (e) {\n      if ($('lock').hidden) return;\n      if (/^\\d$/.test(e.key)) press(e.key);\n      else if (e.key === 'Backspace') press('back');\n    });\n  })();\n\n  function drawDots() {\n    var dots = $('dots').children;\n    for (var i = 0; i < 4; i++) dots[i].classList.toggle('on', i < pin.length);\n  }\n  function setSub(text, isErr) { $('lockSub').textContent = text; $('lockSub').className = 'sub' + (isErr ? ' err' : ''); }\n  function setMode(m, note, isErr) {\n    mode = m; pin = '';\n    $('lockTitle').textContent = lockCopy[m][0];\n    setSub(note || lockCopy[m][1], isErr);\n    drawDots();\n  }\n  function shake() {\n    var d = $('dots');\n    d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake');\n  }\n  function lockPad(off) { $('pad').querySelectorAll('button[data-k]').forEach(function (b) { b.disabled = off; }); }\n\n  function showLock() {\n    $('app').hidden = true;\n    $('lock').hidden = false;\n    document.body.classList.remove('menu-open');\n    closeSheet();\n  }\n\n  async function press(k) {\n    if (pinBusy) return;\n    if (k === 'back') { pin = pin.slice(0, -1); drawDots(); return; }\n    if (pin.length >= 4) return;\n    pin += k;\n    drawDots();\n    if (pin.length < 4) return;\n\n    if (mode === 'create') { firstPin = pin; setMode('confirm'); return; }\n    if (mode === 'confirm' && pin !== firstPin) {\n      shake(); firstPin = '';\n      setTimeout(function () { setMode('create', 'Those did not match. Choose your PIN again.', true); }, 350);\n      return;\n    }\n    pinBusy = true; lockPad(true);\n    try {\n      await api(mode === 'login' ? 'login' : 'setup', { pin: pin });\n      enterApp();\n    } catch (e) {\n      shake();\n      var again = mode;\n      if (mode === 'confirm' && e.status === 409) again = 'login';\n      setTimeout(function () { setMode(again === 'confirm' ? 'create' : again, e.message, true); }, 350);\n    } finally { pinBusy = false; lockPad(false); }\n  }\n\n  /* ================= data lookups (for dropdowns) ================= */\n  var lookups = {};\n  async function lookup(table, labelKey) {\n    if (!lookups[table]) {\n      var d = await api('list', { table: table, limit: 500 });\n      lookups[table] = d.rows.map(function (r) { return [r.id, r[labelKey] || r.code || r.id]; });\n    }\n    return lookups[table];\n  }\n  var studentCache = null;\n  async function getStudents(force) {\n    if (!studentCache || force) studentCache = (await api('students')).students;\n    return studentCache;\n  }\n\n  /* ================= bottom sheet ================= */\n  var sheetCleanup = null;\n  function closeSheet() { $('sheetRoot').innerHTML = ''; if (sheetCleanup) { sheetCleanup(); sheetCleanup = null; } }\n  function openSheet(title, bodyHtml, footHtml) {\n    $('sheetRoot').innerHTML =\n      '<div class=\"sheet-back\" id=\"sheetBack\"><div class=\"sheet\" role=\"dialog\" aria-modal=\"true\" aria-label=\"' + esc(title) + '\">' +\n      '<div class=\"sheet-head\"><h3>' + esc(title) + '</h3><button class=\"iconbtn\" id=\"sheetX\" aria-label=\"Close\"><svg viewBox=\"0 0 24 24\"><path d=\"M6 6l12 12M18 6L6 18\"/></svg></button></div>' +\n      '<div class=\"sheet-body\" id=\"sheetBody\">' + bodyHtml + '</div>' +\n      (footHtml ? '<div class=\"sheet-foot\" id=\"sheetFoot\">' + footHtml + '</div>' : '') +\n      '</div></div>';\n    $('sheetX').onclick = closeSheet;\n    $('sheetBack').addEventListener('mousedown', function (e) { if (e.target.id === 'sheetBack') closeSheet(); });\n  }\n\n  /* ================= form builder ================= */\n  var LETTERS = 'ABCDEFGH';\n  function mcqRow(i, val, checked) {\n    return '<div class=\"mcq-row\"><input type=\"radio\" name=\"mcqc\" value=\"' + i + '\"' + (checked ? ' checked' : '') + ' aria-label=\"Correct answer\"><span class=\"letter\">' + LETTERS[i] + '</span>' +\n      '<input type=\"text\" class=\"mcq-in\" value=\"' + esc(val) + '\" placeholder=\"Option ' + LETTERS[i] + '\">' +\n      '<button type=\"button\" class=\"iconbtn mcq-del\" aria-label=\"Remove option\"><svg viewBox=\"0 0 24 24\"><path d=\"M6 6l12 12M18 6L6 18\"/></svg></button></div>';\n  }\n  function redrawMcq(box) {\n    var rows = box.querySelectorAll('.mcq-row');\n    rows.forEach(function (r, i) {\n      r.querySelector('input[type=radio]').value = i;\n      r.querySelector('.letter').textContent = LETTERS[i];\n      r.querySelector('.mcq-in').placeholder = 'Option ' + LETTERS[i];\n    });\n    box.querySelector('.mcq-add').hidden = rows.length >= 8;\n  }\n  function mcqHtml(row) {\n    var opts = row && row.options, plain = !opts || (Array.isArray(opts) && opts.every(function (o) { return typeof o === 'string'; }));\n    if (!plain) {\n      return '<div class=\"fld\"><label>Options (custom format)</label><textarea id=\"f_options_raw\" rows=\"6\" style=\"font-family:monospace\">' + esc(JSON.stringify(opts, null, 2)) + '</textarea>' +\n        '<div class=\"hint\">This question stores its options in a different format, so they are shown as raw data.</div></div>' +\n        '<div class=\"fld\"><label for=\"f_correct_raw\">Correct option number (first option is 0)</label><input type=\"number\" id=\"f_correct_raw\" min=\"0\" value=\"' + esc(row.correct_index) + '\"></div>';\n    }\n    var list = opts && opts.length ? opts : ['', '', '', ''];\n    var correct = row && row.correct_index != null ? Number(row.correct_index) : -1;\n    var html = '<div class=\"fld\" id=\"mcqBox\"><label>Options. Tick the correct one. *</label>';\n    list.forEach(function (o, i) { html += mcqRow(i, o, i === correct); });\n    html += '<button type=\"button\" class=\"btn small mcq-add\">Add option</button></div>';\n    return html;\n  }\n  function fieldHtml(f, row, optsMap) {\n    var v = row ? row[f.key] : (f.def != null ? f.def : '');\n    if (v == null) v = '';\n    var id = 'f_' + f.key;\n    var label = '<label for=\"' + id + '\">' + esc(f.label) + (f.required ? ' *' : '') + '</label>';\n    var hint = f.hint ? '<div class=\"hint\">' + esc(f.hint) + '</div>' : '';\n    if (f.type === 'mcq') return mcqHtml(row);\n    if (f.type === 'bool') return '<div class=\"fld check\"><input type=\"checkbox\" id=\"' + id + '\"' + (v ? ' checked' : '') + '><label for=\"' + id + '\" style=\"margin:0\">' + esc(f.label) + '</label></div>';\n    if (f.type === 'static') return '<div class=\"fld\"><label>' + esc(f.label) + '</label><div class=\"static\">' + esc(v) + '</div></div>';\n    if (f.type === 'textarea') return '<div class=\"fld\">' + label + '<textarea id=\"' + id + '\" rows=\"' + (f.rows || 3) + '\" placeholder=\"' + esc(f.ph || '') + '\">' + esc(v) + '</textarea>' + hint + '</div>';\n    if (f.type === 'select') {\n      var opts = optsMap[f.key] || [];\n      var h = '<option value=\"\">' + (f.required ? 'Choose\u2026' : 'None') + '</option>';\n      opts.forEach(function (o) { h += '<option value=\"' + esc(o[0]) + '\"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; });\n      return '<div class=\"fld\">' + label + '<select id=\"' + id + '\">' + h + '</select>' + hint + '</div>';\n    }\n    var dl = '', listAttr = '';\n    if (f.suggest) {\n      listAttr = ' list=\"dl_' + f.key + '\"';\n      dl = '<datalist id=\"dl_' + f.key + '\">' + f.suggest.map(function (s) { return '<option value=\"' + esc(s) + '\">'; }).join('') + '</datalist>';\n    }\n    return '<div class=\"fld\">' + label + '<input id=\"' + id + '\" type=\"' + (f.type === 'number' ? 'number' : 'text') + '\"' + (f.type === 'number' ? ' inputmode=\"numeric\"' : '') + listAttr + ' value=\"' + esc(v) + '\" placeholder=\"' + esc(f.ph || '') + '\">' + dl + hint + '</div>';\n  }\n  function collect(fields) {\n    var data = {};\n    for (var i = 0; i < fields.length; i++) {\n      var f = fields[i];\n      if (f.type === 'static') continue;\n      if (f.type === 'mcq') {\n        var raw = $('f_options_raw');\n        if (raw) {\n          try { data.options = JSON.parse(raw.value); } catch (e) { throw new Error('The options are not valid JSON.'); }\n          data.correct_index = Number($('f_correct_raw').value);\n        } else {\n          var ins = document.querySelectorAll('#mcqBox .mcq-in'), opts = [], chosen = -1;\n          for (var j = 0; j < ins.length; j++) {\n            var t = ins[j].value.trim();\n            if (!t) throw new Error('Fill in or remove the empty option.');\n            opts.push(t);\n            if (ins[j].closest('.mcq-row').querySelector('input[type=radio]').checked) chosen = j;\n          }\n          if (opts.length < 2) throw new Error('Add at least 2 options.');\n          if (chosen < 0) throw new Error('Tick the correct option.');\n          data.options = opts; data.correct_index = chosen;\n        }\n        continue;\n      }\n      var el = $('f_' + f.key);\n      if (!el) continue;\n      var val = f.type === 'bool' ? el.checked : el.value.trim();\n      if (f.required && val === '') throw new Error('Please fill in \"' + f.label + '\".');\n      if (f.type === 'number') val = val === '' ? null : Number(val);\n      data[f.key] = val;\n    }\n    return data;\n  }\n\n  async function openForm(sec, row, after) {\n    var isEdit = !!row;\n    var optsMap = {};\n    for (var i = 0; i < sec.fields.length; i++) {\n      var f = sec.fields[i];\n      if (f.type === 'select') {\n        if (f.lookup) optsMap[f.key] = await lookup(f.lookup, f.lookupLabel);\n        else optsMap[f.key] = f.opts || [];\n      }\n    }\n    var body = sec.fields.map(function (f) { return fieldHtml(f, row, optsMap); }).join('');\n    var editable = sec.fields.some(function (f) { return f.type !== 'static'; });\n    openSheet((isEdit ? 'Edit ' : 'Add ') + sec.noun, body,\n      '<button class=\"btn\" id=\"fCancel\">Cancel</button>' + (editable ? '<button class=\"btn primary\" id=\"fSave\">Save</button>' : ''));\n    $('fCancel').onclick = closeSheet;\n\n    var box = $('mcqBox');\n    if (box) {\n      box.addEventListener('click', function (e) {\n        if (e.target.closest('.mcq-add')) {\n          var n = box.querySelectorAll('.mcq-row').length;\n          var d = document.createElement('div');\n          d.innerHTML = mcqRow(n, '', false);\n          box.insertBefore(d.firstChild, box.querySelector('.mcq-add'));\n          redrawMcq(box);\n        } else if (e.target.closest('.mcq-del')) {\n          if (box.querySelectorAll('.mcq-row').length <= 2) { toast('A question needs at least 2 options.', true); return; }\n          e.target.closest('.mcq-row').remove();\n          redrawMcq(box);\n        }\n      });\n      redrawMcq(box);\n    }\n    if (!editable) return;\n    $('fSave').onclick = async function () {\n      var btn = $('fSave');\n      try {\n        var data = collect(sec.fields);\n        btn.disabled = true;\n        await api('save', { table: sec.table, id: isEdit ? row.id : undefined, data: data });\n        delete lookups[sec.table];\n        closeSheet();\n        toast(isEdit ? 'Changes saved' : sec.noun.charAt(0).toUpperCase() + sec.noun.slice(1) + ' added');\n        if (after) after();\n      } catch (e) { btn.disabled = false; toast(e.message, true); }\n    };\n  }\n\n  /* ================= generic list view ================= */\n  var PAGE = 30;\n  async function renderList(sec) {\n    var st = { q: '', filter: '', offset: 0, rows: [], total: 0, busy: false };\n    var filterOpts = null;\n    if (sec.filter) filterOpts = sec.filter.lookup ? await lookup(sec.filter.lookup, sec.filter.lookupLabel) : sec.filter.opts;\n\n    var top = '<div class=\"toolbar\">';\n    if (sec.search !== false) top += '<input type=\"search\" id=\"lq\" placeholder=\"Search ' + esc(sec.label.toLowerCase()) + '\" aria-label=\"Search\">';\n    if (filterOpts) {\n      top += '<select id=\"lf\" aria-label=\"' + esc(sec.filter.label) + '\"><option value=\"\">' + esc(sec.filter.label) + '</option>' +\n        filterOpts.map(function (o) { return '<option value=\"' + esc(o[0]) + '\">' + esc(o[1]) + '</option>'; }).join('') + '</select>';\n    }\n    top += '</div><div class=\"toolbar\">';\n    if (sec.add !== false) top += '<button class=\"btn primary\" id=\"lAdd\">Add ' + esc(sec.noun) + '</button>';\n    (sec.tools || []).forEach(function (t, i) { top += '<button class=\"btn\" data-tool=\"' + i + '\">' + esc(t.label) + '</button>'; });\n    top += '<span class=\"count\" id=\"lCount\" style=\"align-self:center;margin-left:auto\"></span></div><div id=\"lRows\" style=\"display:flex;flex-direction:column;gap:10px\"></div><div id=\"lMore\" style=\"text-align:center\"></div>';\n    $('view').innerHTML = top;\n\n    function rowHtml(r, i) {\n      var d = sec.row(r);\n      var acts = '';\n      (sec.actions || []).forEach(function (a, ai) { acts += '<button class=\"btn small\" data-act=\"' + ai + '\" data-i=\"' + i + '\">' + esc(typeof a.label === 'function' ? a.label(r) : a.label) + '</button>'; });\n      if (sec.del !== false) acts += '<button class=\"btn small danger\" data-del=\"' + i + '\">Delete</button>';\n      return '<div class=\"row' + (sec.edit !== false || sec.view ? ' tap' : '') + '\" data-i=\"' + i + '\"><div class=\"row-main\"><div class=\"row-title\">' + esc(d.title) +\n        (d.tag ? '<span class=\"tag ' + (d.tagClass || '') + '\">' + esc(d.tag) + '</span>' : '') + '</div>' +\n        (d.sub ? '<div class=\"row-sub\">' + esc(d.sub) + '</div>' : '') +\n        (d.sub2 ? '<div class=\"row-sub\">' + esc(d.sub2) + '</div>' : '') + '</div>' +\n        (acts ? '<div class=\"row-actions\">' + acts + '</div>' : '') + '</div>';\n    }\n    function paint() {\n      $('lRows').innerHTML = st.rows.length ? st.rows.map(rowHtml).join('') : '<div class=\"empty\">' + esc(st.q || st.filter ? 'Nothing matches your search.' : (sec.empty || 'Nothing here yet.')) + '</div>';\n      $('lCount').textContent = st.total ? st.rows.length + ' of ' + st.total : '';\n      $('lMore').innerHTML = st.rows.length < st.total ? '<button class=\"btn\" id=\"lMoreBtn\">Load more</button>' : '';\n    }\n    async function load(reset) {\n      if (st.busy) return;\n      st.busy = true;\n      if (reset) { st.offset = 0; st.rows = []; $('lRows').innerHTML = '<div class=\"loading\">Loading\u2026</div>'; }\n      try {\n        var filters = {};\n        if (sec.filter && st.filter) filters[sec.filter.key] = st.filter;\n        var d = await api('list', { table: sec.table, q: st.q, filters: filters, limit: PAGE, offset: st.offset });\n        st.rows = st.rows.concat(d.rows); st.total = d.total; st.offset = st.rows.length;\n        if (sec.prepare) await sec.prepare(d.rows);\n        paint();\n      } catch (e) { $('lRows').innerHTML = '<div class=\"empty\">' + esc(e.message) + '</div>'; }\n      st.busy = false;\n    }\n    sec._reload = function () { load(true); };\n\n    var timer;\n    if ($('lq')) $('lq').addEventListener('input', function (e) { clearTimeout(timer); timer = setTimeout(function () { st.q = e.target.value.trim(); load(true); }, 300); });\n    if ($('lf')) $('lf').addEventListener('change', function (e) { st.filter = e.target.value; load(true); });\n    if ($('lAdd')) $('lAdd').onclick = function () { openForm(sec, null, function () { load(true); }); };\n    $('view').addEventListener('click', async function (e) {\n      var tool = e.target.closest('[data-tool]');\n      if (tool) { sec.tools[+tool.getAttribute('data-tool')].run(function () { load(true); }); return; }\n      if (e.target.id === 'lMoreBtn') { load(false); return; }\n      var del = e.target.closest('[data-del]');\n      if (del) {\n        var r = st.rows[+del.getAttribute('data-del')];\n        if (!confirm('Delete this ' + sec.noun + '? This cannot be undone.' + (sec.delWarn ? '\\n\\n' + sec.delWarn : ''))) return;\n        try { await api('remove', { table: sec.table, id: r.id }); toast('Deleted'); load(true); } catch (err) { toast(err.message, true); }\n        return;\n      }\n      var act = e.target.closest('[data-act]');\n      if (act) { sec.actions[+act.getAttribute('data-act')].run(st.rows[+act.getAttribute('data-i')], function () { load(true); }); return; }\n      var rowEl = e.target.closest('.row.tap');\n      if (rowEl) {\n        var row = st.rows[+rowEl.getAttribute('data-i')];\n        if (sec.view) sec.view(row, function () { load(true); });\n        else if (sec.edit !== false) openForm(sec, row, function () { load(true); });\n      }\n    });\n    load(true);\n  }\n\n  /* ================= section definitions ================= */\n  var DIFFS = ['easy', 'medium', 'hard'];\n  var courseName = function (id) { var m = (lookups.courses || []).filter(function (c) { return c[0] === id; })[0]; return m ? m[1] : ''; };\n  var studentName = function (id) { var s = (studentCache || []).filter(function (x) { return x.id === id; })[0]; return s ? (s.name || s.email || 'Student') : 'Student'; };\n\n  var SECTIONS = [\n    { id: 'dashboard', label: 'Dashboard', group: 'Overview', kind: 'dashboard' },\n    { id: 'students', label: 'Students', group: 'People', kind: 'students' },\n    {\n      id: 'support', label: 'Support tickets', group: 'People', kind: 'list', table: 'support_tickets', noun: 'ticket', add: false, del: true,\n      empty: 'No support tickets yet.',\n      fields: [\n        { key: 'subject', label: 'Subject', type: 'static' }, { key: 'email', label: 'From', type: 'static' },\n        { key: 'message', label: 'Message', type: 'static' },\n        { key: 'status', label: 'Status', type: 'text', suggest: ['open', 'in progress', 'resolved', 'closed'] }\n      ],\n      filter: { key: 'status', label: 'All statuses', opts: [['open', 'open'], ['resolved', 'resolved'], ['closed', 'closed']] },\n      row: function (r) { return { title: r.subject || '(no subject)', tag: r.status || 'open', tagClass: /resolv|clos/i.test(r.status || '') ? 'green' : 'amber', sub: clip(r.message, 110), sub2: (r.email || '') + '  ' + ago(r.created_at) }; }\n    },\n    {\n      id: 'courses', label: 'Courses', group: 'Content', kind: 'list', table: 'courses', noun: 'course', empty: 'No courses yet. Add your first one.',\n      delWarn: 'Delete the course\\'s questions first, or the delete will be refused.',\n      fields: [\n        { key: 'title', label: 'Course title', type: 'text', required: true, ph: 'e.g. General Chemistry' },\n        { key: 'code', label: 'Course code', type: 'text', ph: 'e.g. CHM101' },\n        { key: 'description', label: 'Description', type: 'textarea' }\n      ],\n      row: function (r) { return { title: r.title, tag: r.code || '', sub: clip(r.description, 100) }; }\n    },\n    {\n      id: 'questions', label: 'Questions', group: 'Content', kind: 'list', table: 'questions', noun: 'question', empty: 'No questions yet.',\n      filter: { key: 'course_id', label: 'All courses', lookup: 'courses', lookupLabel: 'title' },\n      prepare: function () { return lookup('courses', 'title'); },\n      fields: [\n        { key: 'course_id', label: 'Course', type: 'select', lookup: 'courses', lookupLabel: 'title', required: true },\n        { key: 'question', label: 'Question', type: 'textarea', rows: 4, required: true },\n        { key: 'options', type: 'mcq' },\n        { key: 'explanation', label: 'Explanation (shown after answering)', type: 'textarea' },\n        { key: 'difficulty', label: 'Difficulty', type: 'text', suggest: DIFFS }\n      ],\n      row: function (r) { return { title: clip(r.question, 140), tag: r.difficulty || '', sub: courseName(r.course_id) }; },\n      tools: [{ label: 'Bulk import', run: function (done) { openImport(done); } }]\n    },\n    {\n      id: 'materials', label: 'Materials', group: 'Content', kind: 'list', table: 'materials', noun: 'material', empty: 'No materials yet.',\n      fields: [\n        { key: 'title', label: 'Title', type: 'text', required: true },\n        { key: 'course', label: 'Course', type: 'text', hint: 'Use the same course name or code your students see.' },\n        { key: 'topic', label: 'Topic', type: 'text' },\n        { key: 'material_type', label: 'Type', type: 'text', suggest: ['PDF', 'Notes', 'Past questions', 'Slides', 'Video'] },\n        { key: 'file_url', label: 'File link', type: 'text', required: true, ph: 'https://\u2026', hint: 'Upload the file to Supabase Storage (or anywhere public) and paste its link here.' },\n        { key: 'page_count', label: 'Pages', type: 'number' },\n        { key: 'size_bytes', label: 'File size in bytes', type: 'number' }\n      ],\n      row: function (r) { return { title: r.title, tag: r.material_type || '', sub: [r.course, r.topic].filter(Boolean).join(', ') }; }\n    },\n    {\n      id: 'achievements', label: 'Achievements', group: 'Content', kind: 'list', table: 'achievements', noun: 'achievement', empty: 'No achievements yet.',\n      fields: [\n        { key: 'title', label: 'Title', type: 'text', required: true },\n        { key: 'slug', label: 'Short ID (no spaces)', type: 'text', required: true, ph: 'e.g. first-exam', hint: 'Used internally. Changing it can reset who has earned it.' },\n        { key: 'description', label: 'Description', type: 'textarea' },\n        { key: 'icon', label: 'Icon', type: 'text', ph: 'e.g. \ud83c\udfc6' },\n        { key: 'metric', label: 'What it counts', type: 'text', required: true, ph: 'e.g. xp, streak', hint: 'Must match a metric your app already tracks.' },\n        { key: 'threshold', label: 'Amount needed', type: 'number' },\n        { key: 'sort_order', label: 'Order', type: 'number', def: 0 }\n      ],\n      row: function (r) { return { title: (r.icon ? r.icon + ' ' : '') + r.title, tag: r.metric + ' \u2265 ' + r.threshold, sub: clip(r.description, 100) }; }\n    },\n    { id: 'notifications', label: 'Notifications', group: 'Communication', kind: 'notifications' },\n    {\n      id: 'posts', label: 'Discussions', group: 'Communication', kind: 'list', table: 'discussion_posts', noun: 'post', add: false, empty: 'No discussion posts yet.',\n      prepare: function () { return getStudents(); },\n      fields: [\n        { key: 'title', label: 'Title', type: 'text', required: true },\n        { key: 'body', label: 'Post', type: 'textarea', rows: 5 },\n        { key: 'is_pinned', label: 'Pin to the top', type: 'bool' }\n      ],\n      row: function (r) { return { title: r.title, tag: r.is_pinned ? 'Pinned' : '', tagClass: 'amber', sub: clip(r.body, 110), sub2: studentName(r.author_id) + (r.course ? '  ' + r.course : '') + '  ' + ago(r.created_at) }; },\n      actions: [\n        { label: 'Replies', run: function (r) { openReplies(r); } },\n        { label: function (r) { return r.is_pinned ? 'Unpin' : 'Pin'; }, run: async function (r, done) { try { await api('save', { table: 'discussion_posts', id: r.id, data: { is_pinned: !r.is_pinned } }); done(); } catch (e) { toast(e.message, true); } } }\n      ],\n      delWarn: 'Its replies and likes will be removed too.'\n    },\n    {\n      id: 'results', label: 'Test results', group: 'Communication', kind: 'list', table: 'test_results', noun: 'result', add: false, del: false, edit: false,\n      prepare: function () { return getStudents(); }, empty: 'No test results yet.',\n      row: function (r) { return { title: r.course_title || r.course_code || 'Test', tag: r.score + '/' + r.total_questions, tagClass: 'green', sub: studentName(r.user_id) + '  ' + (r.mode || ''), sub2: fmtDate(r.created_at) }; }\n    },\n    {\n      id: 'schools', label: 'Schools', group: 'Sign-up lists', kind: 'list', table: 'schools', noun: 'school', search: false, empty: 'No schools yet.',\n      fields: [{ key: 'name', label: 'School name', type: 'text', required: true }, { key: 'sort_order', label: 'Order', type: 'number', def: 0 }],\n      row: function (r) { return { title: r.name, sub: 'Order ' + r.sort_order }; }\n    },\n    {\n      id: 'departments', label: 'Departments', group: 'Sign-up lists', kind: 'list', table: 'departments', noun: 'department', empty: 'No departments yet.',\n      filter: { key: 'school_id', label: 'All schools', lookup: 'schools', lookupLabel: 'name' },\n      prepare: function () { return lookup('schools', 'name'); },\n      fields: [\n        { key: 'school_id', label: 'School', type: 'select', lookup: 'schools', lookupLabel: 'name', required: true },\n        { key: 'name', label: 'Department name', type: 'text', required: true },\n        { key: 'sort_order', label: 'Order', type: 'number', def: 0 }\n      ],\n      row: function (r) { var s = (lookups.schools || []).filter(function (x) { return x[0] === r.school_id; })[0]; return { title: r.name, sub: s ? s[1] : '' }; }\n    },\n    {\n      id: 'levels', label: 'Levels', group: 'Sign-up lists', kind: 'list', table: 'levels', noun: 'level', search: false, empty: 'No levels yet.',\n      fields: [{ key: 'name', label: 'Level name', type: 'text', required: true, ph: 'e.g. 100 Level' }, { key: 'sort_order', label: 'Order', type: 'number', def: 0 }],\n      row: function (r) { return { title: r.name, sub: 'Order ' + r.sort_order }; }\n    },\n    { id: 'security', label: 'Change PIN', group: 'Security', kind: 'security' }\n  ];\n\n  /* ================= special views ================= */\n  async function renderDashboard() {\n    $('view').innerHTML = '<div class=\"loading\">Loading\u2026</div>';\n    try {\n      var s = await api('stats');\n      var items = [\n        ['online', s.online, 'Online now', true], ['students', s.students, 'Students'], ['tests', s.tests, 'Tests taken'], ['questions', s.questions, 'Questions'],\n        ['courses', s.courses, 'Courses'], ['materials', s.materials, 'Materials'], ['posts', s.posts, 'Discussion posts'], ['support', s.tickets, 'Support tickets']\n      ];\n      $('view').innerHTML = '<div class=\"stats\">' + items.map(function (i) {\n        return '<button class=\"stat' + (i[3] ? ' hot' : '') + '\" data-go=\"' + (i[0] === 'online' ? 'students' : i[0] === 'tests' ? 'results' : i[0]) + '\"><b>' + i[1] + '</b><span>' + i[2] + '</span></button>';\n      }).join('') + '</div>' +\n        '<div class=\"card\"><div class=\"h3\">Quick actions</div><div class=\"toolbar\" style=\"margin-top:12px\">' +\n        '<button class=\"btn primary\" data-go=\"notifications\">Send a notification</button>' +\n        '<button class=\"btn\" data-go=\"questions\">Manage questions</button>' +\n        '<button class=\"btn\" data-go=\"materials\">Add material</button></div></div>';\n    } catch (e) { $('view').innerHTML = '<div class=\"empty\">' + esc(e.message) + '</div>'; }\n  }\n\n  async function renderStudents() {\n    $('view').innerHTML = '<div class=\"toolbar\"><input type=\"search\" id=\"sq\" placeholder=\"Search name, email, department\" aria-label=\"Search students\"></div><div class=\"count\" id=\"sCount\"></div><div id=\"sRows\" style=\"display:flex;flex-direction:column;gap:10px\"><div class=\"loading\">Loading\u2026</div></div>';\n    var list;\n    try { list = await getStudents(true); } catch (e) { $('sRows').innerHTML = '<div class=\"empty\">' + esc(e.message) + '</div>'; return; }\n    var shown = list, limit = 50;\n    function paint() {\n      $('sCount').textContent = shown.length + (shown.length === 1 ? ' student' : ' students');\n      $('sRows').innerHTML = shown.length ? shown.slice(0, limit).map(function (s, i) {\n        var online = s.last_seen && Date.now() - new Date(s.last_seen).getTime() < 5 * 60000;\n        return '<div class=\"row tap\" data-i=\"' + i + '\"><div class=\"row-main\"><div class=\"row-title\">' + esc(s.name || s.email || 'Student') + (online ? '<span class=\"tag green\">online</span>' : '') + '</div>' +\n          '<div class=\"row-sub\">' + esc(s.email) + '</div><div class=\"row-sub\">' + esc([s.department, s.level].filter(Boolean).join(', ')) + (s.xp ? '  ' + s.xp + ' XP' : '') + (s.streak ? '  ' + s.streak + ' day streak' : '') + '  Last seen ' + esc(ago(s.last_seen)) + '</div></div></div>';\n      }).join('') + (shown.length > limit ? '<button class=\"btn\" id=\"sMore\">Show more</button>' : '') : '<div class=\"empty\">No students found.</div>';\n    }\n    paint();\n    var timer;\n    $('sq').addEventListener('input', function (e) {\n      clearTimeout(timer);\n      timer = setTimeout(function () {\n        var q = e.target.value.toLowerCase().trim(); limit = 50;\n        shown = !q ? list : list.filter(function (s) { return (s.name + ' ' + s.email + ' ' + s.department + ' ' + s.institution).toLowerCase().indexOf(q) > -1; });\n        paint();\n      }, 200);\n    });\n    $('sRows').addEventListener('click', function (e) {\n      if (e.target.id === 'sMore') { limit += 50; paint(); return; }\n      var r = e.target.closest('.row[data-i]');\n      if (!r) return;\n      var s = shown[+r.getAttribute('data-i')];\n      var kv = [['Name', s.name], ['Email', s.email], ['Phone', s.phone], ['School', s.institution], ['Department', s.department], ['Level', s.level], ['Plan', s.plan], ['XP', s.xp], ['Streak', s.streak ? s.streak + ' days' : '0'], ['Exam date', s.exam_date], ['Sign-in', s.provider], ['Joined', fmtDate(s.joined)], ['Last seen', fmtDate(s.last_seen)]]\n        .filter(function (p) { return p[1] !== '' && p[1] != null; });\n      openSheet(s.name || s.email || 'Student', '<dl class=\"kv\">' + kv.map(function (p) { return '<dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd>'; }).join('') + '</dl>',\n        '<button class=\"btn\" id=\"sClose\">Close</button><button class=\"btn primary\" id=\"sMsg\">Send notification</button>');\n      $('sClose').onclick = closeSheet;\n      $('sMsg').onclick = function () { closeSheet(); pendingTo = s.id; go('notifications'); };\n    });\n  }\n\n  var pendingTo = null;\n  async function renderNotifications() {\n    var to = pendingTo; pendingTo = null;\n    $('view').innerHTML =\n      '<div class=\"card\" style=\"display:flex;flex-direction:column;gap:12px\"><div class=\"h3\">New notification</div>' +\n      '<div class=\"fld\"><label for=\"nTo\">Send to</label><select id=\"nTo\"><option value=\"all\">All students</option><option value=\"one\">One student</option></select></div>' +\n      '<div class=\"fld\" id=\"nOne\" hidden><label for=\"nSearch\">Find the student</label><input type=\"search\" id=\"nSearch\" placeholder=\"Type a name or email\"><select id=\"nPick\" size=\"4\" style=\"margin-top:8px;background-image:none;padding-right:12px\"></select></div>' +\n      '<div class=\"fld\"><label for=\"nType\">Type</label><select id=\"nType\"><option value=\"info\">General</option><option value=\"exam\">Exams</option><option value=\"study\">Study</option><option value=\"community\">Community</option><option value=\"welcome\">Welcome</option></select></div>' +\n      '<div class=\"fld\"><label for=\"nTitle\">Title *</label><input id=\"nTitle\" maxlength=\"120\" placeholder=\"e.g. New past questions added\"></div>' +\n      '<div class=\"fld\"><label for=\"nBody\">Message</label><textarea id=\"nBody\" rows=\"3\" maxlength=\"600\"></textarea></div>' +\n      '<button class=\"btn primary\" id=\"nSend\">Send notification</button></div>' +\n      '<div class=\"h3\" style=\"margin-top:6px\">Recently sent</div><div id=\"nHist\" style=\"display:flex;flex-direction:column;gap:10px\"><div class=\"loading\">Loading\u2026</div></div>';\n\n    var students = [];\n    function fillPick() {\n      var q = $('nSearch').value.toLowerCase().trim();\n      var m = students.filter(function (s) { return !q || (s.name + ' ' + s.email).toLowerCase().indexOf(q) > -1; }).slice(0, 60);\n      $('nPick').innerHTML = m.map(function (s) { return '<option value=\"' + esc(s.id) + '\">' + esc((s.name || 'Student') + ' (' + s.email + ')') + '</option>'; }).join('');\n      if (m.length === 1 || (to && m.length)) $('nPick').value = m[0].id;\n    }\n    $('nTo').addEventListener('change', async function () {\n      $('nOne').hidden = $('nTo').value !== 'one';\n      if (!$('nOne').hidden && !students.length) { try { students = await getStudents(); fillPick(); } catch (e) { toast(e.message, true); } }\n    });\n    $('nSearch').addEventListener('input', fillPick);\n    if (to) {\n      $('nTo').value = 'one'; $('nOne').hidden = false;\n      try { students = await getStudents(); } catch (e) { /* shown below */ }\n      var s = students.filter(function (x) { return x.id === to; })[0];\n      if (s) { $('nSearch').value = s.email; fillPick(); $('nPick').value = to; }\n    }\n\n    $('nSend').onclick = async function () {\n      var btn = $('nSend'), all = $('nTo').value === 'all';\n      var title = $('nTitle').value.trim();\n      if (!title) { toast('Add a title first.', true); return; }\n      var target = all ? 'all' : $('nPick').value;\n      if (!target) { toast('Choose a student.', true); return; }\n      if (!confirm(all ? 'Send this to ALL students?' : 'Send this to the selected student?')) return;\n      btn.disabled = true;\n      try {\n        var r = await api('notify', { to: target, title: title, body: $('nBody').value, type: $('nType').value });\n        toast('Sent to ' + r.sent + (r.sent === 1 ? ' student' : ' students'));\n        $('nTitle').value = ''; $('nBody').value = '';\n        loadHist();\n      } catch (e) { toast(e.message, true); }\n      btn.disabled = false;\n    };\n\n    var items = [];\n    async function loadHist() {\n      try {\n        items = (await api('notif_history')).items;\n        $('nHist').innerHTML = items.length ? items.map(function (n, i) {\n          return '<div class=\"row\"><div class=\"row-main\"><div class=\"row-title\">' + esc(n.title) + '<span class=\"tag\">' + esc(n.type || 'info') + '</span></div>' +\n            (n.body ? '<div class=\"row-sub\">' + esc(clip(n.body, 100)) + '</div>' : '') +\n            '<div class=\"row-sub\">Sent to ' + n.count + (n.count === 1 ? ' student' : ' students') + '  ' + esc(ago(n.last_at)) + '</div></div>' +\n            '<div class=\"row-actions\"><button class=\"btn small danger\" data-d=\"' + i + '\">Delete</button></div></div>';\n        }).join('') : '<div class=\"empty\">Nothing sent yet.</div>';\n      } catch (e) { $('nHist').innerHTML = '<div class=\"empty\">' + esc(e.message) + '</div>'; }\n    }\n    $('nHist').addEventListener('click', async function (e) {\n      var b = e.target.closest('[data-d]');\n      if (!b) return;\n      var n = items[+b.getAttribute('data-d')];\n      if (!confirm('Delete this notification for all ' + n.count + ' students who got it?')) return;\n      try { await api('del_notifs', { title: n.title, body: n.body }); toast('Deleted'); loadHist(); } catch (err) { toast(err.message, true); }\n    });\n    loadHist();\n  }\n\n  function renderSecurity() {\n    $('view').innerHTML = '<div class=\"card\" style=\"display:flex;flex-direction:column;gap:12px\"><div class=\"h3\">Change your PIN</div>' +\n      ['pCur:Current PIN', 'pNew:New PIN', 'pNew2:Repeat new PIN'].map(function (s) {\n        var p = s.split(':');\n        return '<div class=\"fld\"><label for=\"' + p[0] + '\">' + p[1] + '</label><input id=\"' + p[0] + '\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" pattern=\"[0-9]*\" autocomplete=\"off\"></div>';\n      }).join('') + '<button class=\"btn primary\" id=\"pSave\">Save new PIN</button>' +\n      '<div class=\"count\">Changing your PIN signs out every other device.</div></div>' +\n      '<div class=\"card\" style=\"display:flex;flex-direction:column;gap:12px\"><div class=\"h3\">This device</div><div class=\"count\">You stay signed in here for 7 days.</div><button class=\"btn\" id=\"pLock\">Lock now</button></div>';\n    $('pLock').onclick = lockNow;\n    $('pSave').onclick = async function () {\n      var cur = $('pCur').value, n1 = $('pNew').value, n2 = $('pNew2').value;\n      if (!/^\\d{4}$/.test(cur) || !/^\\d{4}$/.test(n1)) { toast('PINs must be exactly 4 digits.', true); return; }\n      if (n1 !== n2) { toast('The new PINs do not match.', true); return; }\n      try { await api('change_pin', { current: cur, pin: n1 }); toast('PIN changed'); $('pCur').value = $('pNew').value = $('pNew2').value = ''; } catch (e) { toast(e.message, true); }\n    };\n  }\n\n  /* ---------- sheets used by sections ---------- */\n  async function openReplies(post) {\n    openSheet('Replies', '<div class=\"loading\">Loading\u2026</div>');\n    var rows = [];\n    async function load() {\n      try {\n        await getStudents();\n        rows = (await api('list', { table: 'discussion_replies', filters: { post_id: post.id }, limit: 200 })).rows;\n        $('sheetBody').innerHTML = rows.length ? rows.map(function (r, i) {\n          return '<div class=\"row\"><div class=\"row-main\"><div class=\"row-title\">' + esc(studentName(r.author_id)) + '</div><div class=\"row-sub\">' + esc(r.body) + '</div><div class=\"row-sub\">' + esc(ago(r.created_at)) + '</div></div>' +\n            '<div class=\"row-actions\"><button class=\"btn small danger\" data-r=\"' + i + '\">Delete</button></div></div>';\n        }).join('') : '<div class=\"empty\">No replies on this post.</div>';\n      } catch (e) { $('sheetBody').innerHTML = '<div class=\"empty\">' + esc(e.message) + '</div>'; }\n    }\n    $('sheetBody').addEventListener('click', async function (e) {\n      var b = e.target.closest('[data-r]');\n      if (!b || !confirm('Delete this reply?')) return;\n      try { await api('remove', { table: 'discussion_replies', id: rows[+b.getAttribute('data-r')].id }); toast('Deleted'); load(); } catch (err) { toast(err.message, true); }\n    });\n    load();\n  }\n\n  async function openImport(done) {\n    var courses = await lookup('courses', 'title');\n    if (!courses.length) { toast('Add a course first.', true); return; }\n    openSheet('Bulk import questions',\n      '<div class=\"fld\"><label for=\"iCourse\">Course *</label><select id=\"iCourse\">' + courses.map(function (c) { return '<option value=\"' + esc(c[0]) + '\">' + esc(c[1]) + '</option>'; }).join('') + '</select></div>' +\n      '<div class=\"fld\"><label for=\"iText\">Questions as JSON *</label><textarea id=\"iText\" rows=\"9\" style=\"font-family:monospace;font-size:.82rem\" placeholder=\\'[{\"question\":\"2 + 2 = ?\",\"options\":[\"3\",\"4\",\"5\",\"6\"],\"correct_index\":1,\"explanation\":\"Basic addition.\",\"difficulty\":\"easy\"}]\\'></textarea>' +\n      '<div class=\"hint\">correct_index counts from 0, so the first option is 0. Up to 300 questions at a time. Everything is checked before anything is saved.</div></div>',\n      '<button class=\"btn\" id=\"iCancel\">Cancel</button><button class=\"btn primary\" id=\"iGo\">Import</button>');\n    $('iCancel').onclick = closeSheet;\n    $('iGo').onclick = async function () {\n      var items;\n      try { items = JSON.parse($('iText').value); } catch (e) { toast('That is not valid JSON. Check the brackets and quotes.', true); return; }\n      if (!Array.isArray(items)) { toast('The JSON must be a list: [ {...}, {...} ]', true); return; }\n      var btn = $('iGo'); btn.disabled = true;\n      try {\n        var r = await api('import_questions', { course_id: $('iCourse').value, items: items });\n        closeSheet(); toast(r.added + (r.added === 1 ? ' question' : ' questions') + ' imported'); done();\n      } catch (e) { btn.disabled = false; toast(e.message, true); }\n    };\n  }\n\n  /* ================= navigation ================= */\n  var current = null;\n  function buildNav() {\n    var html = '<div class=\"brand\">PRIME-CBT<small>Admin panel</small></div>', last = '';\n    SECTIONS.forEach(function (s) {\n      if (s.group !== last) { html += '<div class=\"nav-group\">' + esc(s.group) + '</div>'; last = s.group; }\n      html += '<button class=\"nav\" data-go=\"' + s.id + '\">' + esc(s.label) + '</button>';\n    });\n    html += '<div class=\"nav-group\">Session</div><button class=\"nav\" id=\"navLock\">Lock panel</button>';\n    $('drawer').innerHTML = html;\n    $('navLock').onclick = lockNow;\n  }\n  function go(id) {\n    var sec = SECTIONS.filter(function (s) { return s.id === id; })[0] || SECTIONS[0];\n    current = sec.id;\n    document.body.classList.remove('menu-open');\n    $('pageTitle').textContent = sec.label;\n    document.querySelectorAll('.nav[data-go]').forEach(function (n) { n.classList.toggle('active', n.getAttribute('data-go') === sec.id); });\n    $('view').replaceWith($('view').cloneNode(false)); // drop old listeners\n    window.scrollTo(0, 0);\n    if (location.hash !== '#' + sec.id) history.replaceState(null, '', '#' + sec.id);\n    if (sec.kind === 'dashboard') renderDashboard();\n    else if (sec.kind === 'students') renderStudents();\n    else if (sec.kind === 'notifications') renderNotifications();\n    else if (sec.kind === 'security') renderSecurity();\n    else renderList(sec);\n  }\n  async function lockNow() {\n    try { await api('logout'); } catch (e) { /* still lock the screen */ }\n    studentCache = null; lookups = {};\n    showLock(); setMode('login');\n  }\n  function enterApp() {\n    $('lock').hidden = true;\n    $('app').hidden = false;\n    studentCache = null; lookups = {};\n    go((location.hash || '').replace('#', '') || 'dashboard');\n  }\n\n  $('menuBtn').onclick = function () { document.body.classList.add('menu-open'); };\n  $('drawerBack').onclick = function () { document.body.classList.remove('menu-open'); };\n  document.addEventListener('click', function (e) {\n    var g = e.target.closest('[data-go]');\n    if (g && !g.closest('.pad')) go(g.getAttribute('data-go'));\n  });\n\n  buildNav();\n\n  /* ================= start ================= */\n  (async function init() {\n    try {\n      var s = await api('status');\n      if (s.authed) { enterApp(); return; }\n      $('lock').hidden = false;\n      setMode(s.setup ? 'login' : 'create');\n    } catch (e) {\n      $('lock').hidden = false;\n      $('pad').hidden = true; $('dots').hidden = true;\n      setSub(e.message, true);\n    }\n  })();\n})();\n</script>\n</body>\n</html>\n";

const NOTIF_TYPES = ['info', 'welcome', 'exam', 'study', 'community'];

// ---------- small helpers ----------
const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });

const bad = (message, http = 400, extra = {}) => Object.assign(new Error(message), { http, ...extra });
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const cookie = (value, maxAge) => `${COOKIE}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

function readCookie(request) {
  const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  return m ? m[1] : '';
}
function clientIp(request) {
  return (request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown').trim();
}

// ---------- crypto ----------
const te = new TextEncoder();
const toB64u = (buf) => {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64u = (s) => {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function hashPin(pin, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', te.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return toB64u(bits);
}
async function hmac(text) {
  const key = await crypto.subtle.importKey('raw', te.encode(SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toB64u(await crypto.subtle.sign('HMAC', key, te.encode(text)));
}
async function makeToken(ver) {
  const payload = toB64u(te.encode(JSON.stringify({ exp: Date.now() + SESSION_DAYS * DAY, ver })));
  return payload + '.' + (await hmac(payload));
}
async function checkToken(token, ver) {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  if (!safeEqual(await hmac(payload), sig)) return false;
  try {
    const j = JSON.parse(new TextDecoder().decode(fromB64u(payload)));
    return j.ver === ver && j.exp > Date.now();
  } catch {
    return false;
  }
}
function randomId(bytes) {
  return toB64u(crypto.getRandomValues(new Uint8Array(bytes)));
}

// ---------- Supabase (service key, server only) ----------
function sbHeaders(extra) {
  const h = { apikey: SERVICE_KEY, 'Content-Type': 'application/json', ...extra };
  if (!SERVICE_KEY.startsWith('sb_')) h.Authorization = `Bearer ${SERVICE_KEY}`; // legacy JWT keys
  return h;
}
const sb = (path, opts = {}) => fetch(`${SUPABASE_URL}${path}`, { ...opts, headers: sbHeaders(opts.headers) });

async function ensure(r) {
  if (r.ok) return r;
  let detail = {};
  try { detail = await r.json(); } catch { /* not JSON */ }
  const code = detail.code || '';
  if (code === '23503') throw bad('This is still used by other records. Remove those first.', 409);
  if (code === '23505') throw bad('That already exists.', 409);
  throw bad(detail.message || `Database error (${r.status}).`, r.status === 404 ? 404 : 400, { dbCode: code });
}

async function kvGet(key) {
  const r = await ensure(await sb(`/rest/v1/admin_settings?select=value&key=eq.${encodeURIComponent(key)}&limit=1`));
  const rows = await r.json();
  return rows[0] ? rows[0].value : null;
}
async function kvSet(key, value) {
  await ensure(await sb('/rest/v1/admin_settings?on_conflict=key', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  }));
}
// First writer wins: returns false if the key already exists
async function kvInsertOnly(key, value) {
  const r = await sb('/rest/v1/admin_settings', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ key, value }),
  });
  if (r.status === 409) return false;
  await ensure(r);
  return true;
}

async function countRows(table, filter) {
  const r = await ensure(await sb(`/rest/v1/${table}?select=id${filter ? '&' + filter : ''}`, {
    method: 'HEAD',
    headers: { Prefer: 'count=exact' },
  }));
  const m = (r.headers.get('content-range') || '').match(/\/(\d+)$/);
  return m ? Number(m[1]) : 0;
}
async function fetchAll(path) {
  const out = [];
  for (let offset = 0; offset < 20000; offset += 1000) {
    const r = await ensure(await sb(`${path}${path.includes('?') ? '&' : '?'}limit=1000&offset=${offset}`));
    const rows = await r.json();
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}
async function allUsers() {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const r = await ensure(await sb(`/auth/v1/admin/users?page=${page}&per_page=1000`));
    const j = await r.json();
    const users = j.users || [];
    out.push(...users);
    if (users.length < 1000) break;
  }
  return out;
}

// ---------- PIN attempts and lockouts ----------
async function readLock(key) {
  const s = (await kvGet(key)) || { fails: 0, until: 0, last: 0 };
  if (Date.now() - (s.last || 0) > DAY) return { fails: 0, until: 0, last: 0 };
  return s;
}
const lockMs = (fails, max, baseMs) => (fails < max ? 0 : Math.min(baseMs * 2 ** (fails - max), DAY));

async function attemptPin(request, pin, rec) {
  const ipKey = 'lock:ip:' + clientIp(request);
  const [ip, glob] = await Promise.all([readLock(ipKey), readLock('lock:global')]);
  const now = Date.now();
  const until = Math.max(ip.until || 0, glob.until || 0);
  if (until > now) return { ok: false, locked: true, retryAfter: Math.ceil((until - now) / 1000) };

  const hash = await hashPin(pin, fromB64u(rec.salt), rec.iter);
  if (safeEqual(hash, rec.hash)) {
    if (ip.fails) await kvSet(ipKey, { fails: 0, until: 0, last: now });
    return { ok: true };
  }

  ip.fails += 1; ip.last = now; ip.until = now + lockMs(ip.fails, IP_MAX_TRIES, 15 * 60000);
  glob.fails += 1; glob.last = now; glob.until = now + lockMs(glob.fails, GLOBAL_MAX_TRIES, 3600000);
  await Promise.all([kvSet(ipKey, ip), kvSet('lock:global', glob)]);

  const lockedUntil = Math.max(ip.until, glob.until);
  if (lockedUntil > now) return { ok: false, locked: true, retryAfter: Math.ceil((lockedUntil - now) / 1000) };
  return { ok: false, locked: false, left: Math.max(0, IP_MAX_TRIES - ip.fails) };
}

function lockedResponse(a) {
  const mins = Math.max(1, Math.ceil(a.retryAfter / 60));
  const wait = mins >= 120 ? `${Math.ceil(mins / 60)} hours` : mins >= 60 ? 'about an hour' : `${mins} minute${mins === 1 ? '' : 's'}`;
  return json({ error: `Too many wrong tries. Try again in ${wait}.`, locked: true, retryAfter: a.retryAfter }, 429);
}
function wrongResponse(a) {
  return json({ error: a.left ? `Wrong PIN. ${a.left} ${a.left === 1 ? 'try' : 'tries'} left.` : 'Wrong PIN.', left: a.left }, 403);
}

async function newPinRecord(pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    salt: toB64u(salt),
    iter: PBKDF2_ITER,
    hash: await hashPin(pin, salt, PBKDF2_ITER),
    ver: randomId(9),
  };
}

// ---------- generic data actions ----------
function cleanData(cfg, data, isInsert) {
  const out = {};
  for (const c of cfg.cols) {
    if (!(c in data)) continue;
    let v = data[c];
    if (cfg.nums && cfg.nums.includes(c)) {
      v = v === '' || v == null ? null : Number(v);
      if (v !== null && !Number.isFinite(v)) throw bad(`"${c}" must be a number.`);
    } else if (cfg.bools && cfg.bools.includes(c)) {
      v = !!v;
    } else if (typeof v === 'string') {
      v = v.trim();
    }
    out[c] = v;
  }
  for (const c of cfg.required || []) {
    if ((isInsert || c in out) && (out[c] == null || out[c] === '')) throw bad(`Please fill in "${c.replace(/_/g, ' ')}".`);
  }
  for (const c of ['course_id', 'school_id']) {
    if (c in out && !UUID_RE.test(str(out[c]))) throw bad('Please choose a valid option.');
  }
  return out;
}

function checkQuestion(q, label) {
  const pre = label ? `${label}: ` : '';
  if (!str(q.question).trim()) throw bad(pre + 'the question text is empty.');
  if (!Array.isArray(q.options) || q.options.length < 2) throw bad(pre + 'add at least 2 options.');
  const plain = q.options.every((o) => typeof o === 'string');
  if (plain && q.options.some((o) => !o.trim())) throw bad(pre + 'an option is empty.');
  const idx = Number(q.correct_index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= q.options.length) throw bad(pre + 'choose which option is correct.');
}

async function listRows(body) {
  const cfg = TABLES[body.table];
  if (!cfg) throw bad('Unknown table.');
  const limit = clamp(parseInt(body.limit, 10) || 30, 1, 500);
  const offset = Math.max(0, parseInt(body.offset, 10) || 0);
  const qs = ['select=*', `order=${cfg.order}`, `limit=${limit}`, `offset=${offset}`];
  const q = str(body.q).replace(/[,()*%\\]/g, ' ').trim().slice(0, 60);
  if (q && cfg.search) qs.push('or=' + encodeURIComponent('(' + cfg.search.map((c) => `${c}.ilike.*${q}*`).join(',') + ')'));
  for (const [k, v] of Object.entries(body.filters || {})) {
    if (cfg.filters && cfg.filters.includes(k) && v !== '' && v != null) qs.push(`${k}=eq.${encodeURIComponent(str(v))}`);
  }
  const r = await ensure(await sb(`/rest/v1/${body.table}?${qs.join('&')}`, { headers: { Prefer: 'count=exact' } }));
  const rows = await r.json();
  const m = (r.headers.get('content-range') || '').match(/\/(\d+)$/);
  return { rows, total: m ? Number(m[1]) : rows.length };
}

async function saveRow(body) {
  const cfg = TABLES[body.table];
  if (!cfg) throw bad('Unknown table.');
  const isInsert = !body.id;
  if (isInsert && cfg.noInsert) throw bad('Adding is not allowed here.');
  if (!isInsert && cfg.noUpdate) throw bad('Editing is not allowed here.');
  if (!isInsert && !UUID_RE.test(str(body.id))) throw bad('Invalid item.');
  const data = cleanData(cfg, body.data || {}, isInsert);
  if (body.table === 'questions' && (isInsert || 'options' in data || 'correct_index' in data)) {
    checkQuestion({ question: data.question || 'x', options: data.options, correct_index: data.correct_index });
  }
  if (cfg.touch) data.updated_at = new Date().toISOString();
  if (!Object.keys(data).length) throw bad('Nothing to save.');
  const r = await ensure(await sb(
    isInsert ? `/rest/v1/${body.table}` : `/rest/v1/${body.table}?id=eq.${body.id}`,
    { method: isInsert ? 'POST' : 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(data) },
  ));
  const rows = await r.json();
  return { row: rows[0] || null };
}

async function removeRow(body) {
  const cfg = TABLES[body.table];
  if (!cfg || cfg.noDelete) throw bad('Deleting is not allowed here.');
  if (!UUID_RE.test(str(body.id))) throw bad('Invalid item.');
  for (const [table, col] of cfg.cascade || []) {
    await ensure(await sb(`/rest/v1/${table}?${col}=eq.${body.id}`, { method: 'DELETE' }));
  }
  await ensure(await sb(`/rest/v1/${body.table}?id=eq.${body.id}`, { method: 'DELETE' }));
  return { ok: true };
}

async function stats() {
  const since = encodeURIComponent(new Date(Date.now() - 5 * 60000).toISOString());
  const [students, online, courses, questions, materials, posts, tickets, tests] = await Promise.all([
    countRows('profiles'),
    countRows('profiles', `last_seen=gte.${since}`),
    countRows('courses'),
    countRows('questions'),
    countRows('materials'),
    countRows('discussion_posts'),
    countRows('support_tickets'),
    countRows('test_results'),
  ]);
  return { students, online, courses, questions, materials, posts, tickets, tests };
}

async function students() {
  const [users, profiles] = await Promise.all([
    allUsers(),
    fetchAll('/rest/v1/profiles?select=id,full_name,department,level,study_level,institution,phone,plan,xp,streak,last_seen,bio&order=id.asc'),
  ]);
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const list = users.map((u) => {
    const p = byId.get(u.id) || {};
    const meta = u.user_metadata || {};
    return {
      id: u.id,
      email: u.email || '',
      name: p.full_name || meta.full_name || meta.name || '',
      department: p.department || '',
      level: p.study_level || p.level || '',
      institution: p.institution || '',
      phone: p.phone || '',
      plan: p.plan || '',
      xp: p.xp || 0,
      streak: p.streak || 0,
      last_seen: p.last_seen || u.last_sign_in_at || null,
      joined: u.created_at || null,
      provider: (u.app_metadata && u.app_metadata.provider) || '',
      exam_date: meta.exam_date || '',
    };
  });
  list.sort((a, b) => String(b.last_seen || '').localeCompare(String(a.last_seen || '')));
  return { students: list };
}

async function notify(body) {
  const title = str(body.title).trim().slice(0, 120);
  const text = str(body.body).trim().slice(0, 600);
  const type = NOTIF_TYPES.includes(body.type) ? body.type : 'info';
  if (!title) throw bad('Add a title.');
  let ids;
  if (body.to === 'all') {
    ids = (await allUsers()).map((u) => u.id);
  } else if (UUID_RE.test(str(body.to))) {
    ids = [body.to];
  } else {
    throw bad('Choose who to send this to.');
  }
  if (!ids.length) throw bad('There are no students to send to yet.');
  const rows = ids.map((id) => ({ user_id: id, title, body: text || null, type, is_read: false, popup_shown: false }));
  for (let i = 0; i < rows.length; i += 500) {
    await ensure(await sb('/rest/v1/notifications', {
      method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(rows.slice(i, i + 500)),
    }));
  }
  return { sent: ids.length };
}

async function notifHistory() {
  const r = await ensure(await sb('/rest/v1/notifications?select=title,body,type,created_at&order=created_at.desc&limit=1000'));
  const rows = await r.json();
  const groups = new Map();
  for (const n of rows) {
    const k = [n.title, n.body || '', n.type || ''].join('\u0001');
    const g = groups.get(k);
    if (g) g.count += 1;
    else groups.set(k, { title: n.title, body: n.body, type: n.type, count: 1, last_at: n.created_at });
  }
  return { items: [...groups.values()].slice(0, 40) };
}

async function deleteNotifs(body) {
  const title = str(body.title);
  if (!title) throw bad('Nothing to delete.');
  const bodyFilter = body.body == null || body.body === '' ? 'body=is.null' : `body=eq.${encodeURIComponent(str(body.body))}`;
  await ensure(await sb(`/rest/v1/notifications?title=eq.${encodeURIComponent(title)}&${bodyFilter}`, { method: 'DELETE' }));
  return { ok: true };
}

async function importQuestions(body) {
  if (!UUID_RE.test(str(body.course_id))) throw bad('Choose a course first.');
  const items = Array.isArray(body.items) ? body.items : null;
  if (!items || !items.length) throw bad('Paste a list of questions first.');
  if (items.length > 300) throw bad('Import up to 300 questions at a time.');
  const rows = items.map((q, i) => {
    checkQuestion(q || {}, `Question ${i + 1}`);
    return {
      course_id: body.course_id,
      question: str(q.question).trim(),
      options: q.options.map((o) => str(o).trim()),
      correct_index: Number(q.correct_index),
      explanation: q.explanation ? str(q.explanation).trim() : null,
      difficulty: q.difficulty ? str(q.difficulty).trim().toLowerCase() : null,
    };
  });
  for (let i = 0; i < rows.length; i += 100) {
    await ensure(await sb('/rest/v1/questions', {
      method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(rows.slice(i, i + 100)),
    }));
  }
  return { added: rows.length };
}

// ====================================================================
export default async function handler(request) {
  if (request.method === 'GET') {
    return new Response(PAGE, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!SERVICE_KEY || !SESSION_SECRET || SESSION_SECRET.length < 16) {
    return json({ error: 'The admin panel is not set up on the server yet. Add SUPABASE_SERVICE_ROLE_KEY and ADMIN_SESSION_SECRET in Vercel, then redeploy.' }, 500);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const action = str(body.action);

  try {
    const rec = await kvGet('pin');
    const authed = rec ? await checkToken(readCookie(request), rec.ver) : false;

    if (action === 'status') return json({ setup: !!rec, authed });

    if (action === 'setup') {
      if (rec) return json({ error: 'A PIN is already set.' }, 409);
      if (!/^\d{4}$/.test(str(body.pin))) return json({ error: 'Use exactly 4 digits.' }, 400);
      const fresh = await newPinRecord(body.pin);
      if (!(await kvInsertOnly('pin', fresh))) return json({ error: 'A PIN is already set.' }, 409);
      return json({ ok: true }, 200, { 'Set-Cookie': cookie(await makeToken(fresh.ver), SESSION_DAYS * 86400) });
    }

    if (action === 'login') {
      if (!rec) return json({ error: 'No PIN is set yet.' }, 400);
      if (!/^\d{4}$/.test(str(body.pin))) return json({ error: 'Enter 4 digits.' }, 400);
      const a = await attemptPin(request, body.pin, rec);
      if (a.locked) return lockedResponse(a);
      if (!a.ok) return wrongResponse(a);
      return json({ ok: true }, 200, { 'Set-Cookie': cookie(await makeToken(rec.ver), SESSION_DAYS * 86400) });
    }

    if (action === 'logout') return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });

    if (!authed) return json({ error: 'Please enter your PIN.' }, 401);

    switch (action) {
      case 'change_pin': {
        if (!/^\d{4}$/.test(str(body.pin)) || !/^\d{4}$/.test(str(body.current))) return json({ error: 'Use exactly 4 digits.' }, 400);
        const a = await attemptPin(request, body.current, rec);
        if (a.locked) return lockedResponse(a);
        if (!a.ok) return wrongResponse(a);
        const fresh = await newPinRecord(body.pin);
        await kvSet('pin', fresh);
        return json({ ok: true }, 200, { 'Set-Cookie': cookie(await makeToken(fresh.ver), SESSION_DAYS * 86400) });
      }
      case 'stats': return json(await stats());
      case 'list': return json(await listRows(body));
      case 'save': return json(await saveRow(body));
      case 'remove': return json(await removeRow(body));
      case 'students': return json(await students());
      case 'notify': return json(await notify(body));
      case 'notif_history': return json(await notifHistory());
      case 'del_notifs': return json(await deleteNotifs(body));
      case 'import_questions': return json(await importQuestions(body));
      default: return json({ error: 'Unknown action.' }, 400);
    }
  } catch (err) {
    if (!err.http) console.error('admin api error:', err);
    if (err.http === 404 && /admin_settings/.test(err.message)) {
      return json({ error: 'Run admin-setup.sql in the Supabase SQL Editor first.' }, 500);
    }
    return json({ error: err.message || 'Something went wrong.' }, err.http || 500);
  }
}
