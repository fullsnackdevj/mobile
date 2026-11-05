import { router } from 'expo-router';
import { View } from 'react-native';
import { Icon } from '../src/components/Icon';
import { Card, Photo, Pill, Row, Screen, T, TopBar, XS } from '../src/components/ui';
import { peso } from '../src/store';
import { useTheme } from '../src/theme';
import { usePicks } from '../src/usePicks';

export default function Ranked() {
  const c = useTheme();
  const { menu, picks } = usePicks();
  if (!menu || !picks) return null;
  return (
    <Screen top={<TopBar title="More options" sub={menu.restaurant} />} gap={12}>
      {picks.ranked.map((s, i) => (
        <Card key={s.item.id} onPress={() => router.push({ pathname: '/item/[id]', params: { id: s.item.id } })} style={{ padding: 10 }}>
          <Row>
            <Photo h={56} w={56} r={14} icon={s.item.isDrink ? 'cup' : 'utensils'} />
            <View style={{ flex: 1 }}>
              <T b>
                {i + 1}. {s.item.name}
              </T>
              <XS>
                {peso(s.item.price)} · {s.reasons[0] ?? s.item.category}
              </XS>
              {s.allergyHits.length ? <Pill kind="w" icon="warn" label={s.allergyHits.join(', ')} style={{ marginTop: 4 }} /> : null}
            </View>
            <Pill kind="g" label={`${s.match}%`} />
            <Icon n="chevron" s={20} color={c.ink} />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
