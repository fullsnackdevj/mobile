import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Capy } from '../../src/components/Capy';
import { RouteSheet } from '../../src/components/RouteSheet';
import { Btn, Chip, Field, H2, Row, XS } from '../../src/components/ui';
import { shortDate, useStore } from '../../src/store';

const TAGS = ['Too spicy', 'Too salty', 'Too small', 'Worth it', 'Would pick again'];

export default function RatingPrompt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const h = useStore((s) => s.history.find((x) => x.id === id));
  const update = useStore((s) => s.updateHistory);
  const [r, setR] = useState<-1 | 0 | 1>(h?.rating || 1);
  const [tags, setTags] = useState<string[]>(h?.tags ?? []);
  const [note, setNote] = useState(h?.note ?? '');
  if (!h) return null;

  return (
    <RouteSheet>
      <Row gap={14}>
        <Capy mood="happy" size={64} />
        <View style={{ flex: 1 }}>
          <XS b>
            {h.restaurant} · {shortDate(h.date).toLowerCase()}
          </XS>
          <H2>How was the {h.itemName}?</H2>
        </View>
      </Row>
      <Row gap={12}>
        <Btn grow kind={r === 1 ? 'primary' : 'sec'} icon="thumbup" title="Loved it" onPress={() => setR(1)} style={{ minHeight: 64 }} />
        <Btn grow kind={r === -1 ? 'primary' : 'sec'} icon="thumbdown" title="Not great" onPress={() => setR(-1)} style={{ minHeight: 64 }} />
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {TAGS.map((t) => (
          <Chip key={t} label={t} on={tags.includes(t)} onPress={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])} />
        ))}
      </View>
      <Field placeholder="Add a note (optional)" value={note} onChangeText={setNote} />
      <Btn
        title="Save rating"
        onPress={() => {
          update(h.id, { rating: r, tags, note });
          router.back();
        }}
      />
      <Btn kind="txt" title="Skip" onPress={() => router.back()} />
    </RouteSheet>
  );
}
