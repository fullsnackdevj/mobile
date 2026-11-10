import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { DeleteSpotSheet } from '../../src/components/DeleteSpotSheet';
import { Icon } from '../../src/components/Icon';
import { SpotEditor } from '../../src/components/SpotEditor';
import { SpotImage } from '../../src/components/SpotImage';
import { Banner, Btn, Card, H1, H3, IconBtn, ListRow, Photo, Pill, Row, S, Screen, T, TopBar, XS } from '../../src/components/ui';
import { money, moneyWithApprox } from '../../src/money';
import { recommend } from '../../src/recommend';
import { deleteSpotPhoto, mapsUrl, pickSpotPhoto } from '../../src/spots';
import { inlineDate, shortDate, useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

/** A spot: its photo, location and notes, its latest menu, and your history there. */
export default function SpotPage() {
  const c = useTheme();
  const params = useLocalSearchParams<{ name: string }>();
  const [name, setName] = useState(params.name);
  const menus = useStore((s) => s.menus);
  const history = useStore((s) => s.history);
  const places = useStore((s) => s.places);
  const taste = useStore((s) => s.taste);
  const dislikes = useStore((s) => s.dislikes);
  const mood = useStore((s) => s.mood);
  const favRest = useStore((s) => s.favRestaurants);
  const toggleRest = useStore((s) => s.toggleFavRestaurant);
  const savePlace = useStore((s) => s.savePlace);
  const set = useStore((s) => s.set);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoErr, setPhotoErr] = useState('');

  const place = places.find((p) => p.name.toLowerCase() === name.toLowerCase());
  const menu = menus.find((m) => m.restaurant === name);
  const visits = history.filter((h) => h.restaurant === name);
  const fav = favRest.includes(name);
  const tried = new Set(visits.map((v) => v.itemName));
  const fresh = menu ? recommend(menu.items, taste, dislikes, mood, history, true, menu).ranked.filter((s) => !tried.has(s.item.name) && !s.allergyHits.length).slice(0, 2) : [];

  // "You usually pick X here" — most common kind among past picks.
  const kinds = visits.flatMap((v) => menu?.items.find((i) => i.name === v.itemName)?.kinds ?? []);
  const usual = kinds.sort((a, b) => kinds.filter((k) => k === b).length - kinds.filter((k) => k === a).length)[0];

  const useMenu = () => menu && set({ currentMenuId: menu.id });
  const scan = () => router.push({ pathname: '/camera', params: { spot: name } });

  async function photo(source: 'camera' | 'library') {
    setPhotoErr('');
    try {
      const uri = await pickSpotPhoto(source);
      if (!uri) return;
      deleteSpotPhoto(place?.photo);
      savePlace(name, { photo: uri, photoFocus: undefined });
      router.push({ pathname: '/spot-photo', params: { name } }); // frame it right away
    } catch (e: any) {
      setPhotoErr(e?.message || "Couldn't add the photo.");
    }
  }
  const askPhoto = () =>
    Alert.alert(place?.photo ? 'Change photo' : 'Add a photo', undefined, [
      { text: 'Take photo', onPress: () => photo('camera') },
      { text: 'Choose from library', onPress: () => photo('library') },
      ...(place?.photo
        ? [
            { text: 'Adjust photo', onPress: () => router.push({ pathname: '/spot-photo', params: { name } }) },
            {
              text: 'Remove photo',
              style: 'destructive' as const,
              onPress: () => {
                deleteSpotPhoto(place.photo);
                savePlace(name, { photo: undefined, photoFocus: undefined });
              },
            },
          ]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);

  const hasLocation = !!(place?.address || place?.lat != null);
  const preview = menu ? menu.items.slice(0, 3) : [];

  return (
    <Screen
      top={
        <TopBar
          right={
            <Row gap={6}>
              <IconBtn n="heart" fill filled={fav} color={c.primary} size={22} label={fav ? 'Remove spot from favorites' : 'Add spot to favorites'} onPress={() => toggleRest(name)} />
              <IconBtn n="edit" fill size={22} label="Edit spot" onPress={() => setEditing(true)} />
            </Row>
          }
        />
      }
      foot={
        menu ? (
          <Row gap={8}>
            <Btn kind="sec" grow title="Full menu" onPress={() => router.push({ pathname: '/menu/[id]', params: { id: menu.id } })} />
            <Btn
              grow
              title="Pick for me"
              onPress={() => {
                // Straight to the 3 picks using your current vibe; change it there with "Mood".
                useMenu();
                router.push('/result');
              }}
            />
          </Row>
        ) : (
          <Btn icon="camera" title="Scan the menu" onPress={scan} />
        )
      }
    >
      {/* Photo of the place */}
      <Pressable accessibilityRole="button" accessibilityLabel={place?.photo ? 'Change spot photo' : 'Add a photo of this spot'} onPress={askPhoto}>
        {place?.photo ? (
          <View>
            <SpotImage uri={place.photo} focus={place.photoFocus} h={190} r={24} />
            <View style={{ position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)' }}>
              <Icon n="camera" s={16} color="#fff" />
              <XS style={{ color: '#fff' }}>Change</XS>
            </View>
          </View>
        ) : (
          <Photo h={150} r={24} icon="camera" label="Add a photo of this spot" />
        )}
      </Pressable>
      {photoErr ? <XS style={{ color: c.warn }}>{photoErr}</XS> : null}

      <View style={{ gap: 4 }}>
        <H1>{name}</H1>
        <S>{visits.length ? `${visits.length} ${visits.length === 1 ? 'visit' : 'visits'} · Last: ${inlineDate(visits[0].date)}` : 'No picks here yet'}</S>
      </View>

      {/* Location and notes */}
      <Card>
        <ListRow last={!place?.notes} onPress={hasLocation ? () => Linking.openURL(mapsUrl({ ...place, name })) : () => setEditing(true)}>
          <Icon n="map" s={22} color={c.primary} />
          <View style={{ flex: 1 }}>
            <T b>{hasLocation ? place?.address || 'Pinned on the map' : 'Add location'}</T>
            <XS>{hasLocation ? 'Open in Maps' : 'Type the address or use your location'}</XS>
          </View>
          <Icon n={hasLocation ? 'nav' : 'plus'} s={20} color={c.muted} />
        </ListRow>
        {place?.notes ? (
          <ListRow last onPress={() => setEditing(true)} style={{ alignItems: 'flex-start' }}>
            <Icon n="edit" s={20} color={c.primary} />
            <S style={{ flex: 1, color: c.ink }}>{place.notes}</S>
          </ListRow>
        ) : null}
      </Card>

      {/* Menu */}
      <View style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H3>Menu</H3>
          {menu ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Rescan menu" onPress={scan} hitSlop={8}>
              <S b style={{ color: c.primary, textDecorationLine: 'underline' }}>
                Rescan
              </S>
            </Pressable>
          ) : null}
        </Row>
        {menu ? (
          <Card onPress={() => router.push({ pathname: '/menu/[id]', params: { id: menu.id } })}>
            {preview.map((it) => (
              <ListRow key={it.id}>
                <T style={{ flex: 1 }} numberOfLines={1}>
                  {it.name}
                </T>
                <S b style={{ color: c.ink }}>
                  {money(it.price, menu)}
                </S>
              </ListRow>
            ))}
            <ListRow last>
              <S b style={{ flex: 1, color: c.primary }}>
                {menu.items.length === 1 ? "See the 1 item" : `See all ${menu.items.length} items`}
              </S>
              <XS>Scanned {inlineDate(menu.createdAt)}</XS>
              <Icon n="chevron" s={18} color={c.muted} />
            </ListRow>
          </Card>
        ) : (
          <Banner icon="camera" onPress={scan}>
            No menu yet. Scan it when you're there and Pickybara can pick for you.
          </Banner>
        )}
      </View>

      {usual ? <Banner icon="sparkle">You usually pick {usual.toLowerCase()} here.</Banner> : null}

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
                  <XS>{moneyWithApprox(s.item.price, menu)} · Not tried yet</XS>
                </View>
                <Pill kind="g" label={`${s.match}%`} />
              </Row>
            </Card>
          ))}
        </View>
      ) : null}

      {visits.length ? (
        <View style={{ gap: 10 }}>
          <H3>Your visits</H3>
          {visits.map((v) => {
            const canPick = menus.some((m) => m.id === v.menuId);
            return (
              <Card key={v.id} style={{ padding: 14, gap: 12 }}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <T b>{v.itemName}</T>
                    <XS>
                      {shortDate(v.date)} · {money(v.price, menus.find((m) => m.id === v.menuId) ?? menu)}
                    </XS>
                    {v.note ? <XS>"{v.note}"</XS> : null}
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

      <Btn kind="txt" icon="trash" color={c.warn} title="Delete spot" onPress={() => setDeleting(true)} />

      <DeleteSpotSheet name={name} visible={deleting} onClose={() => setDeleting(false)} onDeleted={() => (router.canGoBack() ? router.back() : router.replace('/spots'))} />
      <SpotEditor visible={editing} name={name} onClose={() => setEditing(false)} onSaved={(n) => n !== name && (setName(n), router.setParams({ name: n }))} />
    </Screen>
  );
}
