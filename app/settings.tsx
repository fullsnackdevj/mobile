import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { apiBase } from '../src/api';
import { Icon } from '../src/components/Icon';
import { Btn, Card, Chip, Label, ListRow, Row, Screen, Switch, T, TopBar, XS } from '../src/components/ui';
import { askNotifications, cancelAllReminders } from '../src/notify';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';

export default function Settings() {
  const c = useTheme();
  const profile = useStore((s) => s.profile);
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const menus = useStore((s) => s.menus);
  const set = useStore((s) => s.set);
  const saved = menus.filter((m) => m.saved).length;

  async function toggleReminders() {
    if (settings.ratingReminders) {
      await cancelAllReminders();
      setSettings({ ratingReminders: false });
    } else setSettings({ ratingReminders: await askNotifications() });
  }

  return (
    <Screen top={<TopBar title="Settings" />} gap={18}>
      <View>
        <Label>Account</Label>
        <Card>
          <ListRow>
            <T style={{ flex: 1 }}>Name</T>
            <T b>{profile?.name || 'Guest'}</T>
          </ListRow>
          <ListRow>
            <T style={{ flex: 1 }}>Email</T>
            <T b>{profile?.email || '—'}</T>
          </ListRow>
          <ListRow last onPress={() => router.push('/delete-account')}>
            <T b style={{ flex: 1, color: c.warn }}>
              Delete account
            </T>
            <Icon n="chevron" s={20} color={c.ink} />
          </ListRow>
        </Card>
      </View>
      <View>
        <Label>Preferences</Label>
        <Card>
          <ListRow>
            <T style={{ flex: 1 }}>Currency</T>
            <T b>PHP (₱)</T>
          </ListRow>
          <ListRow>
            <T style={{ flex: 1 }}>Energy units</T>
            <Row gap={6}>
              <Chip label="kcal" on={settings.energy === 'kcal'} onPress={() => setSettings({ energy: 'kcal' })} />
              <Chip label="kJ" on={settings.energy === 'kJ'} onPress={() => setSettings({ energy: 'kJ' })} />
            </Row>
          </ListRow>
          <ListRow last>
            <T style={{ flex: 1 }}>Theme</T>
            <Row gap={6}>
              {(['light', 'dark', 'auto'] as const).map((t) => (
                <Chip key={t} label={t[0].toUpperCase() + t.slice(1)} on={settings.theme === t} onPress={() => setSettings({ theme: t })} style={{ paddingHorizontal: 12 }} />
              ))}
            </Row>
          </ListRow>
        </Card>
      </View>
      <View>
        <Label>Notifications</Label>
        <Card>
          <ListRow last>
            <T style={{ flex: 1 }}>Post-meal rating reminders</T>
            <Switch label="Post-meal rating reminders" on={settings.ratingReminders} onPress={toggleReminders} />
          </ListRow>
        </Card>
      </View>
      <View>
        <Label>Storage</Label>
        <Card>
          <ListRow last>
            <View style={{ flex: 1 }}>
              <T>Saved menus</T>
              <XS>{saved} menus on this phone</XS>
            </View>
            <Btn
              kind="sec"
              sm
              title="Clear"
              disabled={!saved}
              onPress={() =>
                Alert.alert('Clear saved menus?', 'History and favorites stay.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: () => set({ menus: [], currentMenuId: null }) },
                ])
              }
            />
          </ListRow>
        </Card>
      </View>
      <Btn kind="sec" title="Privacy and data" onPress={() => router.push('/privacy')} />
      <XS style={{ textAlign: 'center' }}>Server: {apiBase()}</XS>
    </Screen>
  );
}
