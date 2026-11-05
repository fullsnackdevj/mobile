import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { Capy } from '../../src/components/Capy';
import { Icon, IconName } from '../../src/components/Icon';
import { Btn, Card, H2, H3, Label, Photo, Row, S, Screen, T, Tile, XS } from '../../src/components/ui';
import { pickFromGallery, useQuota } from '../../src/scan';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

const QUICK: [string, IconName, 'p' | 'g'][] = [
  ['Caffeine', 'cup', 'p'],
  ['Tired', 'clock', 'p'],
  ['Hurry', 'timer', 'p'],
  ['Budget', 'wallet', 'g'],
  ['Treat', 'sparkle', 'p'],
  ['Healthy', 'leaf', 'g'],
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const c = useTheme();
  const profile = useStore((s) => s.profile);
  const menus = useStore((s) => s.menus);
  const history = useStore((s) => s.history);
  const currentMenuId = useStore((s) => s.currentMenuId);
  const mood = useStore((s) => s.mood);
  const set = useStore((s) => s.set);
  const q = useQuota();

  // One card per restaurant, most recent first, with the last thing picked there.
  const spots = Array.from(new Map(menus.map((m) => [m.restaurant, m])).values()).slice(0, 8);
  const lastPick = (r: string) => history.find((h) => h.restaurant === r)?.itemName;

  function quickMood(vibe: string) {
    set({ mood: { ...mood, vibe } });
    if (currentMenuId && menus.some((m) => m.id === currentMenuId)) router.push('/mood');
    else router.push('/camera');
  }

  const name = profile && !profile.guest ? profile.name : '';
  return (
    <Screen
      edgesBottom={false}
      top={
        <View style={{ height: 64, paddingHorizontal: 20, justifyContent: 'center' }}>
          <S b>
            {greeting()}
            {name ? `, ${name}.` : '.'}
          </S>
          <H2>Hungry?</H2>
        </View>
      }
      gap={18}
    >
      <Card flat style={{ padding: 18, gap: 14, backgroundColor: c.tint, borderColor: 'transparent' }}>
        <Row gap={14}>
          <Capy mood="happy" size={88} />
          <T b style={{ flex: 1 }}>Snap a menu. I'll pick your food or drink.</T>
        </Row>
        <Btn icon="camera" title="Scan a Menu" onPress={() => router.push('/camera')} disabled={q?.left === 0} style={{ minHeight: 64 }} />
        <XS b style={{ textAlign: 'center', marginTop: -6 }}>
          {q ? (q.left > 0 ? `${q.left} of ${q.limit} free scans left this month` : `No scans left. Resets ${q.resetsOn}.`) : ' '}
        </XS>
        <Row gap={10}>
          <Tile icon="image" label="Gallery" onPress={pickFromGallery} />
          <Tile icon="bowl" label="Saved" onPress={() => router.push('/saved-menus')} />
        </Row>
      </Card>

      <View style={{ gap: 10 }}>
        <Label style={{ marginBottom: 0 }}>Quick mood</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {QUICK.map(([label, icon, tone]) => (
            <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} onPress={() => quickMood(label)} style={{ width: 76, alignItems: 'center', gap: 8 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon n={icon} s={28} color={tone === 'g' ? c.green : c.primary} />
              </View>
              <XS b style={{ color: c.ink }}>
                {label}
              </XS>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H3>Recent spots</H3>
          {spots.length ? (
            <Pressable onPress={() => router.push('/saved-menus')}>
              <S b style={{ color: c.primary, textDecorationLine: 'underline' }}>
                See all
              </S>
            </Pressable>
          ) : null}
        </Row>
        {spots.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4, gap: 10 }}>
            {spots.map((m) => (
              <Card key={m.id} onPress={() => router.push({ pathname: '/recents/[name]', params: { name: m.restaurant } })} style={{ width: 150, padding: 12, gap: 8 }}>
                <Photo h={64} r={14} icon={m.items.every((i) => i.isDrink) ? 'cup' : 'utensils'} />
                <T b numberOfLines={1}>
                  {m.restaurant}
                </T>
                <XS numberOfLines={1}>{lastPick(m.restaurant) ?? `${m.items.length} items`}</XS>
              </Card>
            ))}
          </ScrollView>
        ) : (
          <S>Places you scan will show up here.</S>
        )}
      </View>
    </Screen>
  );
}
