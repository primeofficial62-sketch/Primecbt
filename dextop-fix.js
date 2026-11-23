(function () {
  var DESK = 1024, W = 260;

  // Every rule below sits inside a min-width media query, so phones and tablets below 1024px are never touched.
  var css = document.createElement('style');
  css.textContent =
  '@media (min-width:' + DESK + 'px){' +
  '.pc-hide{display:none!important}' +
  '.pc-bottomnav{position:fixed!important;left:0!important;top:0!important;bottom:0!important;right:auto!important;width:' + W + 'px!important;height:100vh!important;display:flex!important;flex-direction:column!important;justify-content:flex-start!important;align-items:stretch!important;gap:6px!important;padding:64px 12px 20px!important;overflow-y:auto!important;border-top:0!important;border-right:1px solid rgba(128,128,128,.25)!important;border-radius:0!important;margin:0!important;z-index:1200!important;transition:transform .25s ease!important;box-shadow:4px 0 24px rgba(0,0,0,.18)!important}' +
  '.pc-bottomnav>*,.pc-bottomnav a{flex:0 0 auto!important;flex-direction:row!important;justify-content:flex-start!important;align-items:center!important;gap:12px!important;text-align:left!important;width:100%!important;padding:10px 12px!important;border-radius:10px!important}' +
  'body.pc-side{padding-bottom:0!important}' +
  'body.pc-side img,body.pc-side video,body.pc-side canvas{max-width:100%}' +
  'body.pc-side main,body.pc-side .container,body.pc-side .content{max-width:1100px;margin-left:auto;margin-right:auto}' +
  'body.pc-side:not(.pc-open) .pc-bottomnav{transform:translateX(-100%)!important;box-shadow:none!important}' +
  '.pc-burger{position:fixed;top:12px;left:12px;z-index:1300;width:42px;height:42px;border:0;border-radius:10px;background:#111;color:#fff;font-size:22px;line-height:1;cursor:pointer;display:block;box-shadow:0 2px 10px rgba(0,0,0,.25)}' +
  '.pc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1100;display:none}' +
  'body.pc-open .pc-overlay{display:block}' +
  '}' +
  // outside laptop view these never show
  '.pc-burger,.pc-overlay{display:none}';
  document.head.appendChild(css);

  // true when the page already has a hamburger that is visible on this screen
  function hasOwnBurger() {
    var q = document.querySelectorAll('[class*="hamburger" i],[class*="burger" i],[class*="menu-toggle" i],[id*="hamburger" i],[id*="burger" i],[aria-label*="menu" i]');
    for (var i = 0; i < q.length; i++) {
      if (q[i].classList.contains('pc-burger')) continue;
      var r = q[i].getBoundingClientRect(), s = getComputedStyle(q[i]);
      if (r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden') return true;
    }
    return false;
  }

  function findBottomNav() {
    var els = document.querySelectorAll('nav,footer,div,ul,section'), vw = innerWidth, vh = innerHeight;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.classList.contains('pc-hide') || el.classList.contains('pc-bottomnav')) return el;
      if (getComputedStyle(el).position !== 'fixed') continue;
      var r = el.getBoundingClientRect();
      if (r.width < vw * 0.8 || r.height > 130 || r.height < 30 || r.bottom < vh - 3) continue;
      if (el.querySelectorAll('a,button').length < 3) continue;
      return el;
    }
    return null;
  }

  function setup() {
    if (innerWidth < DESK) return;                       // phones/tablets: do nothing
    if (document.body.classList.contains('pc-done')) return;
    var nav = findBottomNav();
    if (!nav) return;
    document.body.classList.add('pc-done');

    // Page already has its own hamburger on laptop: just hide the bottom nav.
    if (hasOwnBurger()) { nav.classList.add('pc-hide'); return; }

    // No hamburger on this page: turn the bottom nav into a slide-in menu with a new hamburger.
    nav.classList.add('pc-bottomnav');
    document.body.classList.add('pc-side');
    var b = document.createElement('button');
    b.className = 'pc-burger'; b.type = 'button'; b.setAttribute('aria-label', 'Menu'); b.innerHTML = '&#9776;';
    var o = document.createElement('div'); o.className = 'pc-overlay';
    document.body.appendChild(o); document.body.appendChild(b);
    var toggle = function (on) { document.body.classList.toggle('pc-open', on); b.innerHTML = on ? '&#10005;' : '&#9776;'; };
    b.onclick = function () { toggle(!document.body.classList.contains('pc-open')); };
    o.onclick = function () { toggle(false); };
    nav.addEventListener('click', function (e) { if (e.target.closest('a,button')) toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }

  window.addEventListener('load', function () { setTimeout(setup, 700); });
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(setup, 250); });
})();