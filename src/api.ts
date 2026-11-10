import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { MenuItem } from './types';

/**
 * Backend URL. On a phone running Expo Go, the dev server's host (your Mac's LAN IP)
 * is in Constants.expoConfig.hostUri, so we reuse it with the API port.
 * Release builds must set EXPO_PUBLIC_API_URL to an https:// address.
 */
export function apiBase(): string {
  const env = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (env) {
    if (!__DEV__ && !env.startsWith('https://')) throw new ApiError('The app must talk to its server over HTTPS.', 'server');
    return env;
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:4000`;
}

// ---- Signed device id ----
// The server gives each phone a random id plus a signature. It's kept in the iOS Keychain
// (encrypted by the system), not in plain app storage. The web preview has no Keychain,
// so it falls back to normal storage there.
const ID_KEY = 'pickybara.device.id';
const TOKEN_KEY = 'pickybara.device.token';
const secure = {
  get: (k: string) => (Platform.OS === 'web' ? AsyncStorage.getItem(k) : SecureStore.getItemAsync(k)),
  set: (k: string, v: string) => (Platform.OS === 'web' ? AsyncStorage.setItem(k, v) : SecureStore.setItemAsync(k, v)),
  del: (k: string) => (Platform.OS === 'web' ? AsyncStorage.removeItem(k) : SecureStore.deleteItemAsync(k)),
};

type Device = { deviceId: string; token: string };
let cached: Device | null = null;
let registering: Promise<Device> | null = null;

async function device(): Promise<Device> {
  if (cached) return cached;
  const [deviceId, token] = await Promise.all([secure.get(ID_KEY), secure.get(TOKEN_KEY)]);
  if (deviceId && token) return (cached = { deviceId, token });
  return register();
}

function register(): Promise<Device> {
  registering ??= (async () => {
    try {
      const d = await raw<Device>('/register', { method: 'POST' }, null);
      await Promise.all([secure.set(ID_KEY, d.deviceId), secure.set(TOKEN_KEY, d.token)]);
      cached = d;
      return d;
    } finally {
      registering = null;
    }
  })();
  return registering;
}

/** Forget this phone's id (used by Delete account). */
export async function resetDevice() {
  cached = null;
  await Promise.all([secure.del(ID_KEY), secure.del(TOKEN_KEY), AsyncStorage.removeItem('pickybara.deviceId')]);
}

export class ApiError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

async function raw<T>(path: string, init: (RequestInit & { timeoutMs?: number }) | undefined, dev: Device | null): Promise<T> {
  const ctrl = new AbortController();
  const outer = init?.signal;
  outer?.addEventListener('abort', () => ctrl.abort());
  const t = setTimeout(() => ctrl.abort(), init?.timeoutMs ?? 15000);
  let res: Response;
  try {
    res = await fetch(apiBase() + path, {
      ...init,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(dev ? { 'X-Device-Id': dev.deviceId, 'X-Device-Token': dev.token } : {}), ...(init?.headers || {}) },
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (outer?.aborted) throw new ApiError('Cancelled', 'cancelled');
    throw new ApiError(__DEV__ ? `Can't reach the Pickybara server at ${apiBase()}. Is it running on the same Wi-Fi?` : "Can't reach Pickybara. Check your internet connection.", 'offline');
  } finally {
    clearTimeout(t);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error || `Server error (${res.status})`, body.code || 'server');
  return body as T;
}

/** Calls the API as this device. If the server no longer accepts the id, it signs in again once. */
async function req<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  try {
    return await raw<T>(path, init, await device());
  } catch (e) {
    if (!(e instanceof ApiError) || e.code !== 'auth') throw e;
    cached = null;
    await Promise.all([secure.del(ID_KEY), secure.del(TOKEN_KEY)]);
    return raw<T>(path, init, await register());
  }
}

export type Quota = { used: number; limit: number; left: number; resetsOn: string };
export type ScanResult = {
  readable: boolean;
  restaurant: string;
  language: string;
  currency?: string;
  rateToPHP?: number | null;
  items: Omit<MenuItem, 'id'>[];
  demo?: boolean;
  quota: Quota;
};

export const api = {
  quota: () => req<Quota>('/quota'),
  rate: (code: string) => req<{ currency: string; rateToPHP: number | null }>(`/rate/${encodeURIComponent(code)}`),
  scan: (images: string[], language: string, signal?: AbortSignal) =>
    req<ScanResult>('/scan', { method: 'POST', body: JSON.stringify({ images, language }), signal, timeoutMs: 120000 }),
  report: (r: { type: string; note: string; restaurant?: string; item?: string }) => req<{ ok: true }>('/report', { method: 'POST', body: JSON.stringify(r) }),
  deleteData: () => req<{ ok: true }>('/me', { method: 'DELETE' }),
};
