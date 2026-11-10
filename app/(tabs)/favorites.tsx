import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Card, Empty, Field, IconBtn, Photo, Row, Screen, Segment, T, TopBar, XS } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';
import { money } from '../../src/money';

export default function Favorites() {
  const c = useTheme();
  const favs = useStore((s) => s.favorites);
  const rests = useStore((s) => s.favRestaurants);
  const menus = useStore((s) => s.menus);
  const toggleFav = useStore((s) => s.toggleFav);
  const toggleRest = useStore((s) => s.toggleFavRestaurant);
  const set = useStore((s) => s.set);
  const [tab, setTab] = useState<'Items' | 'Restaurants'>('Items');
  const [q, setQ] = useState('');
  const match = (x: string) => x.toLowerCase().includes(q.toLowerCase());

  const items = favs.filter((f) => match(f.name) || match(f.restaurant));
  const places = rests.filter(match);
  const empty = tab === 'Items' ? !items.length : !places.length;

  return (
    <Screen edgesBottom={false} top={<TopBar back={false} big title="Favorites" />} gap={14}>
      <Segment track="line" options={['Items', 'Restaurants']} value={tab} onChange={setTab} />
      <Field icon="search" placeholder="Search" value={q} onChangeText={setQ} style={{ minHeight: 48 }} />
      {empty ? (
        <Empty text={tab === 'Items' ? "Heart items you love and they'll show up here." : 'Heart a restaurant from its page to keep it here.'} cta="Scan a menu" onCta={() => router.push('/camera')} />
      ) : tab === 'Items' ? (
        <View style={{ gap: 12 }}>
          {items.map((f) => {
            const exists = menus.some((m) => m.id === f.menuId && m.items.some((i) => i.id === f.itemId));
            return (
              <Card key={f.key} style={{ padding: 10 }}>
                <Row>
                  <Row style={{ flex: 1, minHeight: 64 }}>
                    <Photo h={64} w={64} r={16} />
                    <View style={{ flex: 1 }}>
                      <T b>{f.name}</T>
                      <XS>{f.restaurant}</XS>
                    </View>
                    <T b>{money(f.price, menus.find((m) => m.id === f.menuId))}</T>
                  </Row>
                  {exists ? (
                    <IconBtn
                      n="chevron"
                      label={`Open ${f.name}`}
                      size={20}
                      onPress={() => {
                        set({ currentMenuId: f.menuId });
                        router.push({ pathname: '/item/[id]', params: { id: f.itemId } });
                      }}
                    />
                  ) : null}
                  <IconBtn n="heart" filled color={c.primary} label={`Remove ${f.name} from favorites`} onPress={() => toggleFav(f)} />
                </Row>
              </Card>
            );
          })}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {places.map((r) => (
            <Card key={r} style={{ padding: 10 }} onPress={() => router.push({ pathname: '/recents/[name]', params: { name: r } })}>
              <Row>
                <Photo h={64} w={64} r={16} icon="map" />
                <View style={{ flex: 1 }}>
                  <T b>{r}</T>
                  <XS>{menus.filter((m) => m.restaurant === r).length} scanned menus</XS>
                </View>
                <IconBtn n="heart" filled color={c.primary} label={`Remove ${r} from favorites`} onPress={() => toggleRest(r)} />
              </Row>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
