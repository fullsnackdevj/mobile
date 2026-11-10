import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Capy } from '../../src/components/Capy';
import { RouteSheet } from '../../src/components/RouteSheet';
import { Btn, Field, H2, Row, XS } from '../../src/components/ui';
import { shortDate, useStore } from '../../src/store';

export default function RatingPrompt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const h = useStore((s) => s.history.find((x) => x.id === id));
  const update = useStore((s) => s.updateHistory);
  const [r, setR] = useState<-1 | 0 | 1>(h?.rating || 1);
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
      <Field placeholder="Add a note (optional)" value={note} onChangeText={setNote} />
      <Btn
        title="Save rating"
        onPress={() => {
          update(h.id, { rating: r, note });
          router.back();
        }}
      />
      <Btn kind="txt" title="Skip" onPress={() => router.back()} />
    </RouteSheet>
  );
}
