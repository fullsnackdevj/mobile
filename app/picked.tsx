import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Capy } from '../src/components/Capy';
import { RouteSheet } from '../src/components/RouteSheet';
import { Btn, Card, H2, Row, S, T } from '../src/components/ui';
import { scheduleRating } from '../src/notify';
import { uid, useCurrentMenu, useStore } from '../src/store';
import { moneyWithApprox } from '../src/money';

/** "Great pick!" — records the pick in History and the order list. Pickybara never places orders. */
export default function Picked() {
  const { id, extras } = useLocalSearchParams<{ id: string; extras?: string }>();
  const menu = useCurrentMenu();
  const done = useRef(false);
  const items = menu ? [id, ...(extras ? extras.split(',') : [])].map((x) => menu.items.find((i) => i.id === x)).filter((x) => !!x) : [];

  useEffect(() => {
    if (done.current || !menu || !items.length) return;
    done.current = true;
    const st = useStore.getState();
    const me = st.profile?.name || 'Me';
    st.startOrder(menu.restaurant, menu.id);
    const who = useStore.getState().order.people[0]?.name ?? me;
    items.forEach((i) => {
      if (!useStore.getState().order.items.some((x) => x.who === who && x.name === i.name)) st.bumpOrderItem(who, i.name, i.price, 1, i.id);
    });
    const hid = uid();
    const [main, ...rest] = items;
    st.addHistory({
      id: hid,
      date: Date.now(),
      restaurant: menu.restaurant,
      menuId: menu.id,
      itemId: main.id,
      itemName: main.name,
      price: items.reduce((a, i) => a + (i.price ?? 0), 0),
      extras: rest.map((r) => r.name),
      rating: 0,
      tags: [],
      note: '',
    });
    if (st.settings.ratingReminders) scheduleRating(hid, main.name, menu.restaurant).catch(() => {});
  }, []);

  if (!menu) return null;
  return (
    <RouteSheet>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Capy mood="cheer" size={88} />
        <H2>Great pick!</H2>
        <S>Added to your order list.</S>
      </View>
      <Card flat style={{ padding: 14, gap: 8 }}>
        {items.map((i) => (
          <Row key={i.id} style={{ justifyContent: 'space-between' }}>
            <T b style={{ flex: 1 }}>
              {i.name}
            </T>
            <T b>{moneyWithApprox(i.price, menu)}</T>
          </Row>
        ))}
      </Card>
      <View style={{ gap: 8 }}>
        <Btn
          title="View order list"
          onPress={() => {
            if (router.canDismiss()) router.dismissAll();
            router.navigate('/(tabs)/order');
          }}
        />
        <Btn kind="txt" title="Pick something else" onPress={() => router.back()} />
      </View>
    </RouteSheet>
  );
}
