import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { DeleteSpotSheet } from '../src/components/DeleteSpotSheet';
import { Icon } from '../src/components/Icon';
import { SpotEditor } from '../src/components/SpotEditor';
import { SpotImage } from '../src/components/SpotImage';
import { Btn, Card, Empty, Field, Photo, Row, Screen, T, TopBar, XS } from '../src/components/ui';
import { allSpots, Spot } from '../src/spots';
import { inlineDate, useStore } from '../src/store';
import { useTheme } from '../src/theme';

/** Every spot (saved or scanned), most recent first. Tapping one opens its page. */
export default function RecentSpots() {
  const c = useTheme();
  const menus = useStore((s) => s.menus);
  const history = useStore((s) => s.history);
  const places = useStore((s) => s.places);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState('');
  const spots = useMemo(() => allSpots(places, menus, history), [places, menus, history]);
  const term = q.trim().toLowerCase();
  const list = spots.filter((s) => !term || s.name.toLowerCase().includes(term) || s.place?.address?.toLowerCase().includes(term));
  const open = (name: string) => router.push({ pathname: '/recents/[name]', params: { name } });

  const line = (s: Spot) =>
    s.lastVisit
      ? `Last pick: ${s.lastVisit.itemName} · ${inlineDate(s.lastVisit.date)}`
      : s.menu
        ? `Scanned ${inlineDate(s.menu.createdAt)} · ${s.menu.items.length} items`
        : 'No menu yet';

  return (
    <Screen top={<TopBar title="Recent spots" right={<Btn kind="soft" sm icon="plus" title="Add spot" onPress={() => setAdding(true)} />} />} gap={14}>
      {spots.length > 4 ? <Field icon="search" placeholder="Search spots" value={q} onChangeText={setQ} /> : null}
      {list.length ? (
        <View style={{ gap: 10 }}>
          {list.map((s) => (
            <Card key={s.name} onPress={() => open(s.name)} onLongPress={() => setToDelete(s.name)} style={{ padding: 12 }}>
              <Row gap={12}>
                {s.place?.photo ? (
                  <SpotImage uri={s.place.photo} focus={s.place.photoFocus} w={56} h={56} r={16} />
                ) : (
                  <Photo h={56} w={56} r={16} icon={s.menu?.items.length && s.menu.items.every((i) => i.isDrink) ? 'cup' : 'utensils'} />
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <T b numberOfLines={1}>
                    {s.name}
                  </T>
                  {s.place?.address ? (
                    <XS numberOfLines={1}>
                      <Icon n="map" s={11} color={c.muted} /> {s.place.address}
                    </XS>
                  ) : null}
                  <XS numberOfLines={1}>{line(s)}</XS>
                </View>
                <Icon n="chevron" s={18} color={c.muted} />
              </Row>
            </Card>
          ))}
        </View>
      ) : (
        <Empty text={term ? 'No spots match that search.' : 'Places you scan or add will show up here.'} cta={term ? undefined : 'Add a spot'} onCta={() => setAdding(true)} />
      )}
      {list.length ? <XS style={{ textAlign: 'center' }}>Press and hold a spot to delete it.</XS> : null}
      <DeleteSpotSheet name={toDelete} visible={!!toDelete} onClose={() => setToDelete('')} />
      <SpotEditor visible={adding} name="" onClose={() => setAdding(false)} onSaved={open} />
    </Screen>
  );
}
