import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { blankItem } from '../scan';
import { useStore } from '../store';
import type { MenuItem } from '../types';
import { Btn, Field, H2, IconBtn, Label, Row, Sheet } from './ui';

/** Sheet for fixing or adding a menu item on the scan review screen. */
export function ItemEditor({ menuId, item, onClose, visible }: { menuId: string; item: MenuItem | null; visible: boolean; onClose: () => void }) {
  const updateItem = useStore((s) => s.updateItem);
  const addItem = useStore((s) => s.addItem);
  const updateMenu = useStore((s) => s.updateMenu);
  const menus = useStore((s) => s.menus);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cat, setCat] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(item?.name ?? '');
    setPrice(item?.price != null ? String(item.price) : '');
    setCat(item?.category ?? 'Other');
  }, [visible, item]);

  const p = price.trim() === '' ? null : Number(price.replace(/[^\d.]/g, ''));
  function save() {
    if (!name.trim()) return;
    const patch = { name: name.trim(), price: p != null && !isNaN(p) ? p : null, category: cat.trim() || 'Other', lowConfidence: false };
    if (item) updateItem(menuId, item.id, { ...patch, translatedName: item.translatedName === item.name ? patch.name : item.translatedName });
    else addItem(menuId, { ...blankItem(patch.name, patch.price, patch.category), lowConfidence: false });
    onClose();
  }
  function remove() {
    const m = menus.find((x) => x.id === menuId);
    if (m && item) updateMenu(menuId, { items: m.items.filter((i) => i.id !== item.id) });
    onClose();
  }

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Row style={{ justifyContent: 'space-between' }}>
        <H2>{item ? 'Fix this item' : 'Add missing item'}</H2>
        <IconBtn n="close" size={22} label="Close" onPress={onClose} />
      </Row>
      <View>
        <Label>Name</Label>
        <Field value={name} onChangeText={setName} placeholder="Chicken Inasal" autoFocus={!item} />
      </View>
      <Row>
        <View style={{ flex: 1 }}>
          <Label>Price (₱)</Label>
          <Field value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="149" />
        </View>
        <View style={{ flex: 1 }}>
          <Label>Section</Label>
          <Field value={cat} onChangeText={setCat} placeholder="Mains" />
        </View>
      </Row>
      <Btn title="Save" disabled={!name.trim()} onPress={save} />
      {item ? <Btn kind="txt" title="Remove item" onPress={remove} /> : null}
    </Sheet>
  );
}
