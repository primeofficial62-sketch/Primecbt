<script>
(async function () {
  const say = (m) => {
    const d = document.createElement('div');
    d.textContent = 'Bell debug: ' + m;
    d.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;padding:10px;background:#c00;color:#fff;font-size:13px;border-radius:8px;z-index:99999';
    document.body.appendChild(d);
  };

  if (!('Notification' in window) || !('serviceWorker' in navigator)) return say('Push not supported in this browser');
  if (typeof supabase === 'undefined') return say('supabase not defined');

  // Load push.js ourselves (cache-busted)
  let push = typeof enablePush === 'function' ? enablePush : null;
  if (!push) {
    await new Promise((res) => {
      const s = document.createElement('script');
      s.src = '/push.js?v=' + Date.now();
      s.onload = res;
      s.onerror = () => { say('push.js not found at /push.js (404). Check the file path'); res(); };
      document.head.appendChild(s);
    });
    if (typeof enablePush === 'function') push = enablePush;
  }
  // If push.js is an ES module (uses export), import it instead
  if (!push) {
    try { const m = await import('/push.js?v=' + Date.now()); push = m.enablePush; } catch (e) {}
  }
  if (!push) return say('push.js loaded but enablePush not found inside it');

  let session = null;
  try { session = (await supabase.auth.getSession()).data.session; } catch (e) { return say('getSession failed: ' + e.message); }
  if (!session) return say('Not logged in');
  if (Notification.permission === 'granted') { push(supabase); return; }
  if (Notification.permission === 'denied') return say('Notifications blocked for this site');

  const bell = document.createElement('button');
  bell.innerHTML = '🔔';
  bell.style.cssText = 'position:fixed;bottom:90px;right:20px;width:44px;height:44px;border-radius:50%;border:0;background:#111;color:#fff;font-size:20px;box-shadow:0 2px 10px rgba(0,0,0,.3);z-index:9999';
  bell.onclick = async () => {
    try { await push(supabase); bell.remove(); } catch (e) { say('enablePush error: ' + e.message); }
  };
  document.body.appendChild(bell);
})();
</script>