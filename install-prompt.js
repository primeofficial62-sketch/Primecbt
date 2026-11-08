 (function () {
  var installed =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (installed) return;
  if (localStorage.getItem('pwa_dismissed')) return;

  var deferred = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    if (document.getElementById('installPopup')) return;

    var box = document.createElement('div');
    box.id = 'installPopup';
    box.style.cssText =
      'position:fixed;left:16px;right:16px;bottom:90px;z-index:99999;' +
      'background:#0d1530;color:#fff;padding:16px;border-radius:16px;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.45);font-family:Inter,sans-serif;';
    box.innerHTML =
      '<b style="font-size:16px">Install Prime CBT</b>' +
      '<p style="margin:6px 0 12px;font-size:14px;opacity:.8">Add the app to your home screen for faster access.</p>' +
      '<div style="display:flex;gap:8px">' +
      '<button id="piInstall" style="flex:1;padding:10px;border:0;border-radius:12px;background:#34d399;color:#000;font-weight:600">Install</button>' +
      '<button id="piLater" style="flex:1;padding:10px;border:0;border-radius:12px;background:rgba(255,255,255,.12);color:#fff">Later</button>' +
      '</div>';
    document.body.appendChild(box);

    document.getElementById('piInstall').onclick = function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () {
        deferred = null;
        box.remove();
      });
    };
    document.getElementById('piLater').onclick = function () {
      localStorage.setItem('pwa_dismissed', String(Date.now()));
      box.remove();
    };
  });

  window.addEventListener('appinstalled', function () {
    var b = document.getElementById('installPopup');
    if (b) b.remove();
  });
})();
