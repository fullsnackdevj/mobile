import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Icon } from '../src/components/Icon';
import { Btn, Row, Screen, TopBar } from '../src/components/ui';
import { useStore } from '../src/store';
import { fonts, useTheme } from '../src/theme';
import { Text } from 'react-native';

export default function MultiPhoto() {
  const c = useTheme();
  const photos = useStore((s) => s.photos);
  const set = useStore((s) => s.set);
  const [sel, setSel] = useState(0);
  const cur = photos[sel];

  const swap = (a: number, b: number) => {
    if (b < 0 || b >= photos.length) return;
    const n = photos.slice();
    [n[a], n[b]] = [n[b], n[a]];
    set({ photos: n });
    setSel(b);
  };

  return (
    <Screen
      scroll={false}
      top={<TopBar title={`${photos.length} photos`} onBack={() => router.replace('/camera')} />}
      gap={14}
      foot={
        <>
          <Btn title="Process Menu" disabled={!photos.length} onPress={() => router.replace('/scanning')} />
          <Btn kind="txt" title="Retake all" onPress={() => router.replace('/camera')} />
        </>
      }
    >
      <View style={{ flex: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: c.tint }}>
        {cur ? <Image source={{ uri: cur }} style={{ flex: 1 }} resizeMode="contain" accessibilityLabel={`Page ${sel + 1} of the menu`} /> : null}
      </View>
      <Row gap={10} style={{ justifyContent: 'center' }}>
        <Btn kind="sec" sm icon="back" title="Earlier" onPress={() => swap(sel, sel - 1)} />
        <Btn kind="sec" sm title="Later" onPress={() => swap(sel, sel + 1)} />
        <Btn
          kind="soft"
          sm
          icon="trash"
          title="Delete"
          disabled={photos.length <= 1}
          onPress={() => {
            set({ photos: photos.filter((_, i) => i !== sel) });
            setSel(Math.max(0, sel - 1));
          }}
        />
      </Row>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ flexGrow: 0 }}>
        {photos.map((p, i) => (
          <Pressable key={p} accessibilityLabel={`Photo ${i + 1}`} onPress={() => setSel(i)} style={{ width: 76, height: 100, borderRadius: 16, borderWidth: 3, borderColor: i === sel ? c.primary : 'transparent', overflow: 'hidden' }}>
            <Image source={{ uri: p }} style={{ flex: 1 }} />
            <Text style={{ position: 'absolute', left: 6, top: 4, fontFamily: fonts.headBold, color: '#fff', textShadowColor: '#000', textShadowRadius: 3 }}>{i + 1}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityLabel="Add another photo" onPress={() => router.replace('/camera')} style={{ width: 76, height: 100, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon n="plus" s={26} color={c.primary} />
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
