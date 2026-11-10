import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../src/components/Icon';
import { Btn, Card, H1, H2, H3, Label, Row, S, Screen, Segment, Sheet, Switch, T, TopBar } from '../src/components/ui';
import { useStore } from '../src/store';
import { fonts, useTheme } from '../src/theme';
import { TABLE } from '../src/types';
import { Price } from '../src/components/Price';
import { money } from '../src/money';

type Line = { key: string; name: string; qty: number; amt: number; note: string };

export default function Cashier() {
  const c = useTheme();
  const order = useStore((s) => s.order);
  const setOrder = useStore((s) => s.setOrder);
  const save = useStore((s) => s.saveOrderSnapshot);
  const clearOrder = useStore((s) => s.clearOrder);
  const [mode, setMode] = useState<'Combined' | 'By person'>('Combined');
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [ask, setAsk] = useState(false);

  const total = order.items.reduce((a, x) => a + (x.price ?? 0) * x.qty, 0);
  const count = order.items.reduce((a, x) => a + x.qty, 0);

  let groups: { title: string; sub: number; rows: Line[] }[];
  if (mode === 'Combined') {
    const map: Record<string, Line> = {};
    order.items.forEach((x) => {
      const k = x.name + '|' + x.note;
      map[k] = map[k] || { key: k, name: x.name, note: x.note, qty: 0, amt: 0 };
      map[k].qty += x.qty;
      map[k].amt += (x.price ?? 0) * x.qty;
    });
    groups = [{ title: '', sub: total, rows: Object.values(map) }];
  } else {
    groups = [...order.people.map((p) => p.name), TABLE]
      .map((w) => {
        const rows = order.items.filter((x) => x.who === w).map((x) => ({ key: w + '|' + x.name, name: x.name, note: x.note, qty: x.qty, amt: (x.price ?? 0) * x.qty }));
        return { title: w === TABLE ? 'For Sharing' : w, sub: rows.reduce((a, r) => a + r.amt, 0), rows };
      })
      .filter((g) => g.rows.length);
  }

  // Whether it's saved or not, the order is finished: empty the list so it can't be saved twice.
  const leave = () => {
    setAsk(false);
    router.navigate('/(tabs)/history');
    setTimeout(clearOrder, 0); // after leaving, so this screen doesn't flash empty
  };

  return (
    <Screen
      top={<TopBar title="For the counter" sub={`${order.restaurant} · ${count} items`} />}
      gap={14}
      footStyle={{ borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.card }}
      foot={
        <>
          {order.price ? (
            <Row style={{ justifyContent: 'space-between', paddingBottom: 6 }}>
              <T b>Total</T>
              <Price n={total} p={order} as={H1} />
            </Row>
          ) : null}
          <Btn title="Done" onPress={() => setAsk(true)} />
        </>
      }
    >
      <Row gap={10}>
        <View style={{ flex: 1 }}>
          <Segment options={['Combined', 'By person'] as ('Combined' | 'By person')[]} value={mode} onChange={setMode} />
        </View>
        <Row gap={8}>
          <S b>Prices</S>
          <Switch label="Show prices" on={!!order.price} onPress={() => setOrder({ price: !order.price })} />
        </Row>
      </Row>
      {groups.map((g) => (
        <View key={g.title || 'all'} style={{ gap: 8 }}>
          {g.title ? (
            <Row style={{ justifyContent: 'space-between' }}>
              <Label style={{ marginBottom: 0, color: c.muted }}>{g.title}</Label>
              {order.price ? <H3>{money(g.sub, order)}</H3> : null}
            </Row>
          ) : null}
          <Card>
            {g.rows.map((r, k) => {
              const on = !!done[r.key];
              return (
                <Pressable
                  key={r.key}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  onPress={() => setDone({ ...done, [r.key]: !on })}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 72, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: k === g.rows.length - 1 ? 0 : 1, borderBottomColor: c.line, opacity: on ? 0.45 : 1 }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: on ? c.primary : c.line, backgroundColor: on ? c.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {on ? <Icon n="check" s={18} color={c.onPrimary} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <H3 style={{ textDecorationLine: on ? 'line-through' : 'none' }}>{r.name}</H3>
                    {r.note ? <S b>{r.note}</S> : null}
                  </View>
                  <H2>×{r.qty}</H2>
                  {order.price ? <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: c.ink, minWidth: 54, textAlign: 'right' }}>{money(r.amt, order)}</Text> : null}
                </Pressable>
              );
            })}
          </Card>
        </View>
      ))}
      <Sheet visible={ask} onClose={() => setAsk(false)}>
        <H2>Save this order list?</H2>
        <T>Keep it in History so you can reuse it next time.</T>
        <View style={{ gap: 6 }}>
          <Btn
            title="Save order list"
            onPress={() => {
              save();
              leave();
            }}
          />
          <Btn kind="txt" title="Not now" onPress={leave} />
        </View>
      </Sheet>
    </Screen>
  );
}
