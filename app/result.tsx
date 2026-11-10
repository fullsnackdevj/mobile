import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Capy } from '../src/components/Capy';
import { Icon } from '../src/components/Icon';
import { Banner, Btn, Card, Empty, H2, IconBtn, Photo, Pill, Row, S, Screen, T, Tile, TopBar, XS } from '../src/components/ui';
import type { Scored } from '../src/recommend';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';
import { usePicks } from '../src/usePicks';
import { Price } from '../src/components/Price';
import { moneyWithApprox } from '../src/money';

// The last top pick shown per menu, so opening the picks again shows something different.
const lastTop: Record<string, string> = {};

export default function Result() {
  const c = useTheme();
  const menuId = useStore((s) => s.currentMenuId);
  const [vary, setVary] = useState(() => ({ seed: Math.random(), avoid: menuId ? lastTop[menuId] : undefined }));
  const { menu, picks, mood } = usePicks(vary);
  const favorites = useStore((s) => s.favorites);
  const toggleFav = useStore((s) => s.toggleFav);
  const [surprise, setSurprise] = useState<Scored | null>(null);

  const shownId = (surprise ?? picks?.top)?.item.id;
  useEffect(() => {
    if (menu && shownId) lastTop[menu.id] = shownId;
  }, [menu?.id, shownId]);

  if (!menu || !picks) return null;
  const top = surprise ?? picks.top;
  if (!top) {
    return (
      <Screen top={<TopBar sub={`${menu.restaurant}${mood.vibes.length ? ' · ' + mood.vibes.join(', ') : ''}`} />}>
        <Empty mood="surprised" text="Nothing on this menu fits your profile and filters." cta="Change mood" onCta={() => router.back()} />
      </Screen>
    );
  }
  const backup = surprise ? picks.top : picks.backup;
  const drink = picks.drink && picks.drink.item.id !== top.item.id ? picks.drink : null;
  const favKey = `${menu.id}:${top.item.id}`;
  const isFav = favorites.some((f) => f.key === favKey);

  const open = (id: string) => router.push({ pathname: '/item/[id]', params: { id } });
  function pickThis() {
    const extras = drink ? drink.item.id : '';
    if (top!.allergyHits.length) router.push({ pathname: '/allergen', params: { id: top!.item.id, extras } });
    else router.push({ pathname: '/picked', params: { id: top!.item.id, extras } });
  }
  function surpriseMe() {
    const pool = picks!.ranked.filter((s) => !s.allergyHits.length && s.item.id !== top!.item.id).slice(0, Math.max(3, Math.ceil(picks!.ranked.length / 2)));
    if (pool.length) setSurprise(pool[Math.floor(Math.random() * pool.length)]);
  }

  const mini = (s: Scored, label: string, kind?: 'g') => (
    <Card onPress={() => open(s.item.id)} style={{ padding: 10 }}>
      <Row>
        <Photo h={56} w={56} r={14} icon={s.item.isDrink ? 'cup' : 'utensils'} />
        <View style={{ flex: 1 }}>
          <Pill kind={kind} label={label} />
          <T b style={{ marginTop: 4 }}>
            {s.item.name}
          </T>
          <XS>
            {moneyWithApprox(s.item.price, menu)} · {s.match}% match
          </XS>
        </View>
        <Icon n="chevron" s={20} color={c.ink} />
      </Row>
    </Card>
  );

  return (
    <Screen
      top={
        <TopBar
          sub={`${menu.restaurant}${mood.vibes.length ? ' · ' + mood.vibes.join(', ') : ''}`}
          right={<IconBtn n="flag" size={22} label="Report incorrect info" onPress={() => router.push({ pathname: '/report', params: { restaurant: menu.restaurant, item: top.item.name } })} />}
        />
      }
      gap={14}
    >
      {top.allergyHits.length ? (
        <Banner kind="w" icon="warn" onPress={() => router.push({ pathname: '/allergen', params: { id: top.item.id, extras: '' } })}>
          This pick may contain {top.allergyHits.join(', ').toLowerCase()}. Tap to review.
        </Banner>
      ) : null}
      {surprise ? (
        <Row>
          <Capy mood="surprised" size={56} />
          <T b style={{ flex: 1 }}>
            Surprise! Something a little different.
          </T>
        </Row>
      ) : null}
      <Card style={{ padding: 12, gap: 12 }}>
        <Card flat onPress={() => open(top.item.id)} style={{ borderWidth: 0, borderRadius: 18, overflow: 'hidden' }}>
          <Photo h={170} r={18} icon={top.item.isDrink ? 'cup' : 'utensils'} label={top.item.category}>
            <Pill kind="p" label={surprise ? 'SURPRISE' : 'TOP PICK'} style={{ position: 'absolute', left: 10, top: 10 }} />
            <Pill label={`${top.match}% match`} style={{ position: 'absolute', right: 10, top: 10, backgroundColor: c.lime }} />
          </Photo>
        </Card>
        <View style={{ gap: 4, paddingHorizontal: 4 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <H2 style={{ flex: 1 }}>{top.item.name}</H2>
            <Price n={top.item.price} p={menu} as={H2} />
          </Row>
          <S>{top.item.description || top.reasons[0] || 'A solid pick from this menu.'}</S>
        </View>
        <Row gap={8}>
          <Btn kind="soft" sm grow title="Why this?" onPress={() => router.push({ pathname: '/why', params: { id: top.item.id } })} style={{ paddingHorizontal: 10 }} />
          <IconBtn
            n="heart"
            fill
            filled={isFav}
            size={22}
            color={c.primary}
            label={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
            onPress={() => toggleFav({ key: favKey, name: top.item.name, restaurant: menu.restaurant, price: top.item.price, menuId: menu.id, itemId: top.item.id })}
          />
          <Btn sm grow title="Pick this" onPress={pickThis} style={{ paddingHorizontal: 10 }} />
        </Row>
      </Card>
      {backup ? mini(backup, surprise ? 'TOP PICK' : 'BACKUP PICK', 'g') : null}
      {drink ? mini(drink, 'DRINK PAIRING') : null}
      <Row gap={10}>
        <Tile icon="layers" label="More" onPress={() => router.push('/ranked')} />
        <Tile
          icon="refresh"
          label="Another"
          onPress={() => {
            setSurprise(null);
            setVary({ seed: Math.random(), avoid: top.item.id });
          }}
        />
        <Tile icon="sparkle" label="Surprise" onPress={surpriseMe} />
        <Tile icon="sliders" label="Mood" onPress={() => router.navigate('/mood')} />
      </Row>
    </Screen>
  );
}
