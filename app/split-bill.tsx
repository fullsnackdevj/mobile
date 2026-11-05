import { useState } from 'react';
import { Share, Text, View } from 'react-native';
import { Banner, Btn, Card, Field, H3, Label, ListRow, Row, Screen, T, Toggle, TopBar, XS } from '../src/components/ui';
import { peso, useStore } from '../src/store';
import { fonts, personColors, useTheme } from '../src/theme';
import { TABLE } from '../src/types';

export default function SplitBill() {
  const c = useTheme();
  const order = useStore((s) => s.order);
  const [svc, setSvc] = useState('0');
  const [tip, setTip] = useState('0');
  const [excl, setExcl] = useState<Record<string, boolean>>({});

  const names = order.people.map((p) => p.name);
  const mult = 1 + (parseFloat(svc) || 0) / 100;
  const tipEach = names.length ? (parseFloat(tip) || 0) / names.length : 0;
  const shared = order.items.filter((x) => x.who === TABLE);
  const sharedTotal = shared.reduce((a, x) => a + (x.price ?? 0) * x.qty, 0);
  const sharers = names.filter((n) => !excl[n]);
  const share = sharers.length ? sharedTotal / sharers.length : 0;
  const own = (n: string) => order.items.filter((x) => x.who === n).reduce((a, x) => a + (x.price ?? 0) * x.qty, 0);
  const amt = (n: string) => (own(n) + (sharers.includes(n) ? share : 0)) * mult + tipEach;

  function shareSummary() {
    const lines = names.map((n) => `${n}: ${peso(amt(n))}`);
    Share.share({ message: `${order.restaurant} bill split (Pickybara)\n${lines.join('\n')}\nTotal: ${peso(names.reduce((a, n) => a + amt(n), 0))}` });
  }

  return (
    <Screen top={<TopBar title="Split the bill" />} gap={14} foot={<Btn icon="share" title="Share summary" onPress={shareSummary} />}>
      {shared.length ? (
        <Card style={{ padding: 14, gap: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T b>{shared.length === 1 ? `${shared[0].name} (shared)` : `${shared.length} shared items`}</T>
            <T b>{peso(sharedTotal)}</T>
          </Row>
          <XS>Items marked For Sharing on your order list</XS>
          <XS b>Who shared it?</XS>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {names.map((n) => (
              <Toggle key={n} label={n} on={!excl[n]} onPress={() => setExcl({ ...excl, [n]: !excl[n] })} style={{ minHeight: 44 }} />
            ))}
          </View>
        </Card>
      ) : (
        <Banner>No shared items. Add some to For Sharing to split them.</Banner>
      )}
      <Row gap={10}>
        <View style={{ flex: 1 }}>
          <Label>Service charge (%)</Label>
          <Field value={svc} onChangeText={setSvc} keyboardType="decimal-pad" style={{ minHeight: 48 }} />
        </View>
        <View style={{ flex: 1 }}>
          <Label>Tip (₱)</Label>
          <Field value={tip} onChangeText={setTip} keyboardType="number-pad" style={{ minHeight: 48 }} />
        </View>
      </Row>
      <Card>
        {names.map((n, i) => {
          const [bg, fg] = personColors(c, i);
          return (
            <ListRow key={n} last={i === names.length - 1}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.headBold, color: fg }}>{n[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <T b>{n}</T>
                <XS>Own items {peso(own(n))}</XS>
              </View>
              <H3>{peso(amt(n))}</H3>
            </ListRow>
          );
        })}
      </Card>
    </Screen>
  );
}
