import { router } from 'expo-router';
import { Alert, Share, View } from 'react-native';
import { Banner, Btn, Card, Label, ListRow, S, Screen, Switch, T, TopBar } from '../src/components/ui';
import { useStore } from '../src/store';

export default function Privacy() {
  const privacy = useStore((s) => s.privacy);
  const setPrivacy = useStore((s) => s.setPrivacy);
  const set = useStore((s) => s.set);

  const toggles: [keyof typeof privacy, string, string][] = [
    ['savePhotos', 'Save my scanned photos', 'Keep menu photos on this phone so you can look at them later.'],
    ['learn', 'Use my history to improve picks', 'Ratings and picks teach Pickybara your taste.'],
  ];

  function download() {
    const s = useStore.getState();
    const data = { profile: s.profile, taste: s.taste, dislikes: s.dislikes, favorites: s.favorites, history: s.history, savedOrders: s.savedOrders, menus: s.menus.map(({ photos, ...m }) => m) };
    Share.share({ message: JSON.stringify(data, null, 2), title: 'My Pickybara data' });
  }

  return (
    <Screen top={<TopBar title="Privacy and data" />}>
      <Banner icon="lock">We only keep what helps you decide. You're in control of all of it.</Banner>
      <Card>
        {toggles.map(([k, label, why], i) => (
          <ListRow key={k} last={i === toggles.length - 1} style={{ alignItems: 'flex-start', paddingVertical: 14 }}>
            <View style={{ flex: 1 }}>
              <T b>{label}</T>
              <S>{why}</S>
            </View>
            <Switch label={label} on={privacy[k]} onPress={() => setPrivacy({ [k]: !privacy[k] })} />
          </ListRow>
        ))}
      </Card>
      <View style={{ gap: 10 }}>
        <Label style={{ marginBottom: 0 }}>Your data</Label>
        <Btn kind="sec" icon="share" title="Download my data" onPress={download} />
        <Btn
          kind="sec"
          title="Delete my history"
          onPress={() =>
            Alert.alert('Delete your history?', 'Picks and ratings will be removed from this phone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => set({ history: [] }) },
            ])
          }
        />
        <Btn kind="soft" title="Delete all my data" onPress={() => router.push('/delete-account')} />
      </View>
      <View style={{ gap: 6 }}>
        <Label style={{ marginBottom: 0 }}>What we collect, in plain words</Label>
        <S>
          Menu photos are sent to our server only to be read, then thrown away. Your taste profile, favorites and history stay on this phone. We never sell personal data.
        </S>
      </View>
    </Screen>
  );
}
