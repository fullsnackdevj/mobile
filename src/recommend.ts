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

export function scoreItem(i: MenuItem, t: Taste, mood: Mood, history: HistoryEntry[], learn: boolean): Scored {
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

  // Mood
  let moodS = 65;
  const mt = MOOD_TAGS[mood.vibe] || [];
  const mHits = i.tags.filter((x) => mt.includes(x));
  if (mHits.length) {
    moodS += 15 + 10 * Math.min(2, mHits.length - 1);
    const label = mood.vibe.toLowerCase();
    reasons.push(mHits.includes('filling') || mHits.includes('comfort') ? `Filling enough for a ${label} day` : `Good when you want something ${mHits[0].replace('-', ' ')}`);
  }
  if (mood.vibe === 'Budget' && i.price != null) moodS = Math.max(40, 100 - Math.round((i.price / budget) * 50));
  if (mood.vibe === 'New') moodS = history.some((h) => h.itemName === i.name) ? 40 : 90;

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
  return { item: i, match, scores, reasons: reasons.slice(0, 4), allergyHits: hits };
}

export function recommend(items: MenuItem[], t: Taste, dislikes: string[], mood: Mood, history: HistoryEntry[], learn: boolean): Picks {
  const ok = items.filter((i) => !blocked(i, t, dislikes));
  const scored = ok.map((i) => scoreItem(i, t, mood, history, learn)).sort((a, b) => b.match - a.match);
  const safe = scored.filter((s) => !s.allergyHits.length);
  const pool = safe.length ? safe : scored;
  const foods = pool.filter((s) => !s.item.isDrink);
  const drinks = pool.filter((s) => s.item.isDrink);
  const main = mood.mode === 'Drinks' ? drinks : mood.mode === 'Food' ? foods : foods.length ? foods : drinks;
  const top = main[0] ?? null;
  const backup = main[1] ?? null;
  let drink: Scored | null = null;
  if (mood.mode === 'Both' && top && !top.item.isDrink) {
    const left = budgetNum(mood.budget) - (top.item.price ?? 0);
    drink = drinks.find((d) => d.item.price == null || d.item.price <= Math.max(left, 0)) ?? drinks[0] ?? null;
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
