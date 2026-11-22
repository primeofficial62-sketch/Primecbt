/* tier-badge.js: shows a PRO / PREMIUM / BASIC tag on the avatar circles.
   Add ONE line to home.html, just before </body>:
   <script src="tier-badge.js"></script>
   Needs: supabaseClient (already defined in home.html) and the plan_tier() function in Supabase. */
(function () {
  var css = '' +
    '.avatar-btn,.avatar{position:relative}' +
    '[data-tier]::after{content:attr(data-tier);position:absolute;right:-6px;bottom:-6px;font-size:8px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;line-height:1;padding:3px 6px;border-radius:999px;color:#fff;border:2px solid var(--bg,#070D1D);pointer-events:none}' +
    '[data-tier="pro"]::after{background:#7c3aed}' +
    '[data-tier="premium"]::after{background:#f59e0b;color:#1a1200}' +
    '[data-tier="basic"]::after{background:#64748b}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var IDS = ['topAvatar', 'menuAvatar'];

  function apply(t) {
    t = (t === 'pro' || t === 'premium') ? t : 'basic';
    IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('data-tier', t);
    });
    return t;
  }

  var uid = null;

  function load() {
    if (!uid) return;
    supabaseClient.rpc('plan_tier', { uid: uid }).then(function (r) {
      if (r && !r.error && r.data) {
        var t = apply(r.data);
        try { localStorage.setItem('pcbt_tier_' + uid, t); } catch (e) {}
      }
    }).catch(function () {});
  }

  supabaseClient.auth.getSession().then(function (r) {
    var sess = r && r.data && r.data.session;
    if (!sess) return;
    uid = sess.user.id;
    try {
      var cached = localStorage.getItem('pcbt_tier_' + uid);
      if (cached) apply(cached);
    } catch (e) {}
    load();
  });

  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) load(); });
})();
