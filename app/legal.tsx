import { useState } from 'react';
import { Capy } from '../src/components/Capy';
import { Icon } from '../src/components/Icon';
import { Card, H3, ListRow, Row, S, Screen, T, TopBar, XS } from '../src/components/ui';
import { useTheme } from '../src/theme';

const SECTIONS = [
  ['Nutrition disclaimer', 'Calories and nutrients are estimates based on typical recipes and portions. Restaurants may prepare items differently.'],
  ['Allergen disclaimer', 'Allergy info is a helper, not a guarantee. Cross-contact can happen in any kitchen. If you have a serious allergy, always ask the restaurant before ordering.'],
  ['What Pickybara does', 'Pickybara reads menus and recommends what to eat or drink. It never places orders or takes payments.'],
];

export default function Legal() {
  const c = useTheme();
  const [open, setOpen] = useState<string | null>(SECTIONS[0][0]);
  return (
    <Screen top={<TopBar title="Legal and disclaimers" />}>
      <Card flat style={{ padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: c.tint, borderColor: 'transparent' }}>
        <Capy mood="happy" size={64} />
        <T b style={{ flex: 1 }}>
          The short version: we guess, you check. Always confirm food details with the restaurant.
        </T>
      </Card>
      {SECTIONS.map(([title, body]) => (
        <Card key={title} style={{ overflow: 'hidden' }}>
          <ListRow last onPress={() => setOpen(open === title ? null : title)} style={{ minHeight: 56 }}>
            <H3 style={{ flex: 1 }}>{title}</H3>
            <Icon n="down" s={20} color={c.ink} />
          </ListRow>
          {open === title ? <S style={{ paddingHorizontal: 16, paddingBottom: 16 }}>{body}</S> : null}
        </Card>
      ))}
      <Row style={{ justifyContent: 'center' }}>
        <XS>Pickybara · v1.0.0</XS>
      </Row>
    </Screen>
  );
}
