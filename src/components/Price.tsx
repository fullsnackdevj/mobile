import type { ComponentType, ReactNode } from 'react';
import { View } from 'react-native';
import { approx, money, Priced } from '../money';
import { XS } from './ui';

/**
 * A price in the menu's currency with the peso estimate underneath for foreign menus.
 * `as` is the text style to use for the main price (H1, H2, T…).
 */
export function Price({ n, p, as: As, align = 'flex-end' }: { n: number | null | undefined; p?: Priced; as: ComponentType<{ children?: ReactNode }>; align?: 'flex-start' | 'flex-end' }) {
  const a = approx(n, p);
  return (
    <View style={{ alignItems: align }}>
      <As>{money(n, p)}</As>
      {a ? <XS>{a}</XS> : null}
    </View>
  );
}
