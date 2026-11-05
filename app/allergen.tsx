import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Icon } from '../src/components/Icon';
import { Btn, H2, Pill, T, XS } from '../src/components/ui';
import { useTheme } from '../src/theme';
import { usePicks } from '../src/usePicks';

export default function AllergenModal() {
  const c = useTheme();
  const { id, extras } = useLocalSearchParams<{ id: string; extras?: string }>();
  const { scoreOf } = usePicks();
  const s = scoreOf(id);
  const hits = s?.allergyHits ?? [];
  const list = hits.join(', ').toLowerCase();

  return (
    <View style={{ flex: 1, backgroundColor: c.scrim, justifyContent: 'center', padding: 20 }}>
      <View accessibilityRole="alert" style={{ backgroundColor: c.card, borderRadius: 28, paddingTop: 26, paddingHorizontal: 22, paddingBottom: 22, alignItems: 'center', gap: 14, borderWidth: 3, borderColor: c.warn }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.warnTint, alignItems: 'center', justifyContent: 'center' }}>
          <Icon n="warn" s={40} color={c.warn} />
        </View>
        <H2 style={{ textAlign: 'center' }}>Heads up: {list || 'allergens'}</H2>
        <T style={{ textAlign: 'center' }}>
          {s?.item.name ?? 'This item'} may contain <T b style={{ color: c.warn }}>{list}</T>, which is on your allergy list.
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {hits.map((h) => (
            <Pill key={h} kind="w" icon="warn" label={h} />
          ))}
        </View>
        <XS style={{ textAlign: 'center' }}>Allergy info is a helper, not a guarantee. Always confirm with the restaurant.</XS>
        <View style={{ alignSelf: 'stretch', gap: 6 }}>
          <Btn title="Pick something else" onPress={() => router.replace('/ranked')} />
          <Btn kind="txt" title="I understand" onPress={() => router.replace({ pathname: '/picked', params: { id, extras: extras ?? '' } })} />
        </View>
      </View>
    </View>
  );
}
