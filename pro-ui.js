/* PRIME-CBT Pro UI  ->  save as  pro-ui.js  in the project root (next to nav.js and quota.js)
   Plan popup, Paystack checkout, congratulations splash, payment receipt, home card and profile banner.
   Everything is decided by the database function pro_status(), so a student who is not allowed to see Pro sees NOTHING.

   Add to a page (after its Supabase client exists):
     <script src="pro-ui.js"></script>
     <script> PrimePro.init(supabaseClient).then(function () { PrimePro.mount(document.getElementById('proCard')); }); </script>
   Profile page:  PrimePro.init(sb).then(function () { PrimePro.mount(document.getElementById('proBanner'), { compact: true }); });

   Payment flow:  Choose plan -> edge function paystack-init -> Paystack page -> back to the site with ?payment_ref=...
                  -> edge function paystack-verify (server asks Paystack) -> splash + receipt.
   The page that Paystack returns to must load this file (see index.html redirect note).
*/
(function () {
  'use strict';
  var VERSION = 'v3', db = null, st = null, loading = null, resumed = false, mounts = [];
  var REF_KEY = 'prime_pay_ref', REF_RE = /^PCBT_[A-Za-z0-9]{10,40}$/;

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var naira = function (n) { return '\u20a6' + Number(n || 0).toLocaleString('en-NG'); };
  var nairaK = function (k) { return naira(Number(k || 0) / 100); };
  var dateTxt = function (d) { return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' }) : ''; };
  var timeTxt = function (d) { return d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }) : ''; };
  var monthsTxt = function (n) { return n + (Number(n) === 1 ? ' month' : ' months'); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

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
      '.pp-x{background:#1e293b;border:0;color:#cbd5e1;border-radius:10px;min-width:36px;min-height:36px;cursor:pointer;font-size:1rem}' +
      '.pp-plan{background:#10182B;border:1px solid #334155;border-radius:18px;padding:16px;margin-bottom:12px;position:relative}' +
      '.pp-plan.pp-hot{border-color:#10b981}' +
      '.pp-badge{position:absolute;top:-10px;right:14px;background:#f59e0b;color:#1c1203;font-weight:800;font-size:.7rem;border-radius:999px;padding:4px 10px}' +
      '.pp-name{font-weight:800;font-size:1.05rem}.pp-price{font-size:1.7rem;font-weight:800;color:#34d399;margin-top:4px}' +
      '.pp-was{font-size:.9rem;color:#64748b;text-decoration:line-through;font-weight:500;margin-left:8px}.pp-per{font-size:.8rem;color:#94a3b8;font-weight:500}' +
      '.pp-ul{list-style:none;margin:12px 0 14px;padding:0}.pp-ul li{font-size:.88rem;color:#cbd5e1;padding:4px 0 4px 24px;position:relative}' +
      '.pp-ul li:before{content:"\\2713";position:absolute;left:0;color:#34d399;font-weight:800}' +
      '.pp-full{width:100%;min-height:48px;font-size:.95rem}' +
      '.pp-note{font-size:.78rem;color:#94a3b8;text-align:center;margin-top:10px;line-height:1.5}' +
      '.pp-test{background:#1e293b;color:#fbbf24;font-size:.75rem;border-radius:8px;padding:8px 10px;margin-bottom:12px;text-align:center}' +
      '.pp-spin{width:34px;height:34px;margin:6px auto 14px;border-radius:50%;border:3px solid #1e293b;border-top-color:#34d399;animation:ppSpin .8s linear infinite}' +
      '@keyframes ppSpin{to{transform:rotate(360deg)}}' +
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
      '@media(prefers-reduced-motion:reduce){.pp-check,.pp-check svg,.pp-splash h1,.pp-splash p,.pp-splash .pp-acts{animation:none;opacity:1;stroke-dashoffset:0}.pp-conf{display:none}.pp-spin{animation:none}}' +
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
  function init(client) {
    db = client; css();
    return load(true).then(function (s) { resume(); return s; });
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

  /* ---------- plans popup ---------- */
  function openPlans() {
    if (!st || !(st.plans || []).length) { toast('Pro plans are not available right now.'); return; }
    var o = overlay('pp-plans');
    var test = st.mode === 'test';
    var h = '<div class="pp-sheet" role="dialog" aria-modal="true" aria-label="Prime CBT plans"><div class="pp-h"><h2>Choose your plan</h2><button type="button" class="pp-x" id="ppClose" aria-label="Close">&#10005;</button></div>';
    if (test) h += '<div class="pp-test">TEST PHASE: only you can see this. Payments here are real.</div>';
    st.plans.forEach(function (p) {
      h += '<div class="pp-plan' + (p.discount_percent ? ' pp-hot' : '') + '">' + (p.discount_percent ? '<div class="pp-badge">Save ' + p.discount_percent + '%</div>' : '') +
        '<div class="pp-name">Prime ' + esc(p.name) + '</div>' +
        '<div class="pp-price">' + naira(p.price) + (p.original_price ? '<span class="pp-was">' + naira(p.original_price) + '</span>' : '') + ' <span class="pp-per">for ' + monthsTxt(p.months) + '</span></div>' +
        '<ul class="pp-ul">' + (p.benefits || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' +
        '<button type="button" class="pp-btn pp-full" data-buy="' + esc(p.code) + '">Choose ' + esc(p.name) + '</button></div>';
    });
    h += '<div class="pp-note">You pay securely on Paystack with card, bank transfer or USSD. Your plan starts as soon as payment is confirmed. <span style="opacity:.5">(' + VERSION + ')</span></div></div>';
    o.innerHTML = h;
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
    o.querySelector('#ppClose').onclick = function () { o.remove(); };
    o.querySelectorAll('[data-buy]').forEach(function (b) { b.onclick = function () { buy(b.getAttribute('data-buy'), b); }; });
  }

  /* ---------- start a real Paystack payment ---------- */
  async function buy(code, btn) {
    if (!db) return;
    var plan = (st.plans || []).filter(function (p) { return p.code === code; })[0];
    if (!plan) return;
    var all = document.querySelectorAll('#pp-plans [data-buy]');
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

  /* coming back with the browser Back button from Paystack: do not leave the plans sheet frozen */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { var p = document.getElementById('pp-plans'); if (p) p.remove(); }
  });

  window.PrimePro = { init: init, load: load, refresh: refresh, status: status, mount: mount, openPlans: openPlans, receipt: receipt, viewLatestReceipt: viewLatestReceipt };
})();
