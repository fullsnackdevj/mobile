import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { Btn, Card, H2, IconBtn, Progress, Row, S, SheetBody, T } from '../src/components/ui';
import { useTheme } from '../src/theme';
import { usePicks } from '../src/usePicks';

export default function WhySheet() {
  const c = useTheme();
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { scoreOf } = usePicks();
  const s = scoreOf(id);
  if (!s) return null;
  const reasons = s.reasons.length ? s.reasons : ['Scores well across your taste, budget and mood'];

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Pressable accessibilityLabel="Close sheet" onPress={() => router.back()} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.scrim }} />
      <SheetBody c={c} bottom={ins.bottom}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>Why this one?</H2>
          <IconBtn n="close" size={22} label="Close" onPress={() => router.back()} />
        </Row>
        <View style={{ gap: 10 }}>
          {reasons.map((r) => (
            <Row key={r}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.greenTint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon n="check" s={16} color={c.green} />
              </View>
              <T style={{ flex: 1 }}>{r}</T>
            </Row>
          ))}
        </View>
        <Card flat style={{ paddingVertical: 14, paddingHorizontal: 16, gap: 12 }}>
          {Object.entries(s.scores).map(([k, v]) => (
            <Row key={k}>
              <S b style={{ width: 56 }}>
                {k}
              </S>
              <Progress pct={v} />
              <S b style={{ width: 40, textAlign: 'right', color: c.ink }}>
                {v}%
              </S>
            </Row>
          ))}
        </Card>
        <Btn title="Got it" onPress={() => router.back()} />
      </SheetBody>
    </View>
  );
}
