/* Instant nav: warm up the next page before the tap finishes */
(function () {
  var warmed = {};
  function warm(a) {
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var u = new URL(href, location.href);
    if (u.origin !== location.origin || u.pathname === location.pathname || warmed[u.pathname]) return;
    warmed[u.pathname] = 1;
    var l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = u.href;
    document.head.appendChild(l);
  }
  function onDown(e) {
    var a = e.target.closest && e.target.closest('a.pn-item, a.nav-item');
    if (a) warm(a);
  }
  document.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('touchstart', onDown, { passive: true });

  /* Also preload every nav page once the browser is idle */
  function preloadAll() {
    document.querySelectorAll('a.pn-item, a.nav-item').forEach(warm);
  }
  if ('requestIdleCallback' in window) requestIdleCallback(preloadAll, { timeout: 2500 });
  else setTimeout(preloadAll, 1500);
})();
