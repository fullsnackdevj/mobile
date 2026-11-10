import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { FavItem, HistoryEntry, Menu, MenuItem, Mood, Order, OrderItem, Person, Place, SavedOrder, Taste } from './types';
import { TABLE } from './types';

export type Settings = { theme: 'light' | 'dark' | 'auto'; energy: 'kcal' | 'kJ'; ratingReminders: boolean };
export type Privacy = { savePhotos: boolean; learn: boolean };
export type Profile = { name: string; email: string; guest: boolean };

const defaultTaste: Taste = { love: [], avoid: [], diet: ['None'], allergy: ['None'], spice: 'Mild', budget: '₱200', goal: [] };
const emptyOrder = (people: Person[] = []): Order => ({ restaurant: '', menuId: '', price: true, split: false, people, items: [], nextId: 1 });

type State = {
  hydrated: boolean;
  profile: Profile | null;
  onboarded: boolean;
  taste: Taste;
  dislikes: string[];
  settings: Settings;
  privacy: Privacy;
  menus: Menu[]; // every scanned menu; `saved` ones show under Saved menus
  currentMenuId: string | null;
  mood: Mood;
  favorites: FavItem[];
  favRestaurants: string[];
  history: HistoryEntry[];
  order: Order;
  savedOrders: SavedOrder[];
  places: Place[];
  // Not persisted: photos captured in the current scan.
  photos: string[];
};

type Actions = {
  set: (p: Partial<State>) => void;
  setTaste: (p: Partial<Taste>) => void;
  setSettings: (p: Partial<Settings>) => void;
  setPrivacy: (p: Partial<Privacy>) => void;
  addMenu: (m: Menu) => void;
  updateMenu: (id: string, p: Partial<Menu>) => void;
  updateItem: (menuId: string, itemId: string, p: Partial<MenuItem>) => void;
  addItem: (menuId: string, item: MenuItem) => void;
  deleteMenu: (id: string) => void;
  toggleFav: (f: FavItem) => void;
  toggleFavRestaurant: (name: string) => void;
  addHistory: (h: HistoryEntry) => void;
  updateHistory: (id: string, p: Partial<HistoryEntry>) => void;
  deleteHistory: (id: string) => void;
  startOrder: (restaurant: string, menuId: string) => void;
  setOrder: (p: Partial<Order>) => void;
  bumpOrderItem: (who: string, name: string, price: number | null, d: number, itemId?: string) => void;
  changeQty: (id: number, d: number) => void;
  addPerson: (p: Person) => void;
  saveOrderSnapshot: () => string;
  /** Empties the order list (keeps the show-prices choice). */
  clearOrder: () => void;
  /** Creates the spot if it doesn't exist yet (matched by name), then applies the changes. */
  savePlace: (name: string, p: Partial<Omit<Place, 'id' | 'name' | 'createdAt'>>) => Place;
  /** Renames a spot everywhere: its menus, history, favorites and saved orders. */
  renamePlace: (from: string, to: string) => void;
  deletePlace: (name: string) => void;
  /** Deletes a spot completely: saved details, scanned menus and favorites there (and visits, if asked). */
  deleteSpot: (name: string, withHistory: boolean) => void;
  /** Takes a person (and their items) off the order list. */
  removePerson: (name: string) => void;
  reuseOrder: (id: string, price: boolean) => void;
  deleteSavedOrder: (id: string) => void;
  wipe: () => void;
};

const initial = (): State => ({
  hydrated: false,
  profile: null,
  onboarded: false,
  taste: defaultTaste,
  dislikes: [],
  settings: { theme: 'light', energy: 'kcal', ratingReminders: true },
  privacy: { savePhotos: false, learn: true },
  menus: [],
  currentMenuId: null,
  mood: { vibes: ['Tired'], budget: '₱200', mode: 'Both' },
  favorites: [],
  favRestaurants: [],
  history: [],
  order: emptyOrder(),
  savedOrders: [],
  places: [],
  photos: [],
});

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),
      set: (p) => set(p),
      setTaste: (p) => set({ taste: { ...get().taste, ...p } }),
      setSettings: (p) => set({ settings: { ...get().settings, ...p } }),
      setPrivacy: (p) => set({ privacy: { ...get().privacy, ...p } }),
      addMenu: (m) => set({ menus: [m, ...get().menus.filter((x) => x.id !== m.id)], currentMenuId: m.id }),
      updateMenu: (id, p) => set({ menus: get().menus.map((m) => (m.id === id ? { ...m, ...p } : m)) }),
      updateItem: (menuId, itemId, p) =>
        set({ menus: get().menus.map((m) => (m.id === menuId ? { ...m, items: m.items.map((i) => (i.id === itemId ? { ...i, ...p } : i)) } : m)) }),
      addItem: (menuId, item) => set({ menus: get().menus.map((m) => (m.id === menuId ? { ...m, items: [...m.items, item] } : m)) }),
      deleteMenu: (id) => set({ menus: get().menus.filter((m) => m.id !== id), currentMenuId: get().currentMenuId === id ? null : get().currentMenuId }),
      toggleFav: (f) => {
        const has = get().favorites.some((x) => x.key === f.key);
        set({ favorites: has ? get().favorites.filter((x) => x.key !== f.key) : [f, ...get().favorites] });
      },
      toggleFavRestaurant: (name) => {
        const has = get().favRestaurants.includes(name);
        set({ favRestaurants: has ? get().favRestaurants.filter((x) => x !== name) : [name, ...get().favRestaurants] });
      },
      addHistory: (h) => set({ history: [h, ...get().history] }),
      updateHistory: (id, p) => set({ history: get().history.map((h) => (h.id === id ? { ...h, ...p } : h)) }),
      deleteHistory: (id) => set({ history: get().history.filter((h) => h.id !== id) }),
      startOrder: (restaurant, menuId) => {
        const o = get().order;
        if (o.menuId === menuId && o.restaurant === restaurant) return;
        const me = get().profile?.name || 'Me';
        const avoids = get().taste.allergy.filter((a) => a !== 'None');
        const m = get().menus.find((x) => x.id === menuId);
        set({ order: { ...emptyOrder([{ name: me, avoids: avoids.length ? avoids : ['None'] }]), restaurant, menuId, price: o.price, currency: m?.currency, rateToPHP: m?.rateToPHP } });
      },
      setOrder: (p) => set({ order: { ...get().order, ...p } }),
      bumpOrderItem: (who, name, price, d, itemId) => {
        const o = get().order;
        const ex = o.items.find((x) => x.who === who && x.name === name);
        let items: OrderItem[];
        let nextId = o.nextId;
        if (ex) items = o.items.map((x) => (x === ex ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0);
        else if (d > 0) items = [...o.items, { id: nextId++, who, name, price, qty: 1, note: '', itemId }];
        else items = o.items;
        set({ order: { ...o, items, nextId } });
      },
      changeQty: (id, d) => {
        const o = get().order;
        set({ order: { ...o, items: o.items.map((x) => (x.id === id ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0) } });
      },
      addPerson: (p) => {
        const o = get().order;
        if (o.people.some((x) => x.name.toLowerCase() === p.name.toLowerCase()) || p.name === TABLE) return;
        set({ order: { ...o, people: [...o.people, p] } });
      },
      saveOrderSnapshot: () => {
        const o = get().order;
        const rec: SavedOrder = { id: 'o' + Date.now(), shop: o.restaurant || 'Order', date: Date.now(), price: o.price, people: o.people, items: o.items, currency: o.currency, rateToPHP: o.rateToPHP };
        set({ savedOrders: [rec, ...get().savedOrders] });
        return rec.id;
      },
      savePlace: (name, p) => {
        const key = name.trim().toLowerCase();
        const cur = get().places.find((x) => x.name.toLowerCase() === key);
        const next: Place = cur ? { ...cur, ...p } : { id: uid(), name: name.trim(), createdAt: Date.now(), ...p };
        set({ places: cur ? get().places.map((x) => (x.id === cur.id ? next : x)) : [next, ...get().places] });
        return next;
      },
      renamePlace: (from, to) => {
        const s = get();
        const name = to.trim();
        if (!name || name === from) return;
        const r = <T extends { restaurant: string }>(x: T) => (x.restaurant === from ? { ...x, restaurant: name } : x);
        set({
          places: s.places.map((x) => (x.name === from ? { ...x, name } : x)),
          menus: s.menus.map(r),
          history: s.history.map(r),
          favorites: s.favorites.map(r),
          favRestaurants: s.favRestaurants.map((x) => (x === from ? name : x)),
          savedOrders: s.savedOrders.map((o) => (o.shop === from ? { ...o, shop: name } : o)),
          order: s.order.restaurant === from ? { ...s.order, restaurant: name } : s.order,
        });
      },
      deletePlace: (name) => set({ places: get().places.filter((x) => x.name !== name) }),
      deleteSpot: (name, withHistory) => {
        const s = get();
        const k = name.trim().toLowerCase();
        const is = (n: string) => n.trim().toLowerCase() === k;
        const gone = new Set(s.menus.filter((m) => is(m.restaurant)).map((m) => m.id));
        set({
          places: s.places.filter((x) => !is(x.name)),
          menus: s.menus.filter((m) => !gone.has(m.id)),
          favorites: s.favorites.filter((f) => !is(f.restaurant) && !gone.has(f.menuId)),
          favRestaurants: s.favRestaurants.filter((x) => !is(x)),
          history: withHistory ? s.history.filter((h) => !is(h.restaurant)) : s.history,
          currentMenuId: s.currentMenuId && gone.has(s.currentMenuId) ? null : s.currentMenuId,
          // An order in progress there points at a deleted menu, so it goes too.
          order: is(s.order.restaurant) ? { ...emptyOrder(), price: s.order.price } : s.order,
        });
      },
      removePerson: (name) => {
        const o = get().order;
        set({ order: { ...o, people: o.people.filter((p) => p.name !== name), items: o.items.filter((x) => x.who !== name) } });
      },
      clearOrder: () => set({ order: { ...emptyOrder(), price: get().order.price } }),
      reuseOrder: (id, price) => {
        const r = get().savedOrders.find((x) => x.id === id);
        if (!r) return;
        let nextId = 1;
        const items = r.items.map((x) => ({ ...x, id: nextId++ }));
        set({ order: { restaurant: r.shop, menuId: get().menus.find((m) => m.restaurant === r.shop)?.id || '', price, split: false, people: r.people, items, nextId, currency: r.currency, rateToPHP: r.rateToPHP } });
      },
      deleteSavedOrder: (id) => set({ savedOrders: get().savedOrders.filter((x) => x.id !== id) }),
      wipe: () => set({ ...initial(), hydrated: true }),
    }),
    {
      name: 'pickybara.v1',
      version: 2,
      migrate: (old: any, from) => {
        // v1 -> v2: saved spots.
        if (old && !Array.isArray(old.places)) old.places = [];
        // v0 -> v1: a single "vibe" became a list of "vibes".
        if (from < 1 && old?.mood && !Array.isArray(old.mood.vibes)) {
          const { vibe, ...rest } = old.mood;
          old.mood = { ...rest, vibes: vibe ? [vibe] : [] };
        }
        return old;
      },
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, photos, ...rest }) => rest,
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    }
  )
);

/** The newest menu for each restaurant, newest first (menus are stored newest first). */
export function latestPerRestaurant(menus: Menu[]) {
  const seen = new Set<string>();
  return menus.filter((m) => (seen.has(m.restaurant) ? false : (seen.add(m.restaurant), true)));
}

export const useCurrentMenu = () => useStore((s) => s.menus.find((m) => m.id === s.currentMenuId) ?? null);

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const peso = (n: number | null | undefined) => (n == null ? '₱?' : '₱' + Math.round(n).toLocaleString('en-US'));

/** "today", "yesterday" or "Nov 4", for use in the middle of a sentence. */
export const inlineDate = (ts: number) => {
  const d = shortDate(ts);
  return d === 'Today' || d === 'Yesterday' ? d.toLowerCase() : d;
};

export function shortDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
