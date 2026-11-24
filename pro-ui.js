/* PRIME-CBT Pro UI  ->  save as  pro-ui.js  in the project root (next to nav.js and quota.js)
   Intro sheet, subscribe screen, Paystack checkout, congratulations splash, payment receipt, home card and profile banner.
   Everything is decided by the database function pro_status(), so a student who is not allowed to see Pro sees NOTHING.
   When you switch Pro to "live" in the admin panel, pro_status() starts returning can_subscribe = true and the intro sheet appears.

   Add to a page (after its Supabase client exists):
     <script src="pro-ui.js"></script>
     <script> PrimePro.init(supabaseClient).then(function () { PrimePro.mount(document.getElementById('proCard')); }); </script>
   Profile page:  PrimePro.init(sb).then(function () { PrimePro.mount(document.getElementById('proBanner'), { compact: true }); });
   To skip the automatic intro sheet on a page:  PrimePro.init(sb, { intro: false })

   Flow:  Enter site -> intro sheet (Cancel or "Try Prime CBT Pro Now") -> subscribe screen (pick a plan) -> edge function paystack-init
          -> Paystack page -> back to the site with ?payment_ref=... -> edge function paystack-verify -> splash + receipt.
   The page that Paystack returns to must load this file.
*/
(function () {
  'use strict';
  var VERSION = 'v4', db = null, st = null, loading = null, resumed = false, mounts = [], introOn = true;
  var REF_KEY = 'prime_pay_ref', INTRO_KEY = 'prime_pro_intro', REF_RE = /^PCBT_[A-Za-z0-9]{10,40}$/;

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var naira = function (n) { return '\u20a6' + Number(n || 0).toLocaleString('en-NG'); };
  var nairaK = function (k) { return naira(Number(k || 0) / 100); };
  var dateTxt = function (d) { return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' }) : ''; };
  var timeTxt = function (d) { return d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }) : ''; };
  var monthsTxt = function (n) { return n + (Number(n) === 1 ? ' month' : ' months'); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  var GEM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 6 3-6M12 21L9 9M12 21l3-12"/></svg>';
  var BICONS = [
    '<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 9h6M9 13h4"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
    '<path d="M3 8c5-4 13-4 18 0M6 12c3-2.5 9-2.5 12 0M12 17h.01M4 4l16 16"/>',
    '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 13h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01"/>',
    '<path d="M5 13l4 4L19 7"/>'
  ];
  var BCOLORS = ['#a78bfa', '#2dd4bf', '#fb923c', '#38bdf8', '#f472b6', '#34d399'];

  /* ---------- styles ---------- */
  function css() {
    if (document.getElementById('pp-css')) return;
    var s = document.createElement('style'); s.id = 'pp-css';
    s.textContent =
      '.pp-card{display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:linear-gradient(135deg,#0f2a2a,#10182B);border:1px solid #10b981;border-radius:18px;padding:16px;color:#f1f5f9;font-family:inherit}' +
      '.pp-card .pp-ico{flex:none;width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#10b981,#2dd4bf);display:grid;place-items:center;color:#022c22}' +
      '.pp-card .pp-ico svg{width:24px;height:24px}' +
      '.pp-card .pp-body{flex:1;min-width:0}.pp-card b{display:block;font-size:.98rem}.pp-card span.pp-sub{display:block;font-size:.8rem;color:#94a3b8;margin-top:2px}' +
      '.pp-card.pp-compact{padding:12px 14px;border-radius:16px}' +
      '.pp-btn{flex:none;border:0;border-radius:12px;min-height:40px;padding:0 16px;background:linear-gradient(135deg,#10b981,#2dd4bf);color:#022c22;font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit}' +
      '.pp-btn.pp-ghost{background:transparent;color:#34d399;border:1px solid #10b981}' +
      '.pp-btn[disabled]{opacity:.6;cursor:default}' +
      '.pp-ov{position:fixed;inset:0;z-index:3000;background:rgba(2,6,23,.82);display:flex;align-items:flex-end;justify-content:center;font-family:Inter,system-ui,sans-serif;color:#f1f5f9;overflow-y:auto;-webkit-overflow-scrolling:touch}' +
      '.pp-sheet{width:100%;max-width:440px;margin:auto;background:#0f172a;border:1px solid #334155;border-radius:24px 24px 0 0;padding:20px 18px calc(env(safe-area-inset-bottom,0px) + 22px)}' +
      '@media(min-width:600px){.pp-ov{align-items:center}.pp-sheet{border-radius:24px}}' +
      '.pp-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.pp-h h2{font-size:1.1rem;margin:0}' +
      '.pp-x{background:#1e293b;border:0;color:#cbd5e1;border-radius:50%;min-width:38px;min-height:38px;cursor:pointer;font-size:1rem;display:grid;place-items:center}' +
      '.pp-full{width:100%;min-height:52px;font-size:1rem}' +
      '.pp-note{font-size:.78rem;color:#94a3b8;text-align:center;margin-top:10px;line-height:1.5}' +
      '.pp-test{background:#1e293b;color:#fbbf24;font-size:.75rem;border-radius:8px;padding:8px 10px;margin-bottom:12px;text-align:center}' +
      '.pp-spin{width:34px;height:34px;margin:6px auto 14px;border-radius:50%;border:3px solid #1e293b;border-top-color:#34d399;animation:ppSpin .8s linear infinite}' +
      '@keyframes ppSpin{to{transform:rotate(360deg)}}' +
      /* intro sheet */
      '.pp-intro{background:rgba(2,6,23,.72)}' +
      '.pp-isheet{position:relative;width:100%;max-width:480px;margin:auto 0 0;max-height:94vh;overflow-y:auto;background:#10192B;border-radius:28px 28px 0 0;padding:22px 20px calc(env(safe-area-inset-bottom,0px) + 22px);animation:ppSlide .35s ease both}' +
      '@media(min-width:600px){.pp-intro{align-items:center}.pp-isheet{margin:auto;border-radius:28px}}' +
      '@keyframes ppSlide{0%{transform:translateY(60px);opacity:0}100%{transform:none;opacity:1}}' +
      '.pp-isheet .pp-x{position:absolute;top:16px;right:16px}' +
      '.pp-gem{width:64px;height:64px;margin:14px auto 16px;border-radius:50%;background:linear-gradient(135deg,#10b981,#6366f1);display:grid;place-items:center;color:#fff}.pp-gem svg{width:32px;height:32px}' +
      '.pp-ititle{text-align:center;font-size:1.3rem;line-height:1.3;font-weight:800;letter-spacing:.3px;color:#31D3A2;margin:0 8px 22px;text-transform:uppercase}' +
      '.pp-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px 14px}' +
      '.pp-bi{display:flex;gap:10px;align-items:flex-start;min-width:0}' +
      '.pp-bi svg{flex:none;width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
      '.pp-bi b{display:block;font-size:.95rem;color:#F4F6FC;line-height:1.25;overflow-wrap:anywhere}.pp-bi span{display:block;font-size:.8rem;color:#9BA8BE;margin-top:3px;line-height:1.4}' +
      '.pp-isheet .pp-btn{margin-top:26px}' +
      /* subscribe screen */
      '.pp-sc{position:fixed;inset:0;z-index:3050;display:flex;flex-direction:column;background:linear-gradient(180deg,#0B1437 0%,#143a4a 100%);font-family:Inter,system-ui,sans-serif;color:#f1f5f9;animation:ppFade .25s ease both}' +
      '@keyframes ppFade{0%{opacity:0}100%{opacity:1}}' +
      '.pp-sc-top{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top,0px) + 16px) 16px 18px}' +
      '.pp-sc-top .pp-x{position:absolute;top:calc(env(safe-area-inset-top,0px) + 14px);right:14px;background:#e2e8f0;color:#2563eb;z-index:2}' +
      '.pp-sc-gem{width:64px;height:64px;margin:0 auto 10px;border-radius:50%;background:linear-gradient(135deg,#10b981,#6366f1);display:grid;place-items:center;color:#fff}.pp-sc-gem svg{width:32px;height:32px}' +
      '.pp-sc-h{text-align:center;margin:0 0 16px;font-size:1.05rem;font-weight:800;letter-spacing:.6px;text-transform:uppercase}.pp-sc-h span{display:block;font-size:1.4rem;color:#31D3A2;letter-spacing:0;text-transform:none;margin-top:2px}' +
      '.pp-bcard{max-width:520px;margin:0 auto;background:#fff;color:#0f172a;border-radius:20px;padding:20px 16px;display:grid;grid-template-columns:1fr 1fr;gap:20px 12px}' +
      '.pp-bcard .pp-bc{text-align:center;min-width:0}.pp-bcard svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
      '.pp-bcard b{display:block;font-size:.92rem;margin-top:6px;line-height:1.25;overflow-wrap:anywhere}.pp-bcard span{display:block;font-size:.76rem;color:#64748b;margin-top:3px;line-height:1.4}' +
      '.pp-buy{flex:none;background:#fff;color:#0f172a;border-radius:26px 26px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 14px);box-shadow:0 -8px 30px rgba(2,6,23,.35)}' +
      '.pp-buy-in{max-width:520px;margin:0 auto}' +
      '.pp-plans{display:flex;gap:10px;overflow-x:auto;padding:12px 2px 6px;margin:-2px -2px 0}' +
      '.pp-opt{position:relative;flex:1 0 0;min-width:112px;border:2px solid #e2e8f0;border-radius:16px;padding:14px 10px 12px;background:#fff;cursor:pointer;text-align:left;font-family:inherit;color:#0f172a}' +
      '.pp-opt.pp-sel{border-color:#2563eb;box-shadow:0 0 0 1px #2563eb}' +
      '.pp-radio{display:block;width:22px;height:22px;border-radius:50%;border:2px solid #94a3b8;margin-bottom:8px;position:relative}' +
      '.pp-opt.pp-sel .pp-radio{border-color:#2563eb}.pp-opt.pp-sel .pp-radio:after{content:"";position:absolute;inset:3px;border-radius:50%;background:#2563eb}' +
      '.pp-oname{display:block;font-size:.95rem;font-weight:600;color:#64748b}.pp-oprice{display:block;font-size:1.1rem;font-weight:800;margin-top:3px}' +
      '.pp-odur{display:block;font-size:.74rem;color:#64748b;margin-top:2px}.pp-owas{display:block;font-size:.74rem;color:#94a3b8;text-decoration:line-through}' +
      '.pp-obadge{position:absolute;left:8px;right:8px;bottom:-10px;background:#ea7a45;color:#fff;font-weight:700;font-size:.74rem;border-radius:999px;padding:5px 0;text-align:center}' +
      '.pp-opt.pp-hasbadge{padding-bottom:20px;margin-bottom:10px}' +
      '.pp-subbtn{width:100%;margin-top:14px;min-height:54px;border:0;border-radius:14px;background:#2563eb;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;font-family:inherit}.pp-subbtn[disabled]{opacity:.6;cursor:default}' +
      '.pp-buy .pp-note{color:#64748b}.pp-buy .pp-test{background:#fef3c7;color:#92400e}' +
      /* splash */
      '.pp-splash{align-items:center;background:radial-gradient(circle at 50% 30%,#064e3b,#020617 70%);text-align:center;overflow:hidden}' +
      '.pp-splash .pp-in{max-width:360px;margin:auto;padding:28px 22px;position:relative;z-index:2}' +
      '.pp-check{width:96px;height:96px;margin:0 auto 18px;border-radius:50%;background:linear-gradient(135deg,#10b981,#2dd4bf);display:grid;place-items:center;animation:ppPop .6s cubic-bezier(.2,1.4,.4,1) both}' +
      '.pp-check svg{width:50px;height:50px;stroke:#022c22;stroke-width:3.5;fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:40;stroke-dashoffset:40;animation:ppDraw .5s .35s ease forwards}' +
      '.pp-splash h1{font-size:1.7rem;margin:0 0 8px;animation:ppUp .5s .3s both}.pp-splash p{color:#cbd5e1;line-height:1.6;margin:0 0 8px;animation:ppUp .5s .45s both}' +
      '.pp-splash .pp-acts{display:flex;flex-direction:column;gap:10px;margin-top:22px;animation:ppUp .5s .6s both}' +
      '.pp-conf{position:absolute;top:-12px;width:9px;height:14px;opacity:.9;animation:ppFall linear infinite;z-index:1}' +
      '@keyframes ppPop{0%{transform:scale(0)}100%{transform:scale(1)}}@keyframes ppDraw{to{stroke-dashoffset:0}}' +
      '@keyframes ppUp{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:none}}' +
      '@keyframes ppFall{0%{transform:translateY(-20px) rotate(0)}100%{transform:translateY(110vh) rotate(540deg)}}' +
      '@media(prefers-reduced-motion:reduce){.pp-check,.pp-check svg,.pp-splash h1,.pp-splash p,.pp-splash .pp-acts,.pp-isheet,.pp-sc{animation:none;opacity:1;stroke-dashoffset:0}.pp-conf{display:none}.pp-spin{animation:none}}' +
      /* receipt */
      '.pp-rc{background:#0f172a;border:1px solid #334155;border-radius:18px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.pp-rc-top{background:linear-gradient(135deg,#10b981,#2dd4bf);padding:18px 18px;color:#022c22}' +
      '.pp-rc-top small{letter-spacing:2px;font-weight:800;font-size:.7rem}.pp-rc-top b{display:block;font-size:1.25rem;margin-top:4px}.pp-rc-top span{font-size:.78rem;color:#064e3b}' +
      '.pp-rc-b{padding:6px 18px 18px}.pp-row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #1e293b;font-size:.85rem}' +
      '.pp-row span:first-child{color:#94a3b8}.pp-row span:last-child{text-align:right;word-break:break-all}' +
      '.pp-total{display:flex;justify-content:space-between;align-items:center;padding-top:14px;font-weight:800}.pp-total span:last-child{color:#34d399;font-size:1.3rem}' +
      '.pp-toast{position:fixed;left:16px;right:16px;bottom:90px;z-index:3100;background:#10182B;color:#f1f5f9;border:1px solid #10b981;border-radius:14px;padding:13px 15px;font:600 .85rem Inter,system-ui,sans-serif;text-align:center}' +
      '@media print{body>*:not(#pp-receipt-ov){display:none!important}#pp-receipt-ov{position:static;background:#fff;display:block}#pp-receipt-ov .pp-sheet{max-width:none;border:0;background:#fff;padding:0}.pp-noprint{display:none!important}}';
    document.head.appendChild(s);
  }

  /* ---------- data ---------- */
  function load(force) {
    if (!db) return Promise.resolve(null);
    if (loading && !force) return loading;
    loading = db.rpc('pro_status').then(function (r) { st = (r && r.data) || null; return st; }).catch(function () { st = null; return null; });
    return loading;
  }
  function init(client, opts) {
    db = client; css();
    introOn = !(opts && opts.intro === false);
    return load(true).then(function (s) { resume(); autoIntro(); return s; });
  }
  function status() { return st; }

  /* reload the status and redraw every card/banner that was mounted on this page */
  function refresh() {
    return load(true).then(function () {
      mounts.forEach(function (m) { mount(m.el, m.opts); });
      document.dispatchEvent(new CustomEvent('prime:pro-changed', { detail: st }));
      return st;
    });
  }

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'pp-toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3600);
  }
  function overlay(id, cls) {
    var old = document.getElementById(id); if (old) old.remove();
    var o = document.createElement('div'); o.id = id; o.className = 'pp-ov' + (cls ? ' ' + cls : '');
    document.body.appendChild(o);
    return o;
  }

  /* ---------- pending payment reference (survives the trip to Paystack) ---------- */
  function keepRef(r) { try { localStorage.setItem(REF_KEY, r); } catch (e) { /* storage blocked */ } }
  function dropRef() { try { localStorage.removeItem(REF_KEY); } catch (e) { /* ignore */ } }
  function pendingRef() {
    var q = '';
    try { q = new URLSearchParams(location.search).get('payment_ref') || ''; } catch (e) { /* ignore */ }
    if (!REF_RE.test(q)) { try { q = localStorage.getItem(REF_KEY) || ''; } catch (e) { q = ''; } }
    return REF_RE.test(q) ? q : '';
  }
  function cleanUrl() {
    try {
      var u = new URL(location.href), had = false;
      ['payment_ref', 'trxref', 'reference'].forEach(function (k) { if (u.searchParams.has(k)) { u.searchParams.delete(k); had = true; } });
      if (had) history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) { /* ignore */ }
  }

  async function fnError(err, fallback) {
    var code = '';
    try { var b = await err.context.json(); code = b && b.error; } catch (e) { /* not JSON */ }
    var map = {
      rate_limited: 'Too many attempts. Wait a few minutes and try again.',
      not_available: 'Prime CBT Pro is not available for your account right now.',
      payments_not_configured: 'Payments are not set up yet.',
      invalid_package: 'That plan is not available.',
      gateway_error: 'Paystack could not start the payment. Try again.',
      unauthorized: 'Please log in again.',
      could_not_create_payment: 'Could not start the payment. Try again.'
    };
    return map[code] || fallback;
  }

  /* ---------- benefits (taken from the plans in the database, de-duplicated) ---------- */
  function benefitList() {
    var seen = {}, out = [];
    ((st && st.plans) || []).forEach(function (p) {
      (p.benefits || []).forEach(function (b) {
        var t = String(b == null ? '' : b).trim(), k = t.toLowerCase();
        if (t && !seen[k]) { seen[k] = 1; out.push(t); }
      });
    });
    return out;
  }
  /* "AI Tutor: Ask questions and get summaries"  ->  title + small description */
  function splitBenefit(b) {
    var m = b.match(/^(.{2,40}?)\s*(?::|\u2013|\u2014|\s-\s)\s*(.+)$/);
    return m ? { t: m[1], d: m[2] } : { t: b, d: '' };
  }
  function benefitIcon(i) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" style="color:' + BCOLORS[i % BCOLORS.length] + '">' + BICONS[i % BICONS.length] + '</svg>';
  }
  function closeAll() {
    ['pp-intro', 'pp-plans'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); });
  }

  /* ---------- 1) intro sheet: shows when a student enters the site ---------- */
  function openIntro() {
    if (!st || !(st.plans || []).length) { toast('Pro plans are not available right now.'); return; }
    var o = overlay('pp-intro', 'pp-intro');
    var items = benefitList().map(function (b, i) {
      var s = splitBenefit(b);
      return '<div class="pp-bi">' + benefitIcon(i) + '<div><b>' + esc(s.t) + '</b>' + (s.d ? '<span>' + esc(s.d) + '</span>' : '') + '</div></div>';
    }).join('');
    o.innerHTML = '<div class="pp-isheet" role="dialog" aria-modal="true" aria-label="Prime CBT Pro">' +
      '<button type="button" class="pp-x" id="ppIClose" aria-label="Close">&#10005;</button>' +
      '<div class="pp-gem">' + GEM + '</div>' +
      '<h2 class="pp-ititle">Study smart, get better grades with Prime CBT Pro</h2>' +
      '<div class="pp-grid">' + items + '</div>' +
      '<button type="button" class="pp-btn pp-full" id="ppITry">Try Prime CBT Pro Now</button></div>';
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
    o.querySelector('#ppIClose').onclick = function () { o.remove(); };
    o.querySelector('#ppITry').onclick = function () { o.remove(); openPlans(); };
  }

  /* show the intro once per browser session, only when Pro is live for this student */
  function autoIntro() {
    if (!introOn || !st || !st.can_subscribe || st.is_pro) return;
    try { if (sessionStorage.getItem(INTRO_KEY)) return; } catch (e) { /* storage blocked: show it */ }
    setTimeout(function () {
      if (document.querySelector('.pp-ov, .pp-sc')) return;   // payment check or another sheet is open
      try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (e) { /* ignore */ }
      openIntro();
    }, 900);
  }

  /* ---------- 2) subscribe screen: benefits card + plan cards + subscribe button ---------- */
  function openPlans() {
    if (!st || !(st.plans || []).length) { toast('Pro plans are not available right now.'); return; }
    closeAll();
    var old = document.getElementById('pp-plans'); if (old) old.remove();
    var plans = st.plans, test = st.mode === 'test';
    var sel = (plans.filter(function (p) { return p.discount_percent; })[0] || plans[0]).code;

    var cardItems = benefitList().map(function (b, i) {
      var s = splitBenefit(b);
      return '<div class="pp-bc">' + benefitIcon(i) + '<b>' + esc(s.t) + '</b>' + (s.d ? '<span>' + esc(s.d) + '</span>' : '') + '</div>';
    }).join('');
    var opts = plans.map(function (p) {
      return '<button type="button" class="pp-opt' + (p.discount_percent ? ' pp-hasbadge' : '') + '" data-code="' + esc(p.code) + '" role="radio" aria-checked="false">' +
        '<span class="pp-radio"></span><span class="pp-oname">' + esc(p.name) + '</span>' +
        '<span class="pp-oprice">' + naira(p.price) + '</span><span class="pp-odur">for ' + monthsTxt(p.months) + '</span>' +
        (p.original_price ? '<span class="pp-owas">' + naira(p.original_price) + '</span>' : '') +
        (p.discount_percent ? '<span class="pp-obadge">Save ' + esc(p.discount_percent) + '%</span>' : '') + '</button>';
    }).join('');

    var o = document.createElement('div'); o.id = 'pp-plans'; o.className = 'pp-sc';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Subscribe to Prime CBT Pro');
    o.innerHTML = '<div class="pp-sc-top"><button type="button" class="pp-x" id="ppSClose" aria-label="Close">&#10005;</button>' +
      '<div class="pp-sc-gem">' + GEM + '</div>' +
      '<h2 class="pp-sc-h">Get better grades with<span>Prime CBT Pro</span></h2>' +
      '<div class="pp-bcard">' + cardItems + '</div></div>' +
      '<div class="pp-buy"><div class="pp-buy-in">' +
      (test ? '<div class="pp-test">TEST PHASE: only you can see this. Payments here are real.</div>' : '') +
      '<div class="pp-plans" role="radiogroup" aria-label="Choose a plan">' + opts + '</div>' +
      '<button type="button" class="pp-subbtn" id="ppSub"></button>' +
      '<div class="pp-note">Secure payment with Paystack by card, bank transfer or USSD. Your plan starts as soon as payment is confirmed. <span style="opacity:.5">(' + VERSION + ')</span></div></div></div>';
    document.body.appendChild(o);

    var subBtn = o.querySelector('#ppSub');
    function paint() {
      var plan = plans.filter(function (p) { return p.code === sel; })[0];
      o.querySelectorAll('.pp-opt').forEach(function (b) {
        var on = b.getAttribute('data-code') === sel;
        b.classList.toggle('pp-sel', on); b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      subBtn.textContent = 'Subscribe with ' + naira(plan.price) + ' for ' + monthsTxt(plan.months);
    }
    o.querySelectorAll('.pp-opt').forEach(function (b) { b.onclick = function () { sel = b.getAttribute('data-code'); paint(); }; });
    o.querySelector('#ppSClose').onclick = function () { o.remove(); };
    subBtn.onclick = function () { buy(sel, subBtn); };
    paint();
  }

  /* ---------- start a real Paystack payment ---------- */
  async function buy(code, btn) {
    if (!db) return;
    var plan = (st.plans || []).filter(function (p) { return p.code === code; })[0];
    if (!plan) return;
    var all = document.querySelectorAll('#pp-plans .pp-opt, #pp-plans .pp-subbtn');
    var label = btn.textContent;
    all.forEach(function (x) { x.disabled = true; });
    btn.textContent = 'Opening payment…';
    try {
      var r = await db.functions.invoke('paystack-init', { body: { package_code: code } });
      if (r.error) throw new Error(await fnError(r.error, 'Could not start payment. Try again.'));
      var d = r.data || {};
      if (!d.authorization_url || !/^https:\/\//.test(d.authorization_url) || !REF_RE.test(d.reference || '')) throw new Error('Could not start payment. Try again.');
      keepRef(d.reference);
      window.location.href = d.authorization_url;   // Paystack payment page
    } catch (e) {
      all.forEach(function (x) { x.disabled = false; });
      btn.textContent = label;
      toast((e && e.message) || 'Could not start payment. Try again.');
      try { console.error('PrimePro buy failed', code, e); } catch (x) { /* ignore */ }
    }
  }

  /* ---------- coming back from Paystack: confirm the payment on the server ---------- */
  async function resume() {
    if (resumed || !db) return;
    var ref = pendingRef();
    if (!ref) return;
    resumed = true;

    var fromUrl = /[?&]payment_ref=/.test(location.search);
    var o = fromUrl ? overlay('pp-wait') : document.createElement('div');
    o.innerHTML = '<div class="pp-sheet" role="dialog" aria-modal="true" aria-label="Confirming payment" style="text-align:center"><div class="pp-spin"></div><div class="pp-h" style="justify-content:center"><h2>Confirming your payment</h2></div><div class="pp-note" id="ppWaitMsg">Please wait while we check with Paystack.</div><button type="button" class="pp-btn pp-ghost pp-full" id="ppWaitCancel" style="margin-top:16px">Cancel</button><div class="pp-note">If you already paid, your plan still switches on automatically.</div></div>';

    var cancelled = false;
    o.querySelector('#ppWaitCancel').onclick = function () { cancelled = true; dropRef(); cleanUrl(); o.remove(); };

    var d = null, gone = false;
    var tries = fromUrl ? 8 : 1;
    for (var i = 0; i < tries; i++) {
      if (cancelled) return;
      var r = await db.functions.invoke('paystack-verify', { body: { reference: ref } });
      if (cancelled) return;
      if (r.error) {
        var status = r.error.context && r.error.context.status;
        if (status === 404 || status === 400) { gone = true; break; }   // not this user's payment, or a bad reference
        d = null;
      } else {
        d = r.data || null;
        if (d && d.status !== 'initiated' && d.status !== 'pending') break;
      }
      if (i < tries - 1) await wait(4000);
    }

    if (cancelled) return;
    if (gone) { dropRef(); cleanUrl(); o.remove(); return; }

    if (d && (d.status === 'success' || d.status === 'refunded')) {
      dropRef(); cleanUrl(); o.remove();
      if (d.status === 'refunded') { toast('This payment was refunded.'); await refresh(); return; }
      var months = 0;
      try { var q = await db.from('pro_payments').select('months').eq('reference', ref).maybeSingle(); months = q && q.data && q.data.months; } catch (e) { /* receipt shows a dash */ }
      await refresh();
      if (window.PrimeQuota && window.PrimeQuota.usage) { try { window.PrimeQuota.usage(db, true); } catch (e) { /* ignore */ } }
      splash({
        reference: d.reference, receipt_no: d.receipt_no, package_name: d.package_name, months: months,
        amount_kobo: d.amount_kobo, paid_at: d.paid_at, expires_at: d.expires_at_plan || (st && st.expires_at), emailed: false
      });
      return;
    }

    if (d && d.status && d.status !== 'initiated' && d.status !== 'pending') {   // failed, abandoned, expired
      dropRef(); cleanUrl(); o.remove();
      toast('Payment was not completed. You can try again from the plans.');
      return;
    }

    // still waiting: stop re-checking on every page load, the Paystack webhook activates the plan by itself
    dropRef(); cleanUrl();
    if (!fromUrl) return;
    o.innerHTML = '<div class="pp-sheet" role="dialog" aria-modal="true" aria-label="Payment pending"><div class="pp-h"><h2>Payment still pending</h2></div>' +
      '<div class="pp-note" style="font-size:.88rem;color:#cbd5e1">We have not received confirmation from Paystack yet. If you already paid, your plan switches on automatically within a few minutes. You can close this page.</div>' +
      '<button type="button" class="pp-btn pp-full" id="ppWaitOk" style="margin-top:16px">OK</button></div>';
    o.querySelector('#ppWaitOk').onclick = function () { o.remove(); refresh(); };
  }

  /* ---------- congratulations splash ---------- */
  function splash(r) {
    var o = overlay('pp-splash', 'pp-splash');
    var colors = ['#10b981', '#2dd4bf', '#f59e0b', '#a78bfa', '#f472b6', '#38bdf8'], conf = '';
    for (var i = 0; i < 34; i++) {
      conf += '<i class="pp-conf" style="left:' + Math.round(Math.random() * 100) + '%;background:' + colors[i % colors.length] + ';animation-duration:' + (2.6 + Math.random() * 2.4).toFixed(2) + 's;animation-delay:' + (Math.random() * 1.8).toFixed(2) + 's;border-radius:' + (i % 3 ? '2px' : '50%') + '"></i>';
    }
    o.innerHTML = conf + '<div class="pp-in" role="dialog" aria-modal="true" aria-label="Upgrade successful">' +
      '<div class="pp-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
      '<h1>Congratulations!</h1>' +
      '<p>You are now on <b style="color:#34d399">Prime ' + esc(r.package_name) + '</b>.<br>All your benefits are active right now.</p>' +
      '<p style="font-size:.85rem;color:#94a3b8">' + (r.emailed ? 'Your receipt was sent to ' + esc(r.email || 'your email') + '.' : 'You can view your receipt any time from your profile.') + '</p>' +
      '<div class="pp-acts"><button type="button" class="pp-btn pp-full" id="ppGo">Start using Pro</button><button type="button" class="pp-btn pp-ghost pp-full" id="ppRc">View receipt</button></div></div>';
    o.querySelector('#ppGo').onclick = function () { o.remove(); document.dispatchEvent(new CustomEvent('prime:pro-changed', { detail: st })); };
    o.querySelector('#ppRc').onclick = function () { receipt(r); };
  }

  /* ---------- receipt ---------- */
  function receipt(r) {
    var o = overlay('pp-receipt-ov');
    var test = String(r.reference || '').indexOf('TEST-') === 0;
    var row = function (k, v) { return '<div class="pp-row"><span>' + k + '</span><span>' + esc(v) + '</span></div>'; };
    o.innerHTML = '<div class="pp-sheet" role="dialog" aria-modal="true" aria-label="Payment receipt">' +
      '<div class="pp-h pp-noprint"><h2>Payment receipt</h2><button type="button" class="pp-x" id="ppRx" aria-label="Close">&#10005;</button></div>' +
      '<div class="pp-rc"><div class="pp-rc-top"><small>PRIME CBT</small><b>Payment receipt</b><span>' + esc(r.receipt_no || r.reference) + '</span></div>' +
      '<div class="pp-rc-b">' +
      row('Plan', 'Prime ' + r.package_name) + row('Duration', r.months ? monthsTxt(r.months) : '-') +
      row('Paid on', dateTxt(r.paid_at) + ', ' + timeTxt(r.paid_at)) +
      (r.expires_at ? row('Valid until', dateTxt(r.expires_at)) : '') +
      row('Reference', r.reference) + row('Receipt no.', r.receipt_no || '-') +
      '<div class="pp-total"><span>Amount paid</span><span>' + nairaK(r.amount_kobo) + '</span></div>' +
      (test ? '<div class="pp-test" style="margin-top:14px;margin-bottom:0">TEST payment. No money was charged.</div>' : '') +
      '</div></div>' +
      '<div class="pp-noprint" style="display:flex;gap:10px;margin-top:14px"><button type="button" class="pp-btn pp-full" id="ppPrint">Print / Save as PDF</button></div></div>';
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
    o.querySelector('#ppRx').onclick = function () { o.remove(); };
    o.querySelector('#ppPrint').onclick = function () { window.print(); };
  }

  async function viewLatestReceipt() {
    if (!db) return;
    try {
      var q = await db.from('pro_payments').select('reference,receipt_no,package_name,months,amount_kobo,paid_at').eq('status', 'success').order('paid_at', { ascending: false }).limit(1);
      var p = q && q.data && q.data[0];
      if (!p) { toast('No payment found yet.'); return; }
      p.expires_at = st && st.expires_at;
      receipt(p);
    } catch (e) { toast('Could not load your receipt.'); }
  }

  /* ---------- home card / profile banner ---------- */
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';

  function mount(el, opts) {
    if (!el) return;
    opts = opts || {};
    if (!mounts.some(function (m) { return m.el === el; })) mounts.push({ el: el, opts: opts });
    var s = st;
    el.hidden = true; el.innerHTML = '';
    if (!s) return;   // not allowed to see Pro (or the check failed): show nothing at all
    var title, sub, btn = '', act = null;
    if (s.is_pro) {
      title = 'Prime ' + (s.plan_name || 'CBT Pro') + ' is active';
      sub = s.expires_at ? 'Valid until ' + dateTxt(s.expires_at) : 'Unlimited AI explanations and practice';
      btn = 'View receipt'; act = viewLatestReceipt;
    } else if (s.can_subscribe) {
      title = 'Go Prime CBT Pro';
      sub = 'Unlimited AI explanations and practice sessions';
      btn = 'See plans'; act = openPlans;
    } else if (s.show_coming_soon) {
      title = 'Prime CBT Pro is coming soon';
      sub = s.on_waitlist ? 'You are on the waitlist. We will tell you the moment it opens.' : 'Join the waitlist and be the first to know.';
      btn = s.on_waitlist ? 'On the waitlist' : 'Join waitlist';
      act = s.on_waitlist ? null : async function (b) {
        b.disabled = true;
        try { var r = await db.rpc('join_pro_waitlist'); if (r && r.data && r.data.ok) { toast('You are on the waitlist!'); await load(true); mount(el, opts); } else { b.disabled = false; toast('Could not join. Try again.'); } }
        catch (e) { b.disabled = false; toast('Could not join. Try again.'); }
      };
    } else return;
    el.innerHTML = '<div class="pp-card' + (opts.compact ? ' pp-compact' : '') + '"><span class="pp-ico">' + ICON + '</span><span class="pp-body"><b>' + esc(title) + '</b><span class="pp-sub">' + esc(sub) + '</span></span>' +
      '<button type="button" class="pp-btn' + (act ? '' : ' pp-ghost') + '"' + (act ? '' : ' disabled') + '>' + esc(btn) + '</button></div>';
    var b = el.querySelector('button');
    if (act) b.onclick = function () { act(b); };
    el.hidden = false;
  }

  /* coming back with the browser Back button from Paystack: do not leave the subscribe screen frozen */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { closeAll(); }
  });

  window.PrimePro = { init: init, load: load, refresh: refresh, status: status, mount: mount, openIntro: openIntro, openPlans: openPlans, receipt: receipt, viewLatestReceipt: viewLatestReceipt };
})();
