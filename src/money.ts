import { peso } from './store';

/** Something that knows its prices' currency: a menu, an order or a saved order. */
export type Priced = { currency?: string; rateToPHP?: number | null } | null | undefined;

const cur = (p: Priced) => p?.currency || 'PHP';

function fmt(n: number, code: string, decimals: boolean) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    }).format(n);
  } catch {
    return `${code} ${decimals ? n.toFixed(2) : Math.round(n).toLocaleString('en-US')}`;
  }
}

/** A price in the menu's own currency: ₱129, ¥850, $12.50. */
export function money(n: number | null | undefined, p?: Priced) {
  if (n == null) return peso(null).replace('₱', cur(p) === 'PHP' ? '₱' : '');
  const code = cur(p);
  if (code === 'PHP') return peso(n);
  return fmt(n, code, Math.round(n * 100) % 100 !== 0);
}

/** Exact amount with centavos when needed, for bill splits (₱32.50, $8.25). */
export function moneyExact(n: number, p?: Priced) {
  const v = Math.round(n * 100) / 100;
  return Number.isInteger(v) ? money(v, p) : fmt(v, cur(p), true);
}

/** The same amount in pesos, or null when the menu is already in pesos or the rate is unknown. */
export function toPHP(n: number | null | undefined, p?: Priced): number | null {
  if (n == null) return null;
  if (cur(p) === 'PHP') return n;
  return p?.rateToPHP ? n * p.rateToPHP : null;
}

/** "≈ ₱341" for foreign menus, "" for peso menus. */
export function approx(n: number | null | undefined, p?: Priced) {
  if (cur(p) === 'PHP') return '';
  const v = toPHP(n, p);
  return v == null ? '' : `≈ ${peso(v)}`;
}

/** "¥850 (≈ ₱341)" or just "₱129". */
export function moneyWithApprox(n: number | null | undefined, p?: Priced) {
  const a = approx(n, p);
  return a ? `${money(n, p)} (${a})` : money(n, p);
}

export const isForeign = (p?: Priced) => cur(p) !== 'PHP';
