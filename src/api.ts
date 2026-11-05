import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { MenuItem } from './types';

/**
 * Backend URL. On a phone running Expo Go, the dev server's host (your Mac's LAN IP)
 * is in Constants.expoConfig.hostUri, so we reuse it with the API port.
 * Override with EXPO_PUBLIC_API_URL if the backend lives elsewhere.
 */
export function apiBase(): string {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, '');
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:4000`;
}

let cachedId: string | null = null;
export async function deviceId(): Promise<string> {
  if (cachedId) return cachedId;
  let id = await AsyncStorage.getItem('pickybara.deviceId');
  if (!id) {
    id = 'd_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    await AsyncStorage.setItem('pickybara.deviceId', id);
  }
  cachedId = id;
  return id;
}

export class ApiError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

async function req<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const ctrl = new AbortController();
  const outer = init?.signal;
  outer?.addEventListener('abort', () => ctrl.abort());
  const t = setTimeout(() => ctrl.abort(), init?.timeoutMs ?? 15000);
  let res: Response;
  try {
    res = await fetch(apiBase() + path, {
      ...init,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'X-Device-Id': await deviceId(), ...(init?.headers || {}) },
    });
  } catch (e) {
    if (outer?.aborted) throw new ApiError('Cancelled', 'cancelled');
    throw new ApiError(`Can't reach the Pickybara server at ${apiBase()}. Is it running on the same Wi-Fi?`, 'offline');
  } finally {
    clearTimeout(t);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error || `Server error (${res.status})`, body.code || 'server');
  return body as T;
}

export type Quota = { used: number; limit: number; left: number; resetsOn: string };
export type ScanResult = {
  readable: boolean;
  restaurant: string;
  language: string;
  items: Omit<MenuItem, 'id'>[];
  demo?: boolean;
  quota: Quota;
};

export const api = {
  quota: () => req<Quota>('/quota'),
  scan: (images: string[], language: string, signal?: AbortSignal) =>
    req<ScanResult>('/scan', { method: 'POST', body: JSON.stringify({ images, language }), signal, timeoutMs: 120000 }),
  report: (r: { type: string; note: string; restaurant?: string; item?: string }) => req<{ ok: true }>('/report', { method: 'POST', body: JSON.stringify(r) }),
  deleteData: () => req<{ ok: true }>('/me', { method: 'DELETE' }),
};
