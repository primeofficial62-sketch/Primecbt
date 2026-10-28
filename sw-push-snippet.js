// push.js — FCM web push client for PRIME-CBT (framework-agnostic ES module).
// Uses your EXISTING service worker registration; does not register a second worker.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getMessaging, getToken, deleteToken, isSupported } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js";

let cfg = null;
let messaging = null;
const DEVICE_KEY = "push_device_id";
const SNOOZE_KEY = "push_prompt_snooze_until";

function deviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

/**
 * @param {object} o
 * @param {object} o.supabase        your existing supabase-js client
 * @param {object} o.firebaseConfig  Firebase *web* config (public by design)
 * @param {string} o.vapidKey        Web Push certificate public key from Firebase console
 * @param {(p:{title:string,body:string,url:string})=>void} [o.onForeground]  show an in-app toast
 * @param {(url:string)=>void} [o.onNavigate]  route inside the app when a notification is clicked
 */
export async function initPush(o) {
  cfg = o;
  if (!(await supportsPush())) return false;
  messaging = getMessaging(initializeApp(o.firebaseConfig));

  // The existing service worker forwards pushes/clicks to the page via postMessage.
  navigator.serviceWorker.addEventListener("message", (e) => {
    const m = e.data || {};
    if (m.type === "PUSH_FOREGROUND") o.onForeground?.(m.payload);
    if (m.type === "PUSH_NAVIGATE") (o.onNavigate || ((u) => (location.href = u)))(m.url);
  });
  return true;
}

export async function supportsPush() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    (await isSupported().catch(() => false))
  );
}

/** "unsupported" | "denied" | "granted" | "default" */
export async function pushState() {
  if (!(await supportsPush())) return "unsupported";
  return Notification.permission;
}

/** Should the app show its own "Enable notifications?" prompt right now? */
export async function shouldAskForPush() {
  if ((await pushState()) !== "default") return false; // never re-prompt denied/granted/unsupported
  return Date.now() > Number(localStorage.getItem(SNOOZE_KEY) || 0);
}
export function snoozePrompt(days = 14) {
  localStorage.setItem(SNOOZE_KEY, String(Date.now() + days * 864e5));
}

async function registerCurrentToken() {
  const reg = await navigator.serviceWorker.ready; // your existing SW
  const token = await getToken(messaging, { vapidKey: cfg.vapidKey, serviceWorkerRegistration: reg });
  if (!token) return null;
  const { error } = await cfg.supabase.rpc("register_push_token", {
    p_token: token,
    p_device_id: deviceId(),
    p_platform: /android/i.test(navigator.userAgent) ? "android-web" : "web",
    p_user_agent: navigator.userAgent,
  });
  if (error) throw error;
  return token;
}

/** Call from a button click (user gesture). Returns "granted" | "denied" | "default" | "unsupported". */
export async function enablePush() {
  if (!(await supportsPush()) || !messaging) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (perm !== "granted") {
    if (perm === "default") snoozePrompt(14);
    return perm;
  }
  await registerCurrentToken();
  await cfg.supabase.from("push_prefs").upsert({ user_id: (await cfg.supabase.auth.getUser()).data.user.id, enabled: true, updated_at: new Date().toISOString() });
  return "granted";
}

/** Call after every login/app start: silently refreshes a rotated token. Never prompts. */
export async function syncPushToken() {
  if (!messaging || Notification.permission !== "granted") return;
  try { await registerCurrentToken(); } catch (e) { console.warn("push sync failed", e?.message); }
}

/** Turn push off for this account (preference) and remove this device. */
export async function disablePush() {
  const user = (await cfg.supabase.auth.getUser()).data.user;
  if (user) await cfg.supabase.from("push_prefs").upsert({ user_id: user.id, enabled: false, updated_at: new Date().toISOString() });
  await removeThisDevice();
}

/** Call on sign-out so the next user on this browser doesn't receive your pushes. */
export async function removeThisDevice() {
  try { await cfg.supabase.rpc("unregister_push_token", { p_device_id: deviceId() }); } catch {}
  try { if (messaging) await deleteToken(messaging); } catch {}
}
