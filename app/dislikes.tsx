import { useState } from 'react';
import { View } from 'react-native';
import { Capy } from '../src/components/Capy';
import { Banner, Card, Chip, Field, H3, IconBtn, ListRow, Screen, T, TopBar } from '../src/components/ui';
import { useStore } from '../src/store';

const POOL = ['Olives', 'Anchovies', 'Blue cheese', 'Bitter melon', 'Eggplant', 'Tomatoes', 'Raisins', 'Liver', 'Mushrooms', 'Cilantro', 'Onions', 'Garlic', 'Coconut', 'Pickles', 'Mayonnaise', 'Ampalaya', 'Bagoong', 'Durian', 'Tofu', 'Shrimp paste'];

export default function Dislikes() {
  const list = useStore((s) => s.dislikes);
  const set = useStore((s) => s.set);
  const [q, setQ] = useState('');
  const add = (x: string) => {
    const v = x.trim();
    if (v && !list.some((l) => l.toLowerCase() === v.toLowerCase())) set({ dislikes: [...list, v] });
    setQ('');
  };
  const matches = q ? POOL.filter((p) => p.toLowerCase().includes(q.toLowerCase()) && !list.includes(p)).slice(0, 4) : [];
  const custom = q.trim() && !POOL.some((p) => p.toLowerCase() === q.trim().toLowerCase());

  return (
    <Screen top={<TopBar title="Dislike list" />} gap={14}>
      <Banner icon="check">We'll never recommend these.</Banner>
      <Field icon="search" placeholder="Search ingredients to add" value={q} onChangeText={setQ} onSubmitEditing={() => add(q)} returnKeyType="done" />
      {matches.length || custom ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {matches.map((m) => (
            <Chip key={m} icon="plus" label={m} onPress={() => add(m)} />
          ))}
          {custom ? <Chip icon="plus" label={`Add "${q.trim()}"`} onPress={() => add(q)} /> : null}
        </View>
      ) : null}
      {list.length ? (
        <Card>
          {list.map((l, i) => (
            <ListRow key={l} last={i === list.length - 1}>
              <T b style={{ flex: 1 }}>
                {l}
              </T>
              <IconBtn n="close" size={20} label={`Remove ${l}`} onPress={() => set({ dislikes: list.filter((x) => x !== l) })} />
            </ListRow>
          ))}
        </Card>
      ) : (
        <View style={{ alignItems: 'center', gap: 14, paddingTop: 40 }}>
          <Capy mood="happy" size={110} />
          <H3>Nothing on your dislike list.</H3>
        </View>
      )}
    </Screen>
  );
}
