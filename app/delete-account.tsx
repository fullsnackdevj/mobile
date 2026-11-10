import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { api, resetDevice } from '../src/api';
import { Capy } from '../src/components/Capy';
import { Banner, Btn, Card, Field, Label, ListRow, Row, Screen, T, TopBar } from '../src/components/ui';
import { cancelAllReminders } from '../src/notify';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';

const WHAT = ['Taste profile and dislike list', 'Favorites and saved menus', 'History and ratings', 'Saved order lists'];

export default function DeleteAccount() {
  const c = useTheme();
  const wipe = useStore((s) => s.wipe);
  const [v, setV] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = v.trim() === 'DELETE';

  async function del() {
    setBusy(true);
    // Server only holds the scan counter for this device; local data is the rest.
    await api.deleteData().catch(() => {});
    await resetDevice().catch(() => {});
    await cancelAllReminders().catch(() => {});
    wipe();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  }

  return (
    <Screen
      top={<TopBar title="Delete account" />}
      foot={
        <>
          <Btn kind="dark" title="Delete my account" disabled={!ok} loading={busy} onPress={del} />
          <Btn kind="sec" title="Cancel" onPress={() => router.back()} />
        </>
      }
    >
      <Row gap={14}>
        <Capy mood="sleepy" size={84} />
        <T b style={{ flex: 1 }}>
          We're sad to see you go. This can't be undone.
        </T>
      </Row>
      <Banner kind="w" icon="warn">
        Deleting your account removes everything below for good.
      </Banner>
      <Card>
        {WHAT.map((w, i) => (
          <ListRow key={w} last={i === WHAT.length - 1}>
            <T>{w}</T>
          </ListRow>
        ))}
      </Card>
      <View>
        <Label>Type DELETE to confirm</Label>
        <Field value={v} onChangeText={setV} placeholder="DELETE" autoCapitalize="characters" autoCorrect={false} style={{ borderColor: ok ? c.warn : c.line }} />
      </View>
    </Screen>
  );
}
