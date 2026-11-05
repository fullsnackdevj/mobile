import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Icon, IconName } from '../../src/components/Icon';
import { Card, H2, H3, IconBtn, ListRow, Progress, Row, S, Screen, T, TopBar, XS } from '../../src/components/ui';
import { useQuota } from '../../src/scan';
import { useStore } from '../../src/store';
import { fonts, useTheme } from '../../src/theme';

export default function Profile() {
  const c = useTheme();
  const profile = useStore((s) => s.profile);
  const q = useQuota();
  const name = profile?.name || 'Guest';

  const tiles: [string, IconName, () => void][] = [
    ['Taste Profile', 'utensils', () => router.push({ pathname: '/taste', params: { edit: '1' } })],
    ['Dislike List', 'thumbdown', () => router.push('/dislikes')],
    ['Favorites', 'heart', () => router.navigate('/(tabs)/favorites')],
    ['History', 'clock', () => router.navigate('/(tabs)/history')],
  ];

  return (
    <Screen edgesBottom={false} top={<TopBar back={false} big title="Profile" right={<IconBtn n="sliders" size={20} fill label="Settings" onPress={() => router.push('/settings')} />} />}>
      <Row gap={16}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.head, fontSize: 30, color: c.onPrimary }}>{name[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <H2>{name}</H2>
          <S>{profile?.email || 'Saved on this phone only'}</S>
        </View>
      </Row>
      <Card style={{ paddingVertical: 14, paddingHorizontal: 16, gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T b>Free scans this month</T>
          <T b>{q ? `${q.left} of ${q.limit} left` : '—'}</T>
        </Row>
        <Row>
          <Progress h={10} pct={q ? (q.used / q.limit) * 100 : 0} />
        </Row>
        <XS>Resets {q?.resetsOn ?? 'on the 1st'}. Saved menus are always free to re-use.</XS>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {tiles.map(([label, icon, go]) => (
          <Card key={label} onPress={go} style={{ width: '47.5%', minHeight: 104, padding: 14, justifyContent: 'space-between' }}>
            <Icon n={icon} s={26} color={c.primary} />
            <H3>{label}</H3>
          </Card>
        ))}
      </View>
      <Card>
        {(
          [
            ['Settings', '/settings'],
            ['Privacy and data', '/privacy'],
            ['About', '/legal'],
          ] as const
        ).map(([label, href], i) => (
          <ListRow key={label} last={i === 2} onPress={() => router.push(href)}>
            <T b style={{ flex: 1 }}>
              {label}
            </T>
            <Icon n="chevron" s={20} color={c.ink} />
          </ListRow>
        ))}
      </Card>
    </Screen>
  );
}
