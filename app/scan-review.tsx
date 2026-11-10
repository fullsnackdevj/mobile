import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../src/components/Icon';
import { ItemEditor } from '../src/components/ItemEditor';
import { Banner, Btn, Card, Field, H3, IconBtn, ListRow, Row, Screen, T, TopBar, XS } from '../src/components/ui';
import { useCurrentMenu, useStore } from '../src/store';
import { fonts, useTheme } from '../src/theme';
import type { MenuItem } from '../src/types';
import { money } from '../src/money';
import { CurrencyNote } from '../src/components/CurrencyNote';

export default function ScanReview() {
  const c = useTheme();
  const menu = useCurrentMenu();
  const updateMenu = useStore((s) => s.updateMenu);
  const [name, setName] = useState(menu?.restaurant ?? '');
  const [tr, setTr] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => setName(menu?.restaurant ?? ''), [menu?.id]);
  if (!menu) return null;

  const groups: { name: string; items: MenuItem[] }[] = [];
  menu.items.forEach((i) => {
    let g = groups.find((x) => x.name === i.category);
    if (!g) groups.push((g = { name: i.category, items: [] }));
    g.items.push(i);
  });
  const translated = menu.items.filter((i) => i.originalName && i.translatedName && i.originalName !== i.translatedName);
  const lowCount = menu.items.filter((i) => i.lowConfidence).length;

  const toggleBtn = (on: boolean, label: string, icon: 'heart' | 'globe', onPress: () => void) => (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{ flex: 1, minHeight: 56, borderRadius: 18, borderWidth: 2, borderColor: on ? c.primary : c.line, backgroundColor: on ? c.tint : c.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
    >
      <Icon n={icon} s={20} color={on ? c.tintInk : c.ink} fill={icon === 'heart' && on} />
      <Text style={{ fontFamily: fonts.head, fontSize: 16, color: on ? c.tintInk : c.ink }}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen
      top={
        <TopBar
          title="Check the menu"
          onBack={() => router.replace('/(tabs)')}
          right={<IconBtn n="flag" size={22} label="Report incorrect info" onPress={() => router.push({ pathname: '/report', params: { restaurant: menu.restaurant } })} />}
        />
      }
      gap={14}
      foot={
        <>
          <Btn title="Continue" disabled={!menu.items.length} onPress={() => router.push('/mood')} />
          <Btn kind="txt" title="Re-scan" onPress={() => router.push('/camera')} />
        </>
      }
    >
      {menu.demo ? (
        <Banner kind="w" icon="info">
          Demo menu: the server has no OpenAI key yet, so this is sample data.
        </Banner>
      ) : null}
      <Field
        icon="utensils"
        value={name}
        onChangeText={setName}
        onEndEditing={() => updateMenu(menu.id, { restaurant: name.trim() || 'Untitled menu' })}
        accessibilityLabel="Restaurant name"
        placeholder="Restaurant name"
        right={<Icon n="edit" s={18} color={c.muted} />}
        style={{ minHeight: 52 }}
      />
      <Row gap={10}>
        {toggleBtn(menu.saved, 'Save', 'heart', () => updateMenu(menu.id, { saved: !menu.saved }))}
        {toggleBtn(tr, 'Translate', 'globe', () => setTr(!tr))}
      </Row>
      {tr ? (
        translated.length ? (
          <Card style={{ overflow: 'hidden' }}>
            {translated.map((i, k) => (
              <Row key={i.id} gap={0} style={{ borderBottomWidth: k === translated.length - 1 ? 0 : 1, borderBottomColor: c.line }}>
                <View style={{ flex: 1, padding: 12, borderRightWidth: 1, borderRightColor: c.line }}>
                  {k === 0 ? <XS b>Original</XS> : null}
                  <T b style={{ marginTop: 4 }}>
                    {i.originalName}
                  </T>
                </View>
                <View style={{ flex: 1, padding: 12 }}>
                  {k === 0 ? <XS b>Translated</XS> : null}
                  <T b style={{ marginTop: 4 }}>
                    {i.translatedName}
                  </T>
                </View>
              </Row>
            ))}
          </Card>
        ) : (
          <Banner icon="globe">This menu is already in English.</Banner>
        )
      ) : null}
      <CurrencyNote menuId={menu.id} />
      <Banner icon="info">
        {menu.items.length
          ? `Found ${menu.items.length} items.${lowCount ? ' Please check anything with a warning.' : ' Tap any item to fix it.'}`
          : 'No items yet. Add what you see on the menu.'}
      </Banner>
      {groups.map((g) => (
        <View key={g.name} style={{ gap: 8 }}>
          <H3>{g.name}</H3>
          <Card>
            {g.items.map((it, k) => (
              <ListRow key={it.id} last={k === g.items.length - 1} onPress={() => setEditing(it)}>
                {it.lowConfidence ? (
                  <View accessibilityLabel="Low confidence">
                    <Icon n="warn" s={20} color={c.warn} />
                  </View>
                ) : null}
                <T b style={{ flex: 1 }}>
                  {it.name}
                </T>
                <T b>{money(it.price, menu)}</T>
                <Icon n="edit" s={18} color={c.muted} />
              </ListRow>
            ))}
          </Card>
        </View>
      ))}
      <Btn kind="soft" sm icon="plus" title="Add missing item" onPress={() => setAdding(true)} />
      <ItemEditor
        menuId={menu.id}
        item={editing}
        visible={!!editing || adding}
        onClose={() => {
          setEditing(null);
          setAdding(false);
        }}
      />
    </Screen>
  );
}
