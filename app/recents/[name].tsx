import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { Banner, Btn, Card, H1, H3, IconBtn, Photo, Pill, Row, S, Screen, T, TopBar, XS } from '../../src/components/ui';
import { recommend } from '../../src/recommend';
import { peso, shortDate, useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

export default function Recents() {
  const c = useTheme();
  const { name } = useLocalSearchParams<{ name: string }>();
  const menus = useStore((s) => s.menus);
  const history = useStore((s) => s.history);
  const taste = useStore((s) => s.taste);
  const dislikes = useStore((s) => s.dislikes);
  const mood = useStore((s) => s.mood);
  const favRest = useStore((s) => s.favRestaurants);
  const toggleRest = useStore((s) => s.toggleFavRestaurant);
  const set = useStore((s) => s.set);

  const menu = menus.find((m) => m.restaurant === name);
  const visits = history.filter((h) => h.restaurant === name);
  const fav = favRest.includes(name);
  const tried = new Set(visits.map((v) => v.itemName));
  const fresh = menu ? recommend(menu.items, taste, dislikes, mood, history, true).ranked.filter((s) => !tried.has(s.item.name) && !s.allergyHits.length).slice(0, 2) : [];

  // "You usually pick X here" — most common kind among past picks.
  const kinds = visits.flatMap((v) => menu?.items.find((i) => i.name === v.itemName)?.kinds ?? []);
  const usual = kinds.sort((a, b) => kinds.filter((k) => k === b).length - kinds.filter((k) => k === a).length)[0];

  const useMenu = () => menu && set({ currentMenuId: menu.id });

  return (
    <Screen
      top={
        <TopBar
          right={
            <Row gap={6}>
              <IconBtn n="heart" fill filled={fav} color={c.primary} size={22} label={fav ? 'Remove restaurant from favorites' : 'Add restaurant to favorites'} onPress={() => toggleRest(name)} />
              <IconBtn n="camera" fill size={22} label="Rescan menu" onPress={() => router.push('/camera')} />
            </Row>
          }
        />
      }
      foot={
        menu ? (
          <Btn
            title="Pick for me"
            onPress={() => {
              useMenu();
              router.push('/mood');
            }}
          />
        ) : undefined
      }
    >
      <View style={{ gap: 4 }}>
        <H1>{name}</H1>
        <S>{visits.length ? `${visits.length} ${visits.length === 1 ? 'visit' : 'visits'} · Last: ${shortDate(visits[0].date).toLowerCase()}` : 'No picks here yet'}</S>
      </View>
      {usual ? <Banner icon="sparkle">You usually pick {usual.toLowerCase()} here.</Banner> : null}
      {visits.length ? (
        <View style={{ gap: 10 }}>
          <H3>Your recents</H3>
          {visits.map((v) => {
            const canPick = menus.some((m) => m.id === v.menuId);
            return (
              <Card key={v.id} style={{ padding: 14, gap: 12 }}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <Photo h={48} w={48} r={12} />
                  <View style={{ flex: 1 }}>
                    <T b>{v.itemName}</T>
                    <XS>
                      {shortDate(v.date)} · {peso(v.price)}
                    </XS>
                  </View>
                  <Icon n={v.rating === -1 ? 'thumbdown' : 'thumbup'} s={20} fill={v.rating !== 0} color={v.rating === 1 ? c.green : v.rating === -1 ? c.warn : c.muted} />
                </Row>
                {canPick ? (
                  <Btn
                    kind="soft"
                    sm
                    grow
                    title="Pick again"
                    onPress={() => {
                      set({ currentMenuId: v.menuId });
                      router.push({ pathname: '/picked', params: { id: v.itemId, extras: '' } });
                    }}
                  />
                ) : null}
              </Card>
            );
          })}
        </View>
      ) : null}
      {fresh.length ? (
        <View style={{ gap: 10 }}>
          <H3>Try something new</H3>
          {fresh.map((s) => (
            <Card
              key={s.item.id}
              style={{ padding: 10 }}
              onPress={() => {
                useMenu();
                router.push({ pathname: '/item/[id]', params: { id: s.item.id } });
              }}
            >
              <Row>
                <Photo h={56} w={56} r={14} icon={s.item.isDrink ? 'cup' : 'utensils'} />
                <View style={{ flex: 1 }}>
                  <T b>{s.item.name}</T>
                  <XS>{peso(s.item.price)} · Not tried yet</XS>
                </View>
                <Pill kind="g" label={`${s.match}%`} />
              </Row>
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
