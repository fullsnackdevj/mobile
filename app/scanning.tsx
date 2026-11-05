import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { api, ApiError } from '../src/api';
import { Capy } from '../src/components/Capy';
import { Icon } from '../src/components/Icon';
import { Btn, Card, H1, Row, Screen, T } from '../src/components/ui';
import { menuFromScan, scanPrefs, setQuota, toBase64Jpeg } from '../src/scan';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';

const TIPS = [
  'Tip: cheaper combos hide at the bottom of the menu.',
  'Tip: tell me your mood next and I will narrow it down.',
  'Fun fact: most people pick the first thing they see.',
  'Tip: heart a dish and I will remember it.',
];

export default function Scanning() {
  const c = useTheme();
  const photos = useStore((s) => s.photos);
  const savePhotos = useStore((s) => s.privacy.savePhotos);
  const addMenu = useStore((s) => s.addMenu);
  const [tip, setTip] = useState(0);
  const ctrl = useRef(new AbortController());
  const bob = useRef(new Animated.Value(0)).current;
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.25))).current;

  useEffect(() => {
    const t = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 2600);
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -14, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const d = Animated.loop(
      Animated.stagger(
        200,
        dots.map((v) => Animated.sequence([Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: true }), Animated.timing(v, { toValue: 0.25, duration: 400, useNativeDriver: true })]))
      )
    );
    a.start();
    d.start();
    run();
    return () => {
      clearInterval(t);
      a.stop();
      d.stop();
      ctrl.current.abort();
    };
  }, []);

  async function run() {
    try {
      if (!photos.length) throw new ApiError('No photo to read.', 'unreadable');
      const images = await Promise.all(photos.map(toBase64Jpeg));
      const r = await api.scan(images, scanPrefs.language, ctrl.current.signal);
      setQuota(r.quota);
      if (!r.readable || !r.items.length) {
        router.replace({ pathname: '/scan-error', params: { code: 'unreadable' } });
        return;
      }
      addMenu(menuFromScan(r.restaurant, r.language, r.items, r.demo, savePhotos ? photos : undefined));
      router.replace('/scan-review');
    } catch (e) {
      const err = e as ApiError;
      if (err.code === 'cancelled') return;
      router.replace({ pathname: '/scan-error', params: { code: err.code || 'server', message: err.message } });
    }
  }

  return (
    <Screen
      scroll={false}
      bodyStyle={{ alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 32 }}
      foot={
        <Btn
          kind="sec"
          title="Cancel"
          onPress={() => {
            ctrl.current.abort();
            router.replace('/(tabs)');
          }}
        />
      }
    >
      <View style={{ width: 240, height: 240, borderRadius: 120, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ transform: [{ translateY: bob }] }}>
          <Capy mood="thinking" size={150} />
        </Animated.View>
      </View>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <H1>Reading the menu...</H1>
        <Row gap={8}>
          {dots.map((v, i) => (
            <Animated.View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary, opacity: v }} />
          ))}
        </Row>
      </View>
      <Card style={{ paddingVertical: 16, paddingHorizontal: 18, minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch' }}>
        <Icon n="sparkle" s={24} color={c.primary} />
        <View style={{ flex: 1 }} accessibilityLiveRegion="polite">
          <T>{TIPS[tip]}</T>
        </View>
      </Card>
    </Screen>
  );
}
