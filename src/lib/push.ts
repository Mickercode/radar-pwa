import { getToken } from './auth';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Fetch the server's VAPID public key. */
async function getPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/push/vapid-public-key`);
    if (!res.ok) return null;
    const data = await res.json() as { publicKey?: string };
    return data.publicKey ?? null;
  } catch { return null; }
}

/** Convert a base64url string to a Uint8Array for the browser push API. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

/** Register for push notifications. Returns true on success. */
export async function registerPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  if (!getToken()) return false;

  const publicKey = await getPublicKey();
  if (!publicKey) return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const json = sub.toJSON();
    const keys = json.keys as { p256dh: string; auth: string } | undefined;
    if (!keys) return false;

    await fetch(`${BASE}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ endpoint: sub.endpoint, keys }),
    });

    return true;
  } catch (e) {
    console.warn('[push] registration failed:', (e as Error).message);
    return false;
  }
}

/** Unsubscribe from push notifications. */
export async function unregisterPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await fetch(`${BASE}/push/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
  } catch { /* ignore */ }
}

/** Request notification permission and register. Returns permission state. */
export async function requestAndRegisterPush(): Promise<NotificationPermission> {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') await registerPush();
  return permission;
}

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function pushPermission(): NotificationPermission {
  return 'Notification' in window ? Notification.permission : 'denied';
}
