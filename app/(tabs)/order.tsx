import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { Banner, Btn, Card, Empty, H2, H3, IconBtn, ListRow, Row, Screen, Sheet, Switch, T, TopBar, XS } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { fonts, personColors, useTheme } from '../../src/theme';
import { TABLE } from '../../src/types';
import { Price } from '../../src/components/Price';
import { money } from '../../src/money';

export default function OrderList() {
  const c = useTheme();
  const order = useStore((s) => s.order);
  const setOrder = useStore((s) => s.setOrder);
  const changeQty = useStore((s) => s.changeQty);
  const save = useStore((s) => s.saveOrderSnapshot);
  const clearOrder = useStore((s) => s.clearOrder);
  const removePerson = useStore((s) => s.removePerson);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: 'person'; name: string } | { kind: 'reset' } | null>(null);
  // Hide the "Saved" note once a new list is started.
  useEffect(() => {
    if (order.items.length) setSaved(false);
  }, [order.items.length]);

  const names = [...order.people.map((p) => p.name), TABLE];
  const total = order.items.reduce((a, x) => a + (x.price ?? 0) * x.qty, 0);
  const count = order.items.reduce((a, x) => a + x.qty, 0);
  const hasLow = order.items.some((x) => x.price == null);

  if (!order.restaurant) {
    return (
      <Screen edgesBottom={false} top={<TopBar back={false} title="Order list" />}>
        {saved ? (
          <Banner kind="g" icon="check" onPress={() => router.navigate('/(tabs)/history')}>
            Saved to History. Tap to see it.
          </Banner>
        ) : null}
        <Empty text="Pick something from a menu and it lands here." cta="Scan a menu" onCta={() => router.push('/camera')} />
      </Screen>
    );
  }

  return (
    <Screen
      edgesBottom={false}
      top={
        <TopBar
          back={false}
          title="Order list"
          sub={order.restaurant}
          right={
            <Btn
              kind="soft"
              sm
              icon="check"
              title="Save"
              disabled={!count}
              onPress={() => {
                save();
                clearOrder(); // saved lists start fresh, so the same order can't be saved twice
                setSaved(true);
              }}
            />
          }
        />
      }
      gap={14}
      footStyle={{ borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.card }}
      foot={
        <>
          <Row style={{ justifyContent: 'space-between', paddingBottom: 6 }}>
            <T b>{count} items</T>
            {order.price ? <Price n={total} p={order} as={H2} /> : null}
          </Row>
          {order.price ? (
            <XS style={{ marginTop: -6, paddingBottom: 4 }}>
              Estimate. Service charge not included.{hasLow ? ' Some prices need a check.' : ''}
            </XS>
          ) : null}
          <Btn title="Show to cashier" disabled={!count} onPress={() => router.push('/cashier')} />
        </>
      }
    >
      {saved ? (
        <Banner kind="g" icon="check" onPress={() => router.navigate('/(tabs)/history')}>
          Saved to History
        </Banner>
      ) : null}
      <Card flat>
        <ListRow last>
          <T b style={{ flex: 1 }}>
            Show prices
          </T>
          <Switch label="Show prices" on={order.price} onPress={() => setOrder({ price: !order.price })} />
        </ListRow>
      </Card>

      {names.map((name, i) => {
        const isTable = name === TABLE;
        const [bg, fg] = isTable ? [c.tint, c.tintInk] : personColors(c, i);
        const items = order.items.filter((x) => x.who === name);
        const sub = items.reduce((a, x) => a + (x.price ?? 0) * x.qty, 0);
        return (
          <Card key={name} style={{ padding: 12, gap: 10 }}>
            <Row gap={10}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                {isTable ? <Icon n="users" s={18} color={fg} /> : <Text style={{ fontFamily: fonts.headBold, color: fg, fontSize: 16 }}>{name[0].toUpperCase()}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <H3>{isTable ? 'For Sharing' : name}</H3>
                {isTable ? <XS>Shared by everyone</XS> : null}
              </View>
              {order.price ? <T b>{money(sub, order)}</T> : null}
              {/* Added people can be taken off; the first person is you. */}
              {!isTable && i > 0 ? (
                <IconBtn n="close" size={20} label={`Remove ${name}`} onPress={() => (items.length ? setConfirm({ kind: 'person', name }) : removePerson(name))} />
              ) : null}
            </Row>
            {items.map((it) => (
              <Row key={it.id} gap={8} style={{ borderTopWidth: 1, borderTopColor: c.line, paddingTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <T b>{it.name}</T>
                  {it.note ? <XS>{it.note}</XS> : null}
                  {order.price ? <XS>{it.price == null ? 'Check price' : `${money(it.price, order)} each`}</XS> : null}
                </View>
                <Row gap={0}>
                  <IconBtn n={it.qty === 1 ? 'trash' : 'minus'} size={20} label={`Fewer ${it.name}`} onPress={() => changeQty(it.id, -1)} />
                  <T b style={{ minWidth: 22, textAlign: 'center' }}>
                    {it.qty}
                  </T>
                  <IconBtn n="plus" size={20} label={`More ${it.name}`} onPress={() => changeQty(it.id, 1)} />
                </Row>
              </Row>
            ))}
            <Btn kind="soft" sm icon="plus" title="Add item" onPress={() => router.push({ pathname: '/add-items', params: { who: name } })} />
          </Card>
        );
      })}
      <Btn kind="sec" sm icon="users" title="Add person" onPress={() => router.push('/add-person')} />
      <Btn kind="txt" icon="refresh" color={c.warn} title="Start over" onPress={() => setConfirm({ kind: 'reset' })} />

      <Sheet visible={!!confirm} onClose={() => setConfirm(null)}>
        <H2>{confirm?.kind === 'person' ? `Remove ${confirm.name}?` : 'Start over?'}</H2>
        <T>{confirm?.kind === 'person' ? `Their items come off the list too.` : 'Clears every item and person from this list. Saved lists in History stay.'}</T>
        <View style={{ gap: 6 }}>
          <Btn
            title={confirm?.kind === 'person' ? 'Remove' : 'Clear list'}
            color="#fff"
            style={{ backgroundColor: c.warn, borderColor: c.warn }}
            onPress={() => {
              if (confirm?.kind === 'person') removePerson(confirm.name);
              else clearOrder();
              setConfirm(null);
            }}
          />
          <Btn kind="txt" title="Cancel" onPress={() => setConfirm(null)} />
        </View>
      </Sheet>
    </Screen>
  );
}
