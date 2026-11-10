import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Share, View } from 'react-native';
import { Btn, Card, Empty, H2, IconBtn, Label, ListRow, Row, S, Screen, Segment, Switch, T, Toast, TopBar, XS } from '../../src/components/ui';
import { shortDate, useStore } from '../../src/store';
import { money, moneyExact } from '../../src/money';
import { useTheme } from '../../src/theme';
import { TABLE } from '../../src/types';

type SplitHow = 'Equally' | 'By order';



export default function SavedOrder() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const rec = useStore((s) => s.savedOrders.find((o) => o.id === id));
  const reuse = useStore((s) => s.reuseOrder);
  const [price, setPrice] = useState<boolean | null>(null);
  const [split, setSplit] = useState(false);
  const [how, setHow] = useState<SplitHow>('Equally');
  const [heads, setHeads] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
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
  const sum = (rows: typeof rec.items) => rows.reduce((a, x) => a + (x.price ?? 0) * x.qty, 0);
  const groups = [...rec.people.map((p) => p.name), TABLE]
    .map((w) => ({ who: w, title: w === TABLE ? 'For Sharing' : w, rows: rec.items.filter((x) => x.who === w) }))
    .filter((g) => g.rows.length);
  const people = rec.people.map((p) => p.name);

  // Split: "Equally" divides the total by the number of people; "By order" is each person's own
  // items plus an equal part of the For Sharing items.
  const n = Math.max(1, heads ?? (people.length || 1));
  const sharedTotal = sum(rec.items.filter((x) => x.who === TABLE));
  const owes = (who: string) => (how === 'Equally' ? total / n : sum(rec.items.filter((x) => x.who === who)) + (people.length ? sharedTotal / people.length : 0));
  const splitOn = priceOn && split;

  function flash(t: string) {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }

  /** Copies one person's part, ready to paste into a private chat. */
  async function copyFor(who: string) {
    const mine = rec!.items.filter((x) => x.who === who);
    const amount = splitOn ? owes(who) : sum(mine);
    const list = mine.map((r) => `${r.qty}× ${r.name}`).join(', ');
    const lines = [
      `Hi ${who}! Your share for ${rec!.shop} ${shortDate(rec!.date) === 'Today' ? 'today' : `on ${shortDate(rec!.date)}`}: ${moneyExact(amount, rec!)}`,
      splitOn && how === 'Equally' ? `(${money(total, rec)} total, split ${n} ways)` : list ? `(${list}${splitOn && sharedTotal ? ' + your part of the shared items' : ''})` : '',
    ].filter(Boolean);
    await Clipboard.setStringAsync(lines.join('\n'));
    flash(`Copied ${who}'s share`);
  }

  function share() {
    const body = groups
      .map((g) => `${g.title}\n` + g.rows.map((r) => `  ${r.qty}× ${r.name}${r.note ? ` (${r.note})` : ''}${priceOn ? `  ${money((r.price ?? 0) * r.qty, rec)}` : ''}`).join('\n'))
      .join('\n');
    const splitText = splitOn
      ? how === 'Equally'
        ? `\n\nSplit ${n} ways: ${moneyExact(total / n, rec)} each`
        : '\n\nWho pays:\n' + people.map((p) => `  ${p}: ${moneyExact(owes(p), rec)}`).join('\n')
      : '';
    Share.share({ message: `${rec!.shop} · ${shortDate(rec!.date)}\n\n${body}${priceOn ? `\n\nTotal: ${money(total, rec)}` : ''}${splitText}\n\nMade with Pickybara` });
  }

  return (
    <Screen
      top={
        <>
          <TopBar title={rec.shop} sub={`${shortDate(rec.date)} · ${count} items`} />
          <Toast text={toast} />
        </>
      }
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
        <ListRow last={!priceOn}>
          <T b style={{ flex: 1 }}>
            Show prices
          </T>
          <Switch label="Show prices" on={priceOn} onPress={() => setPrice(!priceOn)} />
        </ListRow>
        {priceOn ? (
          <ListRow last>
            <View style={{ flex: 1 }}>
              <T b>Split the bill</T>
              <XS>So everyone knows what they owe before you send it.</XS>
            </View>
            <Switch label="Split the bill" on={split} onPress={() => setSplit(!split)} />
          </ListRow>
        ) : null}
      </Card>
      {splitOn ? (
        <Card style={{ padding: 16, gap: 12 }}>
          <Segment options={['Equally', 'By order'] as SplitHow[]} value={how} onChange={setHow} />
          {how === 'Equally' ? (
            <>
              <Row style={{ justifyContent: 'space-between' }}>
                <T b>People</T>
                <Row gap={4}>
                  <IconBtn n="minus" size={22} label="Fewer people" onPress={() => setHeads(Math.max(1, n - 1))} />
                  <H2 style={{ minWidth: 32, textAlign: 'center' }}>{n}</H2>
                  <IconBtn n="plus" size={22} label="More people" onPress={() => setHeads(Math.min(50, n + 1))} />
                </Row>
              </Row>
              <Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10 }}>
                <S>
                  {money(total, rec)} ÷ {n}
                </S>
                <H2>{moneyExact(total / n, rec)} each</H2>
              </Row>
            </>
          ) : (
            <>
              {people.map((p) => (
                <Row key={p} style={{ justifyContent: 'space-between' }}>
                  <T b>{p}</T>
                  <T b>{moneyExact(owes(p), rec)}</T>
                </Row>
              ))}
              {sharedTotal ? <XS>Includes an equal part of the For Sharing items ({money(sharedTotal, rec)}).</XS> : null}
              {!people.length ? <XS>Add people to this order to split it by what they ate.</XS> : null}
            </>
          )}
        </Card>
      ) : null}
      <Card style={{ padding: 16, gap: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>{rec.shop}</H2>
          <XS>{shortDate(rec.date)}</XS>
        </Row>
        {groups.map((g) => (
          <View key={g.title} style={{ gap: 6, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Label style={{ marginBottom: 0, color: c.muted, flex: 1 }}>{g.title}</Label>
              {priceOn ? <T b>{splitOn && g.who !== TABLE ? moneyExact(owes(g.who), rec) : money(sum(g.rows), rec)}</T> : null}
              {priceOn && g.who !== TABLE ? <IconBtn n="copy" size={20} label={`Copy ${g.title}'s share`} onPress={() => copyFor(g.who)} /> : null}
            </Row>
            {g.rows.map((r) => (
              <Row key={r.id} gap={8}>
                <View style={{ flex: 1 }}>
                  <T b>{r.name}</T>
                  {r.note ? <XS>{r.note}</XS> : null}
                </View>
                <T b>×{r.qty}</T>
                {priceOn ? <T style={{ minWidth: 54, textAlign: 'right' }}>{money((r.price ?? 0) * r.qty, rec)}</T> : null}
              </Row>
            ))}
          </View>
        ))}
        {priceOn ? (
          <Row style={{ justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: c.line, paddingTop: 10 }}>
            <T b>Total</T>
            <H2>{money(total, rec)}</H2>
          </Row>
        ) : null}
        <XS style={{ textAlign: 'center' }}>Made with Pickybara</XS>
      </Card>
    </Screen>
  );
}
