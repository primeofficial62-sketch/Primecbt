(function () {
  /* GPU layers + skip rendering off-screen cards. No visual change. */
  var s = document.createElement('style');
  s.textContent =
    '.bottom-nav,.topbar{transform:translateZ(0);will-change:transform}' +
    '.tip,.tool,#activityList,#updatesSection{content-visibility:auto;contain-intrinsic-size:auto 80px}';
  document.head.appendChild(s);

  /* Images: decode off main thread, lazy-load below the fold */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('img').forEach(function (i) {
      i.decoding = 'async';
      if (!i.hasAttribute('loading') && i.getBoundingClientRect().top > innerHeight) i.loading = 'lazy';
    });
  });

  /* Instant page switches: prefetch pages on touch + when idle */
  var done = {}, c = navigator.connection || {};
  var saver = c.saveData || /2g/.test(c.effectiveType || '');
  function pf(u) {
    if (done[u]) return; done[u] = 1;
    var l = document.createElement('link'); l.rel = 'prefetch'; l.href = u; document.head.appendChild(l);
  }
  document.addEventListener('touchstart', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (a && a.origin === location.origin && /\.html$/.test(a.pathname) && a.pathname !== location.pathname) pf(a.href);
  }, { passive: true });
  var idle = window.requestIdleCallback || function (f) { setTimeout(f, 2000); };
  if (!saver) idle(function () { ['practice.html', 'materials.html', 'progress.html'].forEach(pf); });

  /* Cache static files for repeat visits */
  if ('serviceWorker' in navigator) addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
})();