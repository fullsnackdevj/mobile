import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { Btn, Card, Empty, Field, H2, IconBtn, Photo, Row, Screen, Sheet, T, TopBar, XS } from '../src/components/ui';
import { shortDate, useStore } from '../src/store';

export default function SavedMenus() {
  const all = useStore((s) => s.menus);
  // Filter outside the store selector: a new array from the selector each render makes React loop and crash.
  const menus = useMemo(() => all.filter((m) => m.saved), [all]);
  const set = useStore((s) => s.set);
  const updateMenu = useStore((s) => s.updateMenu);
  const deleteMenu = useStore((s) => s.deleteMenu);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const list = menus.filter((m) => m.restaurant.toLowerCase().includes(q.toLowerCase()));

  function use(id: string) {
    set({ currentMenuId: id });
    router.push({ pathname: '/menu/[id]', params: { id } });
  }

  return (
    <Screen top={<TopBar title="Saved menus" />} gap={14}>
      <Field icon="search" placeholder="Search restaurants" value={q} onChangeText={setQ} />
      {list.length ? (
        <View style={{ gap: 12 }}>
          {list.map((m) => (
            <Card key={m.id} style={{ padding: 12, gap: 12 }}>
              <Row>
                <Row style={{ flex: 1 }}>
                  <Card flat onPress={() => use(m.id)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0, minHeight: 56, backgroundColor: 'transparent' }}>
                    <Photo h={56} w={56} r={16} />
                    <View style={{ flex: 1 }}>
                      <T b>{m.restaurant}</T>
                      <XS>
                        Scanned {shortDate(m.createdAt).toLowerCase() === 'today' ? 'today' : shortDate(m.createdAt)} · {m.items.length} items
                      </XS>
                    </View>
                  </Card>
                </Row>
                <IconBtn n="dots" size={26} label={`More actions for ${m.restaurant}`} onPress={() => setOpen(open === m.id ? null : m.id)} />
              </Row>
              {open === m.id ? (
                <Row gap={10}>
                  <Btn sm grow icon="edit" title="Rename" onPress={() => setRenaming({ id: m.id, name: m.restaurant })} />
                  <Btn
                    sm
                    grow
                    kind="dark"
                    icon="trash"
                    title="Delete"
                    onPress={() =>
                      Alert.alert('Delete this menu?', m.restaurant, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteMenu(m.id) },
                      ])
                    }
                  />
                </Row>
              ) : null}
            </Card>
          ))}
        </View>
      ) : (
        <Empty text={q ? 'No menus match that search.' : 'No saved menus yet. Scan one to get started.'} cta="Scan a menu" onCta={() => router.push('/camera')} />
      )}
      <Sheet visible={!!renaming} onClose={() => setRenaming(null)}>
        <H2>Rename menu</H2>
        <Field value={renaming?.name ?? ''} onChangeText={(name) => renaming && setRenaming({ ...renaming, name })} autoFocus />
        <Btn
          title="Save"
          onPress={() => {
            if (renaming?.name.trim()) updateMenu(renaming.id, { restaurant: renaming.name.trim() });
            setRenaming(null);
            setOpen(null);
          }}
        />
      </Sheet>
    </Screen>
  );
}
