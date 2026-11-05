import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { api, Quota } from './api';
import { uid, useStore } from './store';
import type { Menu, MenuItem } from './types';

/** Shrink a photo so uploads stay small (menus stay readable at 1600px). */
export async function toBase64Jpeg(uri: string): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width: 1600 });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  return out.base64 ?? '';
}

export async function pickFromGallery(): Promise<boolean> {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 6, quality: 1 });
  if (r.canceled || !r.assets.length) return false;
  useStore.getState().set({ photos: r.assets.map((a) => a.uri) });
  router.push('/scanning');
  return true;
}

export function menuFromScan(restaurant: string, language: string, items: Omit<MenuItem, 'id'>[], demo?: boolean, photos?: string[]): Menu {
  return {
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
export const scanPrefs = { language: 'Auto' };
