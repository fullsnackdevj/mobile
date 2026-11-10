import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { Banner, Btn, Card, H1, H2, H3, IconBtn, ListRow, Photo, Pill, Row, S, Screen, T, XS } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';
import { usePicks } from '../../src/usePicks';
import { Price } from '../../src/components/Price';

const SPICE = ['No spice', 'Mild spice', 'Medium spice', 'Hot'];

export default function ItemDetail() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { menu, scoreOf } = usePicks();
  const favorites = useStore((s) => s.favorites);
  const toggleFav = useStore((s) => s.toggleFav);
  const energy = useStore((s) => s.settings.energy);
  const history = useStore((s) => s.history);
  const [ing, setIng] = useState(false);
  const item = menu?.items.find((i) => i.id === id);
  if (!menu || !item) return null;
  const s = scoreOf(item.id);
  const key = `${menu.id}:${item.id}`;
  const fav = favorites.some((f) => f.key === key);
  const past = history.filter((h) => h.itemName === item.name && h.rating !== 0);
  const liked = past.filter((h) => h.rating === 1).length;
  const n = item.nutrition;

  function pick() {
    if (s?.allergyHits.length) router.push({ pathname: '/allergen', params: { id: item!.id, extras: '' } });
    else router.push({ pathname: '/picked', params: { id: item!.id, extras: '' } });
  }

  return (
    <Screen
      top={
        <Row gap={6} style={{ height: 60, paddingHorizontal: 10 }}>
          <IconBtn n="back" fill label="Back" onPress={() => router.back()} />
          <View style={{ flex: 1 }} />
          <IconBtn
            n="heart"
            fill
            filled={fav}
            size={22}
            color={c.primary}
            label={fav ? 'Remove from Favorites' : 'Add to Favorites'}
            onPress={() => toggleFav({ key, name: item.name, restaurant: menu.restaurant, price: item.price, menuId: menu.id, itemId: item.id })}
          />
        </Row>
      }
      foot={<Btn title="Pick This" onPress={pick} />}
      footStyle={{ paddingTop: 8 }}
    >
      <Photo h={190} r={24} icon={item.isDrink ? 'cup' : 'utensils'} label={item.category} />
      <View style={{ gap: 4 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <H1 style={{ fontSize: 26, lineHeight: 30, flex: 1 }}>{item.name}</H1>
          <Price n={item.price} p={menu} as={H2} />
        </Row>
        <S>
          {menu.restaurant}
          {item.translatedName !== item.name ? ` · ${item.translatedName}` : ''}
        </S>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {!item.isDrink ? <Pill icon="flame" label={`${SPICE[item.spice] ?? 'Mild spice'} (${item.spice}/3)`} /> : null}
        {s ? <Pill kind="g" label={`${s.match}% match`} /> : null}
        {item.diet.map((d) => (
          <Pill key={d} kind="g" label={d[0].toUpperCase() + d.slice(1)} />
        ))}
        {item.lowConfidence ? <Pill kind="w" icon="warn" label="Check this on the menu" /> : null}
      </View>
      {item.description || item.tastesLike ? (
        <View style={{ gap: 6 }}>
          {item.description ? <T>{item.description}</T> : null}
          {item.tastesLike ? (
            <T b>
              <T b style={{ color: c.primary }}>
                Tastes like:
              </T>{' '}
              {item.tastesLike}
            </T>
          ) : null}
        </View>
      ) : null}
      {past.length ? (
        <Banner kind={liked >= past.length / 2 ? 'g' : 'w'} icon={liked >= past.length / 2 ? 'thumbup' : 'thumbdown'}>
          {liked >= past.length / 2 ? 'You liked this before.' : "You didn't love this last time."}
        </Banner>
      ) : null}
      {n ? (
        <Card style={{ padding: 16, gap: 12 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <H3>Nutrition</H3>
            <Pill label="Estimated values" />
          </Row>
          <Row gap={6}>
            {(
              [
                [energy === 'kJ' ? Math.round(n.kcal * 4.184) : n.kcal, energy],
                [`${n.protein}g`, 'protein'],
                [`${n.carbs}g`, 'carbs'],
                [`${n.fat}g`, 'fat'],
                [n.sodium, 'sodium mg'],
              ] as const
            ).map(([v, l]) => (
              <View key={l} style={{ flex: 1, alignItems: 'center' }}>
                <H3>{v}</H3>
                <XS>{l}</XS>
              </View>
            ))}
          </Row>
        </Card>
      ) : null}
      <Card style={{ padding: 16, gap: 10 }}>
        <H3>Allergens</H3>
        {item.allergens.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {item.allergens.map((a) => (
              <Pill key={a} kind="w" icon="warn" label={a} />
            ))}
          </View>
        ) : (
          <S>None detected.</S>
        )}
        <XS>Not guaranteed. Always confirm with the restaurant.</XS>
      </Card>
      {item.ingredients.length ? (
        <Card style={{ overflow: 'hidden' }}>
          <ListRow last onPress={() => setIng(!ing)} style={{ minHeight: 56 }}>
            <H3 style={{ flex: 1 }}>Ingredients</H3>
            <Icon n="down" s={20} color={c.ink} />
          </ListRow>
          {ing ? (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 6 }}>
              <S>{item.ingredients.join(', ')}.</S>
              <XS>Estimated from a typical recipe unless the menu lists them.</XS>
            </View>
          ) : null}
        </Card>
      ) : null}
      <Btn kind="sec" sm icon="flag" title="Report info" onPress={() => router.push({ pathname: '/report', params: { restaurant: menu.restaurant, item: item.name } })} />
    </Screen>
  );
}
