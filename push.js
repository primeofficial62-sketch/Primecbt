const VAPID_PUBLIC_KEY = 'PASTE_YOUR_VAPID_PUBLIC_KEY_HERE';

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

// Small floating bell
window.addEventListener('load', async () => {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (typeof supabase === 'undefined' || !supabase.auth) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (Notification.permission === 'granted') { enablePush(supabase).catch(() => {}); return; }
    if (Notification.permission !== 'default') return;

    const bell = document.createElement('button');
    bell.innerHTML = '🔔';
    bell.setAttribute('aria-label', 'Turn on notifications');
    bell.style.cssText = 'position:fixed;bottom:90px;right:20px;width:44px;height:44px;border-radius:50%;border:0;background:#111;color:#fff;font-size:20px;box-shadow:0 2px 10px rgba(0,0,0,.3);z-index:9999';
    bell.onclick = async () => {
      try { await enablePush(supabase); bell.remove(); }
      catch (e) { alert('Notifications: ' + e.message); }
    };
    document.body.appendChild(bell);
  } catch (e) { console.error(e); }
});