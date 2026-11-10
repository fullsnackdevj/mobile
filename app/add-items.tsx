import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Icon } from '../src/components/Icon';
import { Banner, Btn, Card, Empty, IconBtn, Label, ListRow, Row, Screen, T, Toggle, TopBar } from '../src/components/ui';
import { conflictsWithPerson, recommend } from '../src/recommend';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';
import { TABLE } from '../src/types';
import { money } from '../src/money';

export default function AddItems() {
  const c = useTheme();
  const params = useLocalSearchParams<{ who?: string }>();
  const order = useStore((s) => s.order);
  const menu = useStore((s) => s.menus.find((m) => m.id === s.order.menuId) ?? null);
  const bump = useStore((s) => s.bumpOrderItem);
  const taste = useStore((s) => s.taste);
  const mood = useStore((s) => s.mood);
  const dislikes = useStore((s) => s.dislikes);
  const history = useStore((s) => s.history);
  const names = [...order.people.map((p) => p.name), TABLE];
  const [who, setWho] = useState(params.who && names.includes(params.who) ? params.who : names[0]);
  const cats = menu ? Array.from(new Set(menu.items.map((i) => i.category))) : [];
  const [cat, setCat] = useState(cats[0] ?? '');
  const [msg, setMsg] = useState('');
  const person = order.people.find((p) => p.name === who);
  const count = order.items.reduce((a, x) => a + x.qty, 0);

  if (!menu) {
    return (
      <Screen top={<TopBar title="Add items" />}>
        <Empty text="The menu for this order isn't saved on this phone anymore." />
      </Screen>
    );
  }

  function pickFor() {
    const isMe = who === order.people[0]?.name;
    // For the main user use their full taste profile; for friends, just avoid their list.
    const ranked = isMe ? recommend(menu!.items, taste, dislikes, mood, history, true, menu).ranked.map((s) => s.item) : menu!.items.filter((i) => !i.isDrink);
    const p = ranked.find((i) => !conflictsWithPerson(i, person) && !order.items.some((x) => x.who === who && x.name === i.name));
    if (!p) return setMsg(`Nothing here fits ${who}'s list.`);
    bump(who, p.name, p.price, 1, p.id);
    setMsg(`Added ${p.name} for ${who}.`);
  }

  return (
    <Screen top={<TopBar title="Add items" sub={`${menu.restaurant} menu`} />} gap={14} foot={<Btn title={`Done · ${count} items`} onPress={() => router.back()} />}>
      <View style={{ gap: 8 }}>
        <Label style={{ marginBottom: 0 }}>Adding for</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {names.map((n) => (
            <Toggle
              key={n}
              label={n === TABLE ? 'For Sharing' : n}
              on={who === n}
              onPress={() => {
                setWho(n);
                setMsg('');
              }}
              style={{ minHeight: 44 }}
            />
          ))}
        </ScrollView>
      </View>
      {who !== TABLE ? <Btn kind="soft" sm icon="sparkle" title={`Pick for ${who}`} onPress={pickFor} /> : null}
      {msg ? (
        <Banner kind="g" icon="check">
          {msg}
        </Banner>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
        {cats.map((k) => (
          <Toggle key={k} label={k} on={cat === k} onPress={() => setCat(k)} style={{ minHeight: 44 }} />
        ))}
      </ScrollView>
      <Card>
        {menu.items
          .filter((i) => i.category === cat)
          .map((i, k, arr) => {
            const q = order.items.find((x) => x.who === who && x.name === i.name)?.qty ?? 0;
            const bad = who !== TABLE && conflictsWithPerson(i, person);
            return (
              <ListRow key={i.id} last={k === arr.length - 1}>
                {i.price == null || bad ? (
                  <View accessibilityLabel={bad ? `Not for ${who}` : 'Check this price'}>
                    <Icon n="warn" s={20} color={c.warn} />
                  </View>
                ) : null}
                <T b style={{ flex: 1 }}>
                  {i.name}
                </T>
                <T b>{money(i.price, menu)}</T>
                {q === 0 ? (
                  <IconBtn n="plus" size={20} color={c.tintInk} label={`Add ${i.name}`} style={{ backgroundColor: c.tint }} onPress={() => bump(who, i.name, i.price, 1, i.id)} />
                ) : (
                  <Row gap={0}>
                    <IconBtn n={q === 1 ? 'trash' : 'minus'} size={20} label={`Fewer ${i.name}`} onPress={() => bump(who, i.name, i.price, -1)} />
                    <T b style={{ minWidth: 22, textAlign: 'center' }}>
                      {q}
                    </T>
                    <IconBtn n="plus" size={20} label={`More ${i.name}`} onPress={() => bump(who, i.name, i.price, 1, i.id)} />
                  </Row>
                )}
              </ListRow>
            );
          })}
      </Card>
    </Screen>
  );
}
