import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Capy } from '../src/components/Capy';
import { Btn } from '../src/components/ui';
import { useStore } from '../src/store';
import { fonts } from '../src/theme';

const WORD = 'Pickybara'.split('');

export default function Splash() {
  const onboarded = useStore((s) => s.onboarded);
  const t = useRef(new Animated.Value(0)).current;
  const ins = useSafeAreaInsets();

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 2400, useNativeDriver: true }));
    loop.start();
    // First launch waits for the Next button. Returning users skip ahead.
    const go = onboarded ? setTimeout(next, 1200) : undefined;
    return () => {
      loop.stop();
      if (go) clearTimeout(go);
    };
  }, []);

  function next() {
    router.replace(onboarded ? '/(tabs)' : '/welcome');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0B860' }}>
      <Pressable
        accessible={false}
        onPress={onboarded ? next : undefined}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        <View
          style={{
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: '#FFF4DC',
            alignItems: 'center',
            justifyContent: 'flex-end',
            overflow: 'hidden',
          }}
        >
          <View style={{ marginBottom: -14 }}>
            <Capy mood="happy" size={240} />
          </View>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row' }} accessibilityLabel="Pickybara">
            {WORD.map((ch, i) => {
              // Each letter waves a little after the previous one.
              const phase = Animated.modulo(Animated.add(t, i * 0.058), 1);
              const y = phase.interpolate({
                inputRange: [0, 0.3, 0.6, 1],
                outputRange: [0, -9, 0, 0],
              });
              return (
                <Animated.Text
                  key={i}
                  style={{
                    fontFamily: fonts.headBold,
                    fontSize: 54,
                    lineHeight: 62,
                    color: '#3F2518',
                    transform: [{ translateY: y }],
                  }}
                >
                  {ch}
                </Animated.Text>
              );
            })}
          </View>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 18,
              color: '#3F2518',
            }}
          >
            Can't decide? Pickybara picks.
          </Text>
        </View>
      </Pressable>
      {!onboarded && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: Math.max(ins.bottom, 16) + 8,
          }}
        >
          <Btn title="Next" onPress={next} />
        </View>
      )}
    </View>
  );
}
