import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { Btn, Card, Chip, Empty, IconBtn, Label, Photo, Row, S, Screen, T, TopBar } from '../../src/components/ui';
import { shortDate, useStore } from '../../src/store';
import { useTheme } from '../../src/theme';
import type { HistoryEntry } from '../../src/types';
import { money } from '../../src/money';

const FILTERS = ['All', 'Liked', 'Disliked', 'Not rated'] as const;

export default function History() {
  const c = useTheme();
  const history = useStore((s) => s.history);
  const saved = useStore((s) => s.savedOrders);
  const menus = useStore((s) => s.menus);
  const del = useStore((s) => s.deleteHistory);
  const delOrder = useStore((s) => s.deleteSavedOrder);
  const set = useStore((s) => s.set);
  const [f, setF] = useState<(typeof FILTERS)[number]>('All');

  const rows = history.filter((h) => f === 'All' || (f === 'Liked' && h.rating === 1) || (f === 'Disliked' && h.rating === -1) || (f === 'Not rated' && h.rating === 0));
  const groups: { date: string; rows: HistoryEntry[] }[] = [];
  rows.forEach((r) => {
    const d = shortDate(r.date);
    let g = groups.find((x) => x.date === d);
    if (!g) groups.push((g = { date: d, rows: [] }));
    g.rows.push(r);
  });

  function pickAgain(h: HistoryEntry) {
    if (!menus.some((m) => m.id === h.menuId)) return;
    set({ currentMenuId: h.menuId });
    router.push({ pathname: '/picked', params: { id: h.itemId, extras: '' } });
  }

  return (
    <Screen edgesBottom={false} top={<TopBar back={false} big title="History" />} gap={14}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
        {FILTERS.map((x) => (
          <Chip key={x} label={x} on={f === x} onPress={() => setF(x)} />
        ))}
      </ScrollView>

      {saved.length > 0 && f === 'All' ? (
        <View style={{ gap: 10 }}>
          <Label style={{ marginBottom: 0, color: c.muted }}>Order lists</Label>
          {saved.map((o) => {
            const total = o.items.reduce((a, x) => a + (x.price ?? 0) * x.qty, 0);
            const n = o.items.reduce((a, x) => a + x.qty, 0);
            return (
              <Card key={o.id} style={{ padding: 14, gap: 12 }}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <T b>{o.shop}</T>
                    <S>
                      {shortDate(o.date)} · {o.people.length} {o.people.length === 1 ? 'person' : 'people'} · {n} items
                    </S>
                  </View>
                  <T b>{money(total, o)}</T>
                </Row>
                <Row gap={8}>
                  <Btn kind="soft" sm grow title="Open" onPress={() => router.push({ pathname: '/saved-order/[id]', params: { id: o.id } })} />
                  <IconBtn n="trash" size={18} fill label="Delete order list" onPress={() => delOrder(o.id)} />
                </Row>
              </Card>
            );
          })}
        </View>
      ) : null}

      {groups.map((g) => (
        <View key={g.date} style={{ gap: 10 }}>
          <Label style={{ marginBottom: 0, color: c.muted }}>{g.date}</Label>
          {g.rows.map((r) => {
            const col = r.rating === 1 ? c.green : r.rating === -1 ? c.warn : c.muted;
            const canPick = menus.some((m) => m.id === r.menuId);
            return (
              <Card key={r.id} style={{ padding: 14, gap: 12 }}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <Photo h={48} w={48} r={12} />
                  <View style={{ flex: 1 }}>
                    <T b>{r.restaurant}</T>
                    <S>{[r.itemName, ...r.extras].join(', ')}</S>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <T b>{money(r.price, menus.find((m) => m.id === r.menuId))}</T>
                    <View accessibilityLabel={r.rating === 1 ? 'Liked' : r.rating === -1 ? 'Disliked' : 'Not rated'}>
                      <Icon n={r.rating === -1 ? 'thumbdown' : 'thumbup'} s={20} color={col} fill={r.rating !== 0} />
                    </View>
                  </View>
                </Row>
                <Row gap={8}>
                  {canPick ? <Btn kind="soft" sm grow title="Pick Again" onPress={() => pickAgain(r)} /> : null}
                  <Btn kind="sec" sm grow title="Rate" onPress={() => router.push({ pathname: '/rate/[id]', params: { id: r.id } })} />
                  <IconBtn n="trash" size={18} fill label="Delete entry" onPress={() => del(r.id)} />
                </Row>
              </Card>
            );
          })}
        </View>
      ))}

      {!rows.length && !(saved.length && f === 'All') ? (
        <Empty text={f === 'All' ? 'Nothing here yet. Scan a menu and your picks will show up.' : 'No picks match this filter.'} cta={f === 'All' ? 'Scan a menu' : undefined} onCta={() => router.push('/camera')} />
      ) : null}
    </Screen>
  );
}
