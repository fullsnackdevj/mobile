import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { api, Quota } from './api';
import { uid, useStore } from './store';
import type { Menu, MenuItem } from './types';

// The server accepts up to 1.5M base64 characters per photo; stay well under it.
const TARGET_CHARS = 1_100_000;
// Longest side, then quality, tried in order until the photo is small enough.
const STEPS: [number, number][] = [
  [2000, 0.7],
  [1600, 0.65],
  [1400, 0.55],
  [1200, 0.5],
  [1000, 0.45],
];

/**
 * Shrink a photo so it always fits the upload limit. The longest side is capped (so tall
 * or panorama shots don't stay huge), never enlarged, and quality steps down if needed.
 */
export async function toBase64Jpeg(uri: string): Promise<string> {
  const orig = await ImageManipulator.manipulate(uri).renderAsync();
  const long = Math.max(orig.width, orig.height);
  let out = '';
  for (const [side, compress] of STEPS) {
    const ctx = ImageManipulator.manipulate(uri);
    if (long > side) ctx.resize(orig.width >= orig.height ? { width: side } : { height: side });
    const img = await ctx.renderAsync();
    out = (await img.saveAsync({ format: SaveFormat.JPEG, compress, base64: true })).base64 ?? '';
    if (out && out.length <= TARGET_CHARS) return out;
  }
  return out; // smallest attempt; the server explains if it's still too big
}

export async function pickFromGallery(): Promise<boolean> {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 6, quality: 1 });
  if (r.canceled || !r.assets.length) return false;
  useStore.getState().set({ photos: r.assets.map((a) => a.uri) });
  router.push('/scanning');
  return true;
}

export function menuFromScan(restaurant: string, language: string, items: Omit<MenuItem, 'id'>[], demo?: boolean, photos?: string[], currency = 'PHP', rateToPHP: number | null = 1): Menu {
  return {
    currency,
    rateToPHP: currency === 'PHP' ? 1 : rateToPHP,
    id: uid(),
    restaurant: restaurant || 'Untitled menu',
    language,
    createdAt: Date.now(),
    saved: true,
    demo,
    photos,
    items: items.map((i) => ({ ...i, id: uid() })),
  };
}

export function blankItem(name: string, price: number | null, category = 'Other'): MenuItem {
  return {
    id: uid(),
    name,
    originalName: name,
    translatedName: name,
    price,
    category,
    isDrink: /drink|tea|coffee|juice|soda|cola|shake|latte/i.test(category + ' ' + name),
    lowConfidence: false,
    description: '',
    tastesLike: '',
    spice: 0,
    allergens: [],
    contains: [],
    diet: [],
    kinds: [],
    tags: [],
    ingredients: [],
    nutrition: null,
  };
}

let quotaCache: Quota | null = null;
const listeners = new Set<(q: Quota) => void>();
export function setQuota(q: Quota) {
  quotaCache = q;
  listeners.forEach((l) => l(q));
}

/** Scan allowance from the server (limits are server-controlled). */
export function useQuota() {
  const [q, setQ] = useState<Quota | null>(quotaCache);
  useEffect(() => {
    listeners.add(setQ);
    api.quota().then(setQuota).catch(() => {});
    return () => {
      listeners.delete(setQ);
    };
  }, []);
  return q;
}

/** Choices on the camera screen that carry into the scan request. */
/** spot: when scanning from a spot's page, the new menu is filed under that spot's name. */
export const scanPrefs: { language: string; spot?: string } = { language: 'Auto' };
