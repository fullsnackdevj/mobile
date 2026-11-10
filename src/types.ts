// Shared vocabularies. The backend prompt uses the same lists so matching is exact.
export const LOVES = ['Burgers', 'Chicken', 'Pasta', 'Rice meals', 'Noodles', 'Pizza', 'Seafood', 'Vegetables', 'Desserts', 'Sandwiches', 'Coffee', 'Milk tea', 'Juice', 'Smoothies'] as const;
export const AVOIDS = ['Pork', 'Beef', 'Mushrooms', 'Onions', 'Cilantro', 'Spicy food', 'Fried food', 'Organ meats'] as const;
export const DIETS = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Low-carb', 'Dairy-free', 'None'] as const;
export const ALLERGIES = ['Peanuts', 'Tree nuts', 'Shellfish', 'Eggs', 'Milk', 'Soy', 'Wheat', 'Fish', 'Sesame', 'Other', 'None'] as const;
export const SPICE = ['None', 'Mild', 'Medium', 'Hot'] as const;
export const BUDGETS = ['₱100', '₱150', '₱200', '₱300', '₱500+'] as const;
export const GOALS = ['Cheap', 'Filling', 'Healthy', 'Comfort food', 'High protein', 'Low calorie'] as const;

export type Spice = (typeof SPICE)[number];

export type Nutrition = { kcal: number; protein: number; carbs: number; fat: number; sodium: number };

export type MenuItem = {
  id: string;
  name: string;
  originalName: string;
  translatedName: string;
  price: number | null;
  category: string;
  isDrink: boolean;
  lowConfidence: boolean;
  description: string;
  tastesLike: string;
  spice: number; // 0-3
  allergens: string[]; // ALLERGIES labels
  contains: string[]; // pork, beef, chicken, seafood, mushrooms, onions, cilantro, organ meats, alcohol, caffeine
  diet: string[]; // vegetarian, vegan, halal-friendly, gluten-free, low-carb, dairy-free
  kinds: string[]; // LOVES labels
  tags: string[]; // filling, light, healthy, comfort, indulgent, sweet, fried, shareable, quick, high-protein, low-calorie, caffeine, refreshing
  ingredients: string[];
  nutrition: Nutrition | null;
};

export type Menu = {
  id: string;
  restaurant: string;
  createdAt: number;
  language: string;
  items: MenuItem[];
  saved: boolean;
  demo?: boolean;
  /** ISO code of the menu's prices (missing on older menus = PHP). */
  currency?: string;
  /** Pesos per 1 unit of `currency` on the day it was scanned; null if unknown. */
  rateToPHP?: number | null;
  photos?: string[];
};

export type Taste = {
  love: string[];
  avoid: string[];
  diet: string[];
  allergy: string[];
  spice: Spice;
  budget: string;
  goal: string[];
};

/** vibes: any number of picked vibes (empty = no preference). */
export type Mood = { vibes: string[]; budget: string; mode: 'Food' | 'Drinks' | 'Both' };

export type FavItem = { key: string; name: string; restaurant: string; price: number | null; menuId: string; itemId: string };

export type HistoryEntry = {
  id: string;
  date: number;
  restaurant: string;
  menuId: string;
  itemId: string;
  itemName: string;
  price: number | null;
  extras: string[];
  rating: -1 | 0 | 1;
  tags: string[];
  note: string;
};

export type PhotoFocus = { x: number; y: number; zoom: number };

/** A restaurant, cafe or shop you've saved. Menus and history link to it by name. */
export type Place = {
  id: string;
  name: string;
  photo?: string; // a file saved inside the app
  /** Which part of the photo to show: centre point (0–1 across and down) and zoom (1 = fill). */
  photoFocus?: PhotoFocus;
  address?: string;
  lat?: number;
  lng?: number;
  notes?: string;
  createdAt: number;
};

export type Person = { name: string; avoids: string[] };
export type OrderItem = { id: number; who: string; name: string; price: number | null; qty: number; note: string; itemId?: string };
export type Order = {
  restaurant: string;
  menuId: string;
  price: boolean;
  split: boolean;
  people: Person[];
  items: OrderItem[];
  nextId: number;
  currency?: string;
  rateToPHP?: number | null;
};
export type SavedOrder = { id: string; shop: string; date: number; price: boolean; people: Person[]; items: OrderItem[]; currency?: string; rateToPHP?: number | null };

export const TABLE = 'Table';
