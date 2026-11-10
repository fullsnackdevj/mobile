import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { api } from '../api';
import { money } from '../money';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Banner, Btn, H2, S, Sheet, Toggle, XS } from './ui';

// Common currencies for travellers from the Philippines. The AI can detect others too.
const CODES = ['PHP', 'USD', 'JPY', 'KRW', 'THB', 'SGD', 'HKD', 'TWD', 'CNY', 'VND', 'MYR', 'IDR', 'AUD', 'EUR', 'GBP', 'AED'];

/** Shows the menu's currency and today's rate, and lets the user correct a wrong guess. */
export function CurrencyNote({ menuId }: { menuId: string }) {
  const c = useTheme();
  const menu = useStore((s) => s.menus.find((m) => m.id === menuId));
  const updateMenu = useStore((s) => s.updateMenu);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');
  if (!menu) return null;
  const code = menu.currency || 'PHP';

  async function pick(next: string) {
    setErr('');
    if (next === 'PHP') {
      updateMenu(menuId, { currency: 'PHP', rateToPHP: 1 });
      return setOpen(false);
    }
    setBusy(next);
    try {
      const r = await api.rate(next);
      updateMenu(menuId, { currency: next, rateToPHP: r.rateToPHP });
      setOpen(false);
    } catch (e: any) {
      setErr(e?.message || "Couldn't get today's rate.");
    } finally {
      setBusy(null);
    }
  }

  const foreign = code !== 'PHP';
  const rate = menu.rateToPHP;
  return (
    <>
      <Banner icon="wallet" onPress={() => setOpen(true)}>
        {foreign
          ? rate
            ? `Prices are in ${code}. ${money(1, menu)} ≈ ₱${rate < 1 ? rate.toFixed(2) : rate.toFixed(rate < 10 ? 2 : 0)} today, so peso amounts are estimates. Tap to change.`
            : `Prices are in ${code}. Today's rate isn't available, so there are no peso estimates. Tap to change.`
          : 'Prices are in pesos (₱). Tap to change the currency.'}
      </Banner>
      {foreign && rate ? (
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://www.exchangerate-api.com')} style={{ marginTop: -8, alignSelf: 'flex-start' }}>
          <XS style={{ color: c.muted, textDecorationLine: 'underline' }}>Rates by Exchange Rate API</XS>
        </Pressable>
      ) : null}
      <Sheet visible={open} onClose={() => setOpen(false)}>
        <H2>Menu currency</H2>
        <S>Pick the currency printed on this menu.</S>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CODES.map((k) => (
            <Toggle key={k} label={busy === k ? '…' : k} on={k === code} onPress={() => pick(k)} />
          ))}
        </View>
        {err ? <XS style={{ color: c.warn }}>{err}</XS> : null}
        <Btn kind="txt" title="Close" onPress={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
