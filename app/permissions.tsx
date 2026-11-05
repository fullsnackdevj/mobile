import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Capy, CapyMood } from '../src/components/Capy';
import { Icon, IconName } from '../src/components/Icon';
import { Btn, H1, Pill, Row, Screen, T } from '../src/components/ui';
import { askNotifications } from '../src/notify';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';

const PAGES: { icon: IconName; mood: CapyMood; title: string; why: string; cta: string; optional: boolean }[] = [
  { icon: 'camera', mood: 'surprised', title: 'Let Pickybara see the menu', why: 'We need your camera to read menus. Photos stay on your phone unless you choose to save them.', cta: 'Allow camera', optional: false },
  { icon: 'bell', mood: 'happy', title: 'A nudge after your meal', why: 'Get a quick "how was it?" so your picks keep getting better. Optional.', cta: 'Turn on notifications', optional: true },
];

export default function Permissions() {
  const c = useTheme();
  const set = useStore((s) => s.set);
  const setSettings = useStore((s) => s.setSettings);
  const [, requestCamera] = useCameraPermissions();
  const [i, setI] = useState(0);
  const p = PAGES[i];

  const done = () => {
    set({ onboarded: true });
    router.replace('/(tabs)');
  };
  const next = () => (i < PAGES.length - 1 ? setI(i + 1) : done());

  async function allow() {
    if (i === 0) await requestCamera();
    else setSettings({ ratingReminders: await askNotifications() });
    next();
  }

  return (
    <Screen
      scroll={false}
      top={
        <Row style={{ height: 60, justifyContent: 'center' }}>
          <Pill kind={p.optional ? 'g' : 'w'} label={p.optional ? 'Optional' : 'Required'} />
        </Row>
      }
      bodyStyle={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 22 }}
      foot={
        <>
          <Row gap={8} style={{ justifyContent: 'center', paddingBottom: 6 }}>
            {PAGES.map((_, k) => (
              <View key={k} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: k === i ? c.primary : c.line }} />
            ))}
          </Row>
          <Btn title={p.cta} onPress={allow} />
          {p.optional ? <Btn kind="txt" title="Not now" onPress={next} /> : null}
        </>
      }
    >
      <View style={{ width: 220, height: 220, borderRadius: 110, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon n={p.icon} s={52} color={c.onPrimary} />
        </View>
        <View style={{ position: 'absolute', right: -10, bottom: -6 }}>
          <Capy mood={p.mood} size={84} />
        </View>
      </View>
      <H1 style={{ textAlign: 'center' }}>{p.title}</H1>
      <T style={{ color: c.muted, textAlign: 'center' }}>{p.why}</T>
    </Screen>
  );
}
