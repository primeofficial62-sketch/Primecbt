/* PRIME-CBT Pro UI  ->  save as  pro-ui.js  in the project root (next to nav.js and quota.js)
   Plan popup, congratulations splash, payment receipt, home card and profile banner.
   Everything is decided by the database function pro_status(), so a student who is not allowed to see Pro sees NOTHING.

   Add to a page (after its Supabase client exists):
     <script src="pro-ui.js"></script>
     <script> PrimePro.init(supabaseClient).then(function () { PrimePro.mount(document.getElementById('proCard')); }); </script>
   Profile page:  PrimePro.init(sb).then(function () { PrimePro.mount(document.getElementById('proBanner'), { compact: true }); });
*/
(function () {
  'use strict';
  var db = null, st = null, loading = null;

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var naira = function (n) { return '\u20a6' + Number(n || 0).toLocaleString('en-NG'); };
  var nairaK = function (k) { return naira(Number(k || 0) / 100); };
  var dateTxt = function (d) { return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' }) : ''; };
  var timeTxt = function (d) { return d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }) : ''; };
  var monthsTxt = function (n) { return n + (Number(n) === 1 ? ' month' : ' months'); };

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
      '@media(prefers-reduced-motion:reduce){.pp-check,.pp-check svg,.pp-splash h1,.pp-splash p,.pp-splash .pp-acts{animation:none;opacity:1;stroke-dashoffset:0}.pp-conf{display:none}}' +
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
  function init(client) { db = client; css(); return load(true); }
  function status() { return st; }

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'pp-toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200);
  }
  function overlay(id, cls) {
    var old = document.getElementById(id); if (old) old.remove();
    var o = document.createElement('div'); o.id = id; o.className = 'pp-ov' + (cls ? ' ' + cls : '');
    document.body.appendChild(o);
    return o;
  }

  /* ---------- plans popup ---------- */
  function openPlans() {
    if (!st || !(st.plans || []).length) { toast('Pro plans are not available right now.'); return; }
    var o = overlay('pp-plans');
    var test = st.mode === 'test';
    var h = '<div class="pp-sheet" role="dialog" aria-modal="true" aria-label="Prime CBT plans"><div class="pp-h"><h2>Choose your plan</h2><button type="button" class="pp-x" id="ppClose" aria-label="Close">&#10005;</button></div>';
    if (test) h += '<div class="pp-test">TEST MODE: no real money is charged.</div>';
    st.plans.forEach(function (p, i) {
      h += '<div class="pp-plan' + (p.discount_percent ? ' pp-hot' : '') + '">' + (p.discount_percent ? '<div class="pp-badge">Save ' + p.discount_percent + '%</div>' : '') +
        '<div class="pp-name">Prime ' + esc(p.name) + '</div>' +
        '<div class="pp-price">' + naira(p.price) + (p.original_price ? '<span class="pp-was">' + naira(p.original_price) + '</span>' : '') + ' <span class="pp-per">for ' + monthsTxt(p.months) + '</span></div>' +
        '<ul class="pp-ul">' + (p.benefits || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' +
        '<button type="button" class="pp-btn pp-full" data-buy="' + esc(p.code) + '">Choose ' + esc(p.name) + '</button></div>';
    });
    h += '<div class="pp-note">Your plan starts the moment payment succeeds, with every benefit unlocked and a receipt sent to your email.</div></div>';
    o.innerHTML = h;
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
    o.querySelector('#ppClose').onclick = function () { o.remove(); };
    o.querySelectorAll('[data-buy]').forEach(function (b) { b.onclick = function () { buy(b.getAttribute('data-buy'), b); }; });
  }

  async function buy(code, btn) {
    if (!db) return;
    var plan = (st.plans || []).filter(function (p) { return p.code === code; })[0];
    if (!plan) return;
    if (!(st.mode === 'test' && st.is_tester)) { toast('Online payment opens very soon.'); return; }   // the real Paystack payment replaces this later
    var label = btn.textContent; btn.disabled = true; btn.textContent = 'Upgrading…';
    try {
      var s = await db.auth.getSession();
      var token = s && s.data && s.data.session && s.data.session.access_token;
      var res = await fetch('/api/pro', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ action: 'test_buy', code: code }) });
      var d = {}; try { d = await res.json(); } catch (e) { /* not JSON */ }
      if (!res.ok || !d.receipt) throw new Error(d.error || 'Upgrade failed. Try again.');
      var pl = document.getElementById('pp-plans'); if (pl) pl.remove();
      await load(true);
      if (window.PrimeQuota && window.PrimeQuota.usage) { try { window.PrimeQuota.usage(db, true); } catch (e) { /* ignore */ } }
      document.dispatchEvent(new CustomEvent('prime:pro-changed', { detail: st }));
      splash(d.receipt);
    } catch (e) {
      btn.disabled = false; btn.textContent = label;
      toast(e.message || 'Upgrade failed.');
    }
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
      '<div class="pp-rc"><div class="pp-rc-top"><small>PRIME CBT</small><b>Payment receipt</b><span>' + esc(r.receipt_no) + '</span></div>' +
      '<div class="pp-rc-b">' +
      row('Plan', 'Prime ' + r.package_name) + row('Duration', monthsTxt(r.months)) +
      row('Paid on', dateTxt(r.paid_at) + ', ' + timeTxt(r.paid_at)) +
      (r.expires_at ? row('Valid until', dateTxt(r.expires_at)) : '') +
      row('Reference', r.reference) + row('Receipt no.', r.receipt_no) +
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

  window.PrimePro = { init: init, load: load, status: status, mount: mount, openPlans: openPlans, receipt: receipt, viewLatestReceipt: viewLatestReceipt };
})();
