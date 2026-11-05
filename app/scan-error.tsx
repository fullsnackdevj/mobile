import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Capy } from '../src/components/Capy';
import { Icon, IconName } from '../src/components/Icon';
import { Banner, Btn, Card, H1, ListRow, Screen, T, TopBar } from '../src/components/ui';
import { menuFromScan, pickFromGallery } from '../src/scan';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';

const TIPS: [IconName, string][] = [
  ['flash', 'Find better lighting'],
  ['camera', 'Move a little closer'],
  ['eye', 'Avoid glare and shadows'],
];

export default function ScanError() {
  const c = useTheme();
  const { code, message } = useLocalSearchParams<{ code?: string; message?: string }>();
  const addMenu = useStore((s) => s.addMenu);
  const unreadable = !code || code === 'unreadable';
  const title = code === 'quota' ? "You've used this month's free scans." : code === 'offline' ? "Can't reach Pickybara." : unreadable ? "We couldn't read this menu clearly." : 'Oops, something went wrong.';

  function manual() {
    addMenu(menuFromScan('New menu', 'English', []));
    router.replace({ pathname: '/scan-review', params: { manual: '1' } });
  }

  return (
    <Screen
      top={<TopBar onBack={() => router.replace('/(tabs)')} />}
      bodyStyle={{ alignItems: 'center', gap: 22, paddingTop: 0 }}
      foot={
        <>
          <Btn title="Try Again" onPress={() => router.replace('/camera')} disabled={code === 'quota'} />
          <Btn kind="sec" title="Upload Different Photo" onPress={() => pickFromGallery()} disabled={code === 'quota'} />
          <Btn kind="txt" title="Enter Items Manually" onPress={manual} />
        </>
      }
    >
      <View style={{ width: 200, height: 200, borderRadius: 100, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>
        <Capy mood={unreadable ? 'sleepy' : 'surprised'} size={140} />
      </View>
      <H1 style={{ textAlign: 'center' }}>{title}</H1>
      {unreadable ? (
        <Card style={{ alignSelf: 'stretch' }}>
          {TIPS.map(([n, t], i) => (
            <ListRow key={t} last={i === TIPS.length - 1}>
              <Icon n={n} s={24} color={c.primary} />
              <T b>{t}</T>
            </ListRow>
          ))}
        </Card>
      ) : (
        <Banner kind="w" icon="warn" style={{ alignSelf: 'stretch' }}>
          {message || 'Please try again in a moment.'}
        </Banner>
      )}
    </Screen>
  );
}
