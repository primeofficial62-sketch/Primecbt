const VAPID_PUBLIC_KEY = 'BDQyW8OkY6IMg7Vd_e8Jj9A-U5vKD8qmfvj-PGmrpUMIhdF7uvhhAdt-BR_jsSO1cYJMfJMeIs4m6kKl4vKq1SQ';

function urlB64ToUint8Array(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function enablePush(sb) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window))
    throw new Error('Push not supported in this browser');
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Please log in first');
  if ((await Notification.requestPermission()) !== 'granted')
    throw new Error('Permission not granted');

  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  const j = sub.toJSON();
  const { error } = await sb.from('push_subscriptions').upsert(
    {
      user_id: session.user.id,
      endpoint: j.endpoint,
      p256dh: j.keys.p256dh,
      auth: j.keys.auth,
      platform: navigator.platform,
      user_agent: navigator.userAgent.slice(0, 200),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' }
  );
  if (error) throw error;
  return true;
}

// Floating bell: shows only to users who haven't subscribed yet
(function () {
  async function run() {
    try {
      if (document.getElementById('push-bell')) return;
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
      if (typeof supabase === 'undefined' || !supabase.auth) return;
      if (Notification.permission === 'denied') return;

      const { data: { session } } = await supabase.auth.getSession();

      // Already allowed on this device: no bell, just make sure it's saved to the account
      if (Notification.permission === 'granted') {
        if (session) enablePush(supabase).catch(() => {});
        return;
      }

      // Not decided yet: show the bell
      const bell = document.createElement('button');
      bell.id = 'push-bell';
      bell.innerHTML = '🔔';
      bell.setAttribute('aria-label', 'Turn on notifications');
      bell.style.cssText = 'position:fixed;bottom:90px;right:20px;width:44px;height:44px;border-radius:50%;border:0;background:#111;color:#fff;font-size:20px;box-shadow:0 2px 10px rgba(0,0,0,.3);z-index:9999';
      bell.onclick = async () => {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!s) { alert('Please log in first to turn on notifications.'); return; }
        try { await enablePush(supabase); bell.remove(); }
        catch (e) { alert('Notifications: ' + e.message); }
      };
      document.body.appendChild(bell);
    } catch (e) { console.error(e); }
  }

  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run);

  // If someone logs in later, re-check so their device gets saved
  try { supabase.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_IN') run(); }); } catch (e) {}
})();