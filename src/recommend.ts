import { Priced, toPHP } from './money';
import type { HistoryEntry, MenuItem, Mood, Person, Taste } from './types';

export type Scored = {
  item: MenuItem;
  match: number;
  scores: { Taste: number; Budget: number; Mood: number; Goal: number };
  reasons: string[];
  allergyHits: string[];
};

export type Picks = { top: Scored | null; backup: Scored | null; drink: Scored | null; ranked: Scored[] };

const budgetNum = (b: string) => (b.includes('500') ? 500 : parseInt(b.replace(/[^\d]/g, ''), 10) || 200);
const spiceLevel = (s: string) => Math.max(0, ['None', 'Mild', 'Medium', 'Hot'].indexOf(s));

const MOOD_TAGS: Record<string, string[]> = {
  Tired: ['comfort', 'filling', 'caffeine'],
  Treat: ['indulgent', 'sweet', 'comfort'],
  Light: ['light', 'low-calorie', 'healthy'],
  Friends: ['shareable'],
  Budget: [],
  New: [],
  Hurry: ['quick', 'light'],
  Healthy: ['healthy', 'low-calorie', 'high-protein'],
  Caffeine: ['caffeine'],
  Refresh: ['refreshing', 'light'],
};
const GOAL_TAGS: Record<string, string> = {
  Filling: 'filling',
  Healthy: 'healthy',
  'Comfort food': 'comfort',
  'High protein': 'high-protein',
  'Low calorie': 'low-calorie',
};

const text = (i: MenuItem) => [i.name, i.translatedName, i.description, ...i.ingredients, ...i.contains].join(' ').toLowerCase();

/** Things the person never wants: avoid list, dislikes and diet rules. */
function blocked(i: MenuItem, t: Taste, dislikes: string[]): string | null {
  const blob = text(i);
  for (const a of t.avoid) {
    if (a === 'Spicy food' && i.spice >= 2) return 'spicy';
    if (a === 'Fried food' && i.tags.includes('fried')) return 'fried';
    if (i.contains.includes(a.toLowerCase())) return a.toLowerCase();
  }
  for (const d of dislikes) if (d && blob.includes(d.toLowerCase())) return d;
  for (const d of t.diet) {
    if (d === 'Vegetarian' && !i.diet.includes('vegetarian') && !i.diet.includes('vegan') && !i.isDrink) return 'not vegetarian';
    if (d === 'Vegan' && !i.diet.includes('vegan')) return 'not vegan';
    if (d === 'Halal' && (i.contains.includes('pork') || i.contains.includes('alcohol'))) return 'not halal';
    if (d === 'Kosher' && (i.contains.includes('pork') || i.contains.includes('seafood'))) return 'not kosher';
    if (d === 'Gluten-free' && i.allergens.includes('Wheat')) return 'gluten';
    if (d === 'Dairy-free' && i.allergens.includes('Milk')) return 'dairy';
  }
  return null;
}

export function allergyHits(i: MenuItem, allergies: string[]) {
  return i.allergens.filter((a) => allergies.includes(a));
}

export function scoreItem(item: MenuItem, t: Taste, mood: Mood, history: HistoryEntry[], learn: boolean, cur?: Priced): Scored {
  // Budgets are in pesos, so foreign prices are converted first. Unknown rate = treat price as unknown.
  const i = { ...item, price: toPHP(item.price, cur) };
  const reasons: string[] = [];
  const budget = budgetNum(mood.budget || t.budget);

  // Taste: loves + spice closeness + learned ratings
  let taste = 60;
  const loved = i.kinds.filter((k) => t.love.includes(k));
  if (loved.length) {
    taste += 25;
    reasons.push(`Matches your love of ${loved[0].toLowerCase()}`);
  }
  const want = spiceLevel(t.spice);
  const diff = Math.abs(i.spice - want);
  taste += diff === 0 ? 12 : diff === 1 ? 4 : -15;
  if (diff === 0 && !i.isDrink) reasons.push(i.spice === 0 ? 'No spice, as you prefer' : `${['', 'Mild', 'Medium', 'Hot'][i.spice]} spice, as you prefer`);
  if (learn) {
    const past = history.filter((h) => h.itemName === i.name);
    if (past.some((h) => h.rating === 1)) {
      taste += 8;
      reasons.push('You loved this last time');
    }
    if (past.some((h) => h.rating === -1)) taste -= 30;
  }

  // Budget
  let bud = 70;
  if (i.price != null) {
    if (i.price <= budget) {
      bud = 100 - Math.round((i.price / budget) * 15);
      reasons.push(`Under your ₱${budget} budget`);
    } else bud = Math.max(10, 80 - Math.round(((i.price - budget) / budget) * 120));
  }

  // Mood: each picked vibe gets a score, then they're averaged. No vibes = neutral.
  const vibes = mood.vibes ?? [];
  let moodS = 65;
  if (vibes.length) {
    let best: { hits: string[]; vibe: string } | null = null;
    const per = vibes.map((v) => {
      let s = 65;
      const mt = MOOD_TAGS[v] || [];
      const hits = i.tags.filter((x) => mt.includes(x));
      if (hits.length) {
        s += 15 + 10 * Math.min(2, hits.length - 1);
        if (!best || hits.length > best.hits.length) best = { hits, vibe: v };
      }
      if (v === 'Budget' && i.price != null) s = Math.max(40, 100 - Math.round((i.price / budget) * 50));
      if (v === 'New') s = history.some((h) => h.itemName === i.name) ? 40 : 90;
      return s;
    });
    moodS = per.reduce((a, b) => a + b, 0) / per.length;
    const b = best as { hits: string[]; vibe: string } | null;
    if (b) {
      const label = b.vibe.toLowerCase();
      reasons.push(b.hits.includes('filling') || b.hits.includes('comfort') ? `Filling enough for a ${label} day` : `Good when you want something ${b.hits[0].replace('-', ' ')}`);
    }
  }

  // Goal
  let goal = 70;
  for (const g of t.goal) {
    if (g === 'Cheap' && i.price != null && i.price <= budget * 0.7) goal += 10;
    const tag = GOAL_TAGS[g];
    if (tag && i.tags.includes(tag)) {
      goal += 12;
      if (reasons.length < 5) reasons.push(`Fits your ${g.toLowerCase()} goal`);
    }
  }

  const clamp = (n: number) => Math.max(5, Math.min(99, Math.round(n)));
  const scores = { Taste: clamp(taste), Budget: clamp(bud), Mood: clamp(moodS), Goal: clamp(goal) };
  let match = clamp(scores.Taste * 0.35 + scores.Budget * 0.25 + scores.Mood * 0.25 + scores.Goal * 0.15);
  if (i.lowConfidence) match = clamp(match - 6);
  const hits = allergyHits(i, t.allergy);
  if (hits.length) match = clamp(match - 40);
  return { item, match, scores, reasons: reasons.slice(0, 4), allergyHits: hits };
}

/** Small seeded random generator, so one visit to the results shows a stable set of picks. */
function rng(seed: number) {
  let a = Math.floor(seed * 2 ** 31) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks one of the close matches (within CLOSE points of the best, at most 5) instead of
 * always the single best, weighted so better matches come up more often.
 */
const CLOSE = 8;
function choose(list: Scored[], rand: () => number, avoid?: string): Scored | null {
  if (!list.length) return null;
  let near = list.filter((s) => s.match >= list[0].match - CLOSE).slice(0, 5);
  if (avoid && near.length > 1) near = near.filter((s) => s.item.id !== avoid);
  const low = Math.min(...near.map((s) => s.match));
  const weights = near.map((s) => s.match - low + 3);
  let r = rand() * weights.reduce((a, b) => a + b, 0);
  for (let k = 0; k < near.length; k++) if ((r -= weights[k]) <= 0) return near[k];
  return near[0];
}

export type Vary = { seed: number; avoid?: string };

export function recommend(items: MenuItem[], t: Taste, dislikes: string[], mood: Mood, history: HistoryEntry[], learn: boolean, cur?: Priced, vary?: Vary): Picks {
  const ok = items.filter((i) => !blocked(i, t, dislikes));
  const scored = ok.map((i) => scoreItem(i, t, mood, history, learn, cur)).sort((a, b) => b.match - a.match);
  const safe = scored.filter((s) => !s.allergyHits.length);
  const pool = safe.length ? safe : scored;
  const foods = pool.filter((s) => !s.item.isDrink);
  const drinks = pool.filter((s) => s.item.isDrink);
  const main = mood.mode === 'Drinks' ? drinks : mood.mode === 'Food' ? foods : foods.length ? foods : drinks;
  const rand = vary ? rng(vary.seed) : null;
  const top = rand ? choose(main, rand, vary?.avoid) : (main[0] ?? null);
  const backup = main.find((s) => s !== top) ?? null;
  let drink: Scored | null = null;
  if (mood.mode === 'Both' && top && !top.item.isDrink) {
    const php = (n: number | null) => toPHP(n, cur);
    const left = budgetNum(mood.budget) - (php(top.item.price) ?? 0);
    const fits = drinks.filter((d) => php(d.item.price) == null || (php(d.item.price) ?? 0) <= Math.max(left, 0));
    const list = fits.length ? fits : drinks;
    drink = rand ? choose(list, rand) : (list[0] ?? null);
  }
  const ranked = mood.mode === 'Drinks' ? drinks : mood.mode === 'Food' ? foods : scored;
  return { top, backup, drink, ranked };
}

/** Does this item clash with a person's "avoids" on the order list? */
export function conflictsWithPerson(i: MenuItem | undefined, p: Person | undefined): boolean {
  if (!i || !p) return false;
  return p.avoids.some((a) => {
    if (a === 'Peanuts') return i.allergens.includes('Peanuts');
    if (a === 'Shellfish') return i.allergens.includes('Shellfish');
    if (a === 'Dairy') return i.allergens.includes('Milk');
    if (a === 'No pork') return i.contains.includes('pork');
    if (a === 'No beef') return i.contains.includes('beef');
    if (a === 'Vegetarian') return !i.isDrink && !i.diet.includes('vegetarian') && !i.diet.includes('vegan');
    return i.allergens.includes(a);
  });
}
