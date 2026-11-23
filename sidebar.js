(function () {
  if (document.getElementById('siteMenu') || document.querySelector('.site-menu,.sm-side')) return;
  var BP = 820;

  var css = document.createElement('style');
  css.textContent =
  '.sm-side{display:none}' +
  '@media (min-width:' + BP + 'px){' +
  '.bottom-nav{display:none!important}' +
  '.sm-side{display:flex;position:fixed;left:0;top:0;bottom:0;width:260px;flex-direction:column;padding:28px 20px;background:#0E192F;border-right:1px solid #273852;z-index:60;font-family:Inter,system-ui,sans-serif}' +
  'body.sm-on:not(.sm-fixed){padding-left:260px!important}' +
  'body.sm-fixed .app{left:260px!important;right:0!important;width:auto!important;max-width:none!important;margin:0!important}' +
  '.sm-head{display:flex;align-items:center;gap:12px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:16px}' +
  '.sm-av{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#31D3A2,#27B58A);color:#06101A;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}' +
  '.sm-name{font-weight:700;color:#F1F5FF;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px}' +
  '.sm-sub{font-size:.75rem;color:#97A6CF;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px}' +
  '.sm-list{list-style:none;margin:0;padding:0;flex:1;display:flex;flex-direction:column;gap:4px;overflow-y:auto}' +
  '.sm-link{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;color:#97A6CF;font-size:.9rem;font-weight:500;width:100%;background:none;border:none;text-align:left;cursor:pointer;text-decoration:none;font-family:inherit}' +
  '.sm-link:hover,.sm-link.active{background:#1A2540;color:#31D3A2}' +
  '.sm-out:hover{color:#f87171}' +
  '}';
  document.head.appendChild(css);

  var links = [['home.html','Home'],['practice.html','Practice'],['community.html','Community'],['progress.html','Progress'],['materials.html','Materials'],['my-study-plan.html','Study Plan'],['ai-assistant.html','AI Assistant'],['profile.html','Profile'],['home.html#support','Support & Review']];
  var here = (location.pathname.split('/').pop() || 'home.html').toLowerCase();

  var nav = document.createElement('nav');
  nav.className = 'sm-side';
  nav.setAttribute('aria-label', 'Sidebar');
  nav.innerHTML =
    '<div class="sm-head"><div class="sm-av" id="smAv">S</div><div style="min-width:0"><div class="sm-name" id="smName">Student</div><div class="sm-sub" id="smSub"></div></div></div>' +
    '<ul class="sm-list">' + links.map(function (l) {
      return '<li><a href="' + l[0] + '" class="sm-link' + (l[0].toLowerCase() === here ? ' active' : '') + '">' + l[1] + '</a></li>';
    }).join('') + '</ul>' +
    '<button type="button" class="sm-link sm-out" id="smOut">Log out</button>';
  document.body.appendChild(nav);
  document.body.classList.add('sm-on');

  // pages whose main box is position:fixed (Community, AI Assistant) need to be pushed right instead
  var app = document.querySelector('.app');
  if (app && getComputedStyle(app).position === 'fixed') document.body.classList.add('sm-fixed');

  document.getElementById('smOut').addEventListener('click', function () {
    try {
      Object.keys(localStorage).forEach(function (k) { if (/^sb-.*-auth-token/.test(k) || k === 'pcbt_snap') localStorage.removeItem(k); });
    } catch (e) {}
    location.replace('auth.html?mode=login');
  });

  try {
    var key = Object.keys(localStorage).filter(function (k) { return /^sb-.*-auth-token$/.test(k); })[0];
    var s = key && JSON.parse(localStorage.getItem(key));
    var u = s && (s.user || (s.currentSession && s.currentSession.user));
    if (u) {
      var m = u.user_metadata || {};
      var n = String(m.full_name || m.name || (u.email || '').split('@')[0] || 'Student');
      document.getElementById('smName').textContent = n;
      document.getElementById('smSub').textContent = u.email || '';
      document.getElementById('smAv').textContent = n.charAt(0).toUpperCase();
    }
  } catch (e) {}
})();
