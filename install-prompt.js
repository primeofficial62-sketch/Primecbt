(function () {
  // 1. Make sure the manifest is linked
  if (!document.querySelector('link[rel="manifest"]')) {
    var l = document.createElement('link');
    l.rel = 'manifest';
    l.href = '/manifest.webmanifest';
    document.head.appendChild(l);
  }

  // 2. Make sure the service worker is registered
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function (e) {
      console.error('SW register failed', e);
    });
  }

  // 3. Don't show inside the installed app
  var installed =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (installed) return;

  var deferred = null;

  function showPopup(canInstall) {
    if (document.getElementById('installPopup')) return;
    var box = document.createElement('div');
    box.id = 'installPopup';
    box.style.cssText =
      'position:fixed;left:16px;right:16px;bottom:90px;z-index:99999;' +
      'background:#0d1530;color:#fff;padding:16px;border-radius:16px;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.45);font-family:Inter,sans-serif;';
    box.innerHTML =
      '<b style="font-size:16px">Install Prime CBT</b>' +
      '<p style="margin:6px 0 12px;font-size:14px;opacity:.8">' +
      (canInstall
        ? 'Add the app to your home screen for faster access.'
        : 'Open the browser menu (⋮) and tap "Install app" or "Add to Home screen".') +
      '</p><div style="display:flex;gap:8px">' +
      (canInstall
        ? '<button id="piInstall" style="flex:1;padding:10px;border:0;border-radius:12px;background:#34d399;color:#000;font-weight:600">Install</button>'
        : '') +
      '<button id="piLater" style="flex:1;padding:10px;border:0;border-radius:12px;background:rgba(255,255,255,.12);color:#fff">' +
      (canInstall ? 'Later' : 'OK') +
      '</button></div>';
    document.body.appendChild(box);

    var inst = document.getElementById('piInstall');
    if (inst) {
      inst.onclick = function () {
        if (!deferred) return;
        deferred.prompt();
        deferred.userChoice.then(function () {
          deferred = null;
          box.remove();
        });
      };
    }
    document.getElementById('piLater').onclick = function () {
      sessionStorage.setItem('pwa_dismissed', '1');
      box.remove();
    };
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    if (!sessionStorage.getItem('pwa_dismissed')) showPopup(true);
  });

  window.addEventListener('appinstalled', function () {
    var b = document.getElementById('installPopup');
    if (b) b.remove();
  });

  // Fallback: if Chrome hasn't offered install after 4 seconds, show manual steps
  setTimeout(function () {
    if (!deferred && !sessionStorage.getItem('pwa_dismissed')) showPopup(false);
  }, 4000);
})();