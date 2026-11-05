import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Capy } from '../src/components/Capy';
import { Icon } from '../src/components/Icon';
import { Btn, Card, H1, H3, Photo, Pill, Row, S, Screen, T } from '../src/components/ui';
import { useTheme } from '../src/theme';

const COPY = [
  ['Snap a menu', 'Point your camera at any food or drink menu.'],
  ['Tell us your mood', 'Tired, treating yourself, in a hurry? One tap is enough.'],
  ['Get one clear answer', 'No scrolling, no second-guessing. Just what to eat or drink.'],
];

export default function Welcome() {
  const c = useTheme();
  const [i, setI] = useState(0);
  const go = () => router.replace('/signup');

  return (
    <Screen
      scroll={false}
      top={
        <View style={{ height: 60, flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 10 }}>
          <Btn kind="txt" sm title="Skip" onPress={go} />
        </View>
      }
      foot={i < 2 ? <Btn title="Next" onPress={() => setI(i + 1)} /> : <Btn title="Get Started" onPress={go} />}
      bodyStyle={{ paddingHorizontal: 28 }}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 300, height: 300, borderRadius: 150, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>
          {i === 0 && (
            <View style={{ width: 220, height: 250 }}>
              <View style={{ position: 'absolute', left: 20, top: 10, width: 180, height: 220, backgroundColor: c.card, borderRadius: 18, transform: [{ rotate: '-4deg' }], padding: 20, gap: 12 }}>
                {[60, 90, 75, 85, 50, 80, 70].map((w, k) => (
                  <View key={k} style={{ height: k === 0 || k === 4 ? 14 : 10, width: `${w}%`, borderRadius: 10, backgroundColor: c.line, marginTop: k === 4 ? 10 : 0 }} />
                ))}
              </View>
              <View style={{ position: 'absolute', right: 0, bottom: 0, width: 76, height: 76, borderRadius: 38, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Icon n="camera" s={36} color={c.onPrimary} />
              </View>
            </View>
          )}
          {i === 1 && (
            <View style={{ width: 280, height: 280 }}>
              <View style={{ position: 'absolute', left: 90, top: 95 }}>
                <Capy mood="thinking" size={100} />
              </View>
              {(
                [
                  ['flame', 108, 6, c.primary],
                  ['leaf', 204, 52, c.green],
                  ['wallet', 210, 166, c.primary],
                  ['clock', 108, 212, c.green],
                  ['sparkle', 8, 166, c.primary],
                  ['heart', 12, 52, c.green],
                ] as const
              ).map(([n, l, t, col]) => (
                <Card key={n} style={{ position: 'absolute', left: l, top: t, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon n={n} s={26} color={col} />
                </Card>
              ))}
            </View>
          )}
          {i === 2 && (
            <View style={{ width: 260, height: 260 }}>
              <Card style={{ position: 'absolute', left: 0, top: 20, width: 230, padding: 12, gap: 10 }}>
                <Photo h={100} r={16} />
                <Row style={{ justifyContent: 'space-between' }}>
                  <Pill label="Top pick" />
                  <Pill kind="g" label="94% match" />
                </Row>
                <H3>Crispy Chicken Rice Bowl</H3>
                <S>₱149 · mild spice</S>
              </Card>
              <View style={{ position: 'absolute', right: -10, bottom: -6 }}>
                <Capy mood="happy" size={92} />
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 10, minHeight: 120 }}>
        <H1 style={{ textAlign: 'center' }}>{COPY[i][0]}</H1>
        <T style={{ color: c.muted, textAlign: 'center' }}>{COPY[i][1]}</T>
      </View>
      <Row gap={8} style={{ justifyContent: 'center' }}>
        {[0, 1, 2].map((k) => (
          <View key={k} style={{ height: 10, borderRadius: 5, width: k === i ? 28 : 10, backgroundColor: k === i ? c.primary : c.line }} />
        ))}
      </Row>
    </Screen>
  );
}
