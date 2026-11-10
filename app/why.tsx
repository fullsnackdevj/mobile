import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { Btn, Card, H2, H3, IconBtn, Progress, Row, S, SheetBody, T, XS } from '../src/components/ui';
import { shortDate, useStore } from '../src/store';
import { useTheme } from '../src/theme';
import { usePicks } from '../src/usePicks';

export default function WhySheet() {
  const c = useTheme();
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { scoreOf, menu } = usePicks();
  const history = useStore((st) => st.history);
  const s = scoreOf(id);
  if (!s || !menu) return null;

  // Your own past ratings of this item: free, true and personal (instead of outside reviews).
  const name = s.item.name.toLowerCase();
  const past = history.filter((h) => h.itemName.toLowerCase() === name).sort((a, b) => b.date - a.date);
  const here = past.filter((h) => h.restaurant === menu.restaurant);
  const elsewhere = past.filter((h) => h.restaurant !== menu.restaurant);
  const rated = past.filter((h) => h.rating !== 0).slice(0, 2);
  const summary = here.length
    ? `You've picked this ${here.length === 1 ? 'once' : `${here.length} times`} here.`
    : elsewhere.length
      ? `You had this at ${elsewhere[0].restaurant}${elsewhere.length > 1 ? ` and ${elsewhere.length - 1} other ${elsewhere.length === 2 ? 'place' : 'places'}` : ''}.`
      : "First time? You haven't tried this yet.";
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
        <Card flat style={{ paddingVertical: 14, paddingHorizontal: 16, gap: 10 }}>
          <H3>Your history</H3>
          <S>{summary}</S>
          {rated.map((h) => {
            const good = h.rating === 1;
            return (
              <Row key={h.id} style={{ alignItems: 'flex-start' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: good ? c.greenTint : c.warnTint, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon n={good ? 'thumbup' : 'thumbdown'} s={15} color={good ? c.green : c.warn} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <T b>
                    {good ? 'Loved it' : 'Not great'} · {shortDate(h.date)}
                    {h.restaurant !== menu.restaurant ? ` · ${h.restaurant}` : ''}
                  </T>
                  {h.note ? <XS>"{h.note}"</XS> : null}
                </View>
              </Row>
            );
          })}
          {past.length && !rated.length ? <XS>Rate it after you eat, and Pickybara will remember.</XS> : null}
        </Card>
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
