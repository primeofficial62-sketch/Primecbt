(function () {
  var REF = 'xuofkjjhupgmrphzgyun';
  var RPC = 'https://' + REF + '.supabase.co/rest/v1/rpc/site_access';
  var KEY = 'sb_publishable_GThKt7BvR1D81U939_EQkw_yCnTQ3xh';

  // never block the login page or the admin panel
  if (/(^|\/)(auth|admin)(\.html)?\/?$/i.test(location.pathname)) return;

  var root = document.documentElement, overlay = null, wasBlocked = false;
  root.style.visibility = 'hidden';                       // no flash of the real page
  setTimeout(function () { root.style.visibility = ''; }, 2500);

  function token() {
    try {
      var j = JSON.parse(localStorage.getItem('sb-' + REF + '-auth-token') || 'null');
      return (j && (j.access_token || (j.currentSession && j.currentSession.access_token))) || null;
    } catch (e) { return null; }
  }
  async function call(tok) {
    var r = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + (tok || KEY) },
      body: '{}'
    });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }
  function show(msg) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#060b1a;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;font-family:Inter,system-ui,sans-serif';
      overlay.innerHTML = '<div style="font-size:44px;margin-bottom:14px">🛠️</div><h1 style="font-size:26px;margin:0 0 10px">Under maintenance</h1><p id="mg-msg" style="opacity:.75;max-width:320px;margin:0 0 24px;line-height:1.5"></p><a href="auth.html" style="color:#34d399;font-size:14px;text-decoration:none">Team login</a>';
      document.documentElement.appendChild(overlay);
      document.documentElement.style.overflow = 'hidden';
    }
    overlay.querySelector('#mg-msg').textContent = msg || '';
  }
  function hide() {
    if (overlay) { overlay.remove(); overlay = null; document.documentElement.style.overflow = ''; }
  }
  async function check() {
    var d;
    try { d = await call(token()); }
    catch (e) { try { d = await call(null); } catch (e2) { return; } }   // fail open on network errors
    if (d && d.maintenance && !d.allowed) { wasBlocked = true; show(d.message); }
    else { hide(); if (wasBlocked) location.reload(); wasBlocked = false; }
  }
  check().finally(function () { root.style.visibility = ''; });
  setInterval(check, 30000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
})();