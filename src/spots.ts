import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { uid } from './store';
import type { HistoryEntry, Menu, Place } from './types';

/** One row in "Recent spots": a saved spot and/or a restaurant you've scanned. */
export type Spot = { name: string; place?: Place; menu?: Menu; lastVisit?: HistoryEntry; active: number };

/** Every spot, newest activity first: saved spots plus restaurants that only have a scanned menu. */
export function allSpots(places: Place[], menus: Menu[], history: HistoryEntry[]): Spot[] {
  const map = new Map<string, Spot>();
  const key = (n: string) => n.trim().toLowerCase();
  const get = (name: string) => {
    const k = key(name);
    let s = map.get(k);
    if (!s) map.set(k, (s = { name, active: 0 }));
    return s;
  };
  for (const p of places) {
    const s = get(p.name);
    s.place = p;
    s.name = p.name;
    s.active = Math.max(s.active, p.createdAt);
  }
  for (const m of menus) {
    // menus are stored newest first, so the first one per restaurant is the latest
    const s = get(m.restaurant);
    if (!s.menu) s.menu = m;
    s.active = Math.max(s.active, m.createdAt);
  }
  for (const h of history) {
    const s = map.get(key(h.restaurant));
    if (!s) continue;
    if (!s.lastVisit) s.lastVisit = h;
    s.active = Math.max(s.active, h.date);
  }
  return Array.from(map.values()).sort((a, b) => b.active - a.active);
}

/**
 * Lets the user take or choose a photo of the spot and keeps a copy inside the app,
 * so it survives the photo being deleted from the camera roll. Returns null if cancelled.
 */
export async function pickSpotPhoto(source: 'camera' | 'library'): Promise<string | null> {
  // No system crop: the whole photo is kept and the user frames it in Pickybara's own Adjust photo screen.
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('Pickybara needs camera access to take a photo. You can allow it in Settings.');
  }
  const r = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (r.canceled || !r.assets?.[0]) return null;
  const uri = r.assets[0].uri;
  if (Platform.OS === 'web') return uri;
  const dest = new File(Paths.document, `spot-${uid()}.jpg`);
  await new File(uri).copy(dest);
  return dest.uri;
}

/** Removes a spot photo that the app saved earlier. Errors are ignored. */
export function deleteSpotPhoto(uri?: string) {
  if (!uri || Platform.OS === 'web' || !uri.startsWith(Paths.document.uri)) return;
  try {
    new File(uri).delete();
  } catch {}
}

/** Your current position plus a readable address, after asking permission. */
export async function currentPlace(): Promise<{ lat: number; lng: number; address: string }> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) throw new Error('Location is off for Pickybara. You can type the address instead, or allow it in Settings.');
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude: lat, longitude: lng } = pos.coords;
  let address = '';
  try {
    const [a] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (a) address = [a.name !== a.street ? a.name : '', [a.streetNumber, a.street].filter(Boolean).join(' '), a.district, a.city].filter(Boolean).join(', ');
  } catch {}
  return { lat, lng, address: address || `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
}

/** Apple Maps link for a spot: exact pin if saved, otherwise a search for its name and address. */
export function mapsUrl(p: { name: string; address?: string; lat?: number; lng?: number }) {
  const q = encodeURIComponent([p.name, p.address].filter(Boolean).join(', '));
  return p.lat != null && p.lng != null ? `https://maps.apple.com/?ll=${p.lat},${p.lng}&q=${encodeURIComponent(p.name)}` : `https://maps.apple.com/?q=${q}`;
}
