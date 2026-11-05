import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, View } from 'react-native';
import { Btn, Card, Empty, H2, Label, ListRow, Row, Screen, Switch, T, TopBar, XS } from '../../src/components/ui';
import { peso, shortDate, useStore } from '../../src/store';
import { useTheme } from '../../src/theme';
import { TABLE } from '../../src/types';

export default function SavedOrder() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const rec = useStore((s) => s.savedOrders.find((o) => o.id === id));
  const reuse = useStore((s) => s.reuseOrder);
  const [price, setPrice] = useState<boolean | null>(null);
  if (!rec) {
    return (
      <Screen top={<TopBar />}>
        <Empty text="This order list was deleted." />
      </Screen>
    );
  }
  const priceOn = price ?? rec.price;
  const total = rec.items.reduce((a, x) => a + (x.price ?? 0) * x.qty, 0);
  const count = rec.items.reduce((a, x) => a + x.qty, 0);
  const groups = [...rec.people.map((p) => p.name), TABLE]
    .map((w) => ({ title: w === TABLE ? 'For Sharing' : w, rows: rec.items.filter((x) => x.who === w) }))
    .filter((g) => g.rows.length);

  function share() {
    const body = groups
      .map((g) => `${g.title}\n` + g.rows.map((r) => `  ${r.qty}× ${r.name}${r.note ? ` (${r.note})` : ''}${priceOn ? `  ${peso((r.price ?? 0) * r.qty)}` : ''}`).join('\n'))
      .join('\n');
    Share.share({ message: `${rec!.shop} · ${shortDate(rec!.date)}\n\n${body}${priceOn ? `\n\nTotal: ${peso(total)}` : ''}\n\nMade with Pickybara` });
  }

  return (
    <Screen
      top={<TopBar title={rec.shop} sub={`${shortDate(rec.date)} · ${count} items`} />}
      gap={14}
      footStyle={{ borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.card }}
      foot={
        <Row gap={8}>
          <Btn
            kind="sec"
            grow
            title="Reuse order"
            onPress={() => {
              reuse(rec.id, priceOn);
              router.navigate('/(tabs)/order');
            }}
          />
          <Btn grow icon="share" title="Share" onPress={share} />
        </Row>
      }
    >
      <Card flat>
        <ListRow last>
          <T b style={{ flex: 1 }}>
            Show prices
          </T>
          <Switch label="Show prices" on={priceOn} onPress={() => setPrice(!priceOn)} />
        </ListRow>
      </Card>
      <Card style={{ padding: 16, gap: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>{rec.shop}</H2>
          <XS>{shortDate(rec.date)}</XS>
        </Row>
        {groups.map((g) => (
          <View key={g.title} style={{ gap: 6, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Label style={{ marginBottom: 0, color: c.muted }}>{g.title}</Label>
              {priceOn ? <T b>{peso(g.rows.reduce((a, x) => a + (x.price ?? 0) * x.qty, 0))}</T> : null}
            </Row>
            {g.rows.map((r) => (
              <Row key={r.id} gap={8}>
                <View style={{ flex: 1 }}>
                  <T b>{r.name}</T>
                  {r.note ? <XS>{r.note}</XS> : null}
                </View>
                <T b>×{r.qty}</T>
                {priceOn ? <T style={{ minWidth: 54, textAlign: 'right' }}>{peso((r.price ?? 0) * r.qty)}</T> : null}
              </Row>
            ))}
          </View>
        ))}
        {priceOn ? (
          <Row style={{ justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: c.line, paddingTop: 10 }}>
            <T b>Total</T>
            <H2>{peso(total)}</H2>
          </Row>
        ) : null}
        <XS style={{ textAlign: 'center' }}>Made with Pickybara</XS>
      </Card>
    </Screen>
  );
}
