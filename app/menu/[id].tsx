import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { Btn, Card, Empty, Field, IconBtn, Label, ListRow, Row, S, Screen, T, TopBar, XS } from '../../src/components/ui';
import { moneyWithApprox } from '../../src/money';
import { inlineDate, useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

/** The whole saved menu, grouped by section, with "Pick for me" and "Start an order". */
export default function MenuScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const menu = useStore((s) => s.menus.find((m) => m.id === id));
  const order = useStore((s) => s.order);
  const set = useStore((s) => s.set);
  const startOrder = useStore((s) => s.startOrder);
  const [q, setQ] = useState('');

  if (!menu) {
    return (
      <Screen top={<TopBar />}>
        <Empty text="This menu was deleted." cta="Scan a menu" onCta={() => router.push('/camera')} />
      </Screen>
    );
  }

  // Search matches the name, the original/translated name, the description and the section.
  const term = q.trim().toLowerCase();
  const shown = term ? menu.items.filter((i) => [i.name, i.originalName, i.translatedName, i.description, i.category].some((t) => t?.toLowerCase().includes(term))) : menu.items;
  const cats = Array.from(new Set(shown.map((i) => i.category || 'Other')));
  const use = () => set({ currentMenuId: menu.id });

  function newOrder() {
    const go = () => {
      // Keeps the list if it's already for this menu, otherwise starts a fresh one.
      startOrder(menu!.restaurant, menu!.id);
      use();
      router.push('/add-items');
    };
    const other = order.items.length && order.menuId !== menu!.id;
    if (other) {
      Alert.alert('Start a new order list?', `Your current list for ${order.restaurant} will be cleared.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start new', style: 'destructive', onPress: go },
      ]);
    } else go();
  }

  return (
    <Screen
      top={
        <>
          <TopBar
            title={menu.restaurant}
            sub={`Scanned ${inlineDate(menu.createdAt)} · ${menu.items.length} items${menu.currency && menu.currency !== 'PHP' ? ` · ${menu.currency}` : ''}`}
            right={
              <IconBtn
                n="edit"
                size={22}
                label="Edit menu"
                onPress={() => {
                  use();
                  router.push('/scan-review');
                }}
              />
            }
          />
          {menu.items.length > 5 ? (
            <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
              <Field icon="search" placeholder={`Search ${menu.items.length} items`} value={q} onChangeText={setQ} returnKeyType="search" />
            </View>
          ) : null}
        </>
      }
      gap={16}
      footStyle={{ borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.card }}
      foot={
        <Row gap={8}>
          <Btn kind="sec" grow title={order.menuId === menu.id && order.items.length ? 'Continue order' : 'Start order'} onPress={newOrder} />
          <Btn
            grow
            title="Pick for me"
            onPress={() => {
              use();
              router.push('/result');
            }}
          />
        </Row>
      }
    >
      {term && !shown.length ? <S style={{ textAlign: 'center', paddingVertical: 24 }}>Nothing matches "{q.trim()}".</S> : null}
      {menu.items.length ? (
        cats.map((cat) => {
          const items = shown.filter((i) => (i.category || 'Other') === cat);
          return (
            <View key={cat} style={{ gap: 8 }}>
              <Label style={{ marginBottom: 0 }}>{cat}</Label>
              <Card>
                {items.map((it, k) => (
                  <ListRow
                    key={it.id}
                    last={k === items.length - 1}
                    onPress={() => {
                      use();
                      router.push({ pathname: '/item/[id]', params: { id: it.id } });
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <T b>{it.name}</T>
                      {it.description ? <XS numberOfLines={1}>{it.description}</XS> : it.translatedName && it.translatedName !== it.name ? <XS numberOfLines={1}>{it.translatedName}</XS> : null}
                    </View>
                    <S b style={{ color: c.ink }}>
                      {moneyWithApprox(it.price, menu)}
                    </S>
                    <Icon n="chevron" s={18} color={c.muted} />
                  </ListRow>
                ))}
              </Card>
            </View>
          );
        })
      ) : (
        <Empty text="No items on this menu yet." cta="Add items" onCta={() => (use(), router.push('/scan-review'))} />
      )}
    </Screen>
  );
}
