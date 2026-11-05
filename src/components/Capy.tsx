import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';

export type CapyMood = 'happy' | 'hungry' | 'pick' | 'thinking' | 'cheer' | 'sleepy' | 'surprised' | 'key';

// Frame size at 1x (from assets/sprites/sizes.json) and loop length per pose.
const POSES: Record<CapyMood, { w: number; h: number; dur: number; label: string; src: number }> = {
  happy: { w: 288, h: 274, dur: 3.6, label: 'Happy capybara', src: require('../../assets/sprites/happy.png') },
  hungry: { w: 284, h: 230, dur: 4.4, label: 'Hungry capybara', src: require('../../assets/sprites/hungry.png') },
  pick: { w: 259, h: 231, dur: 5.0, label: 'Capybara picking a flower', src: require('../../assets/sprites/picking.png') },
  thinking: { w: 264, h: 211, dur: 5.8, label: 'Capybara thinking', src: require('../../assets/sprites/thinking.png') },
  cheer: { w: 218, h: 242, dur: 3.0, label: 'Capybara cheering', src: require('../../assets/sprites/cheer.png') },
  sleepy: { w: 216, h: 191, dur: 7.5, label: 'Sleepy capybara', src: require('../../assets/sprites/sleepy.png') },
  surprised: { w: 214, h: 196, dur: 3.8, label: 'Surprised capybara', src: require('../../assets/sprites/surprise.png') },
  key: { w: 256, h: 202, dur: 4.4, label: 'Capybara holding a key', src: require('../../assets/sprites/key.png') },
};

// Ping-pong through the 6 frames with hard cuts.
const SEQ = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];

// Opacity curve for one frame over one loop (t goes 0 -> SEQ.length): 1 while it is the current frame, else 0.
function frameCurve(frame: number) {
  const input: number[] = [];
  const output: number[] = [];
  SEQ.forEach((f, k) => {
    const v = f === frame ? 1 : 0;
    input.push(k, k + 0.999);
    output.push(v, v);
  });
  input.push(SEQ.length);
  output.push(SEQ[0] === frame ? 1 : 0);
  return { inputRange: input, outputRange: output };
}
const CURVES = [0, 1, 2, 3, 4, 5].map(frameCurve);

/** Animated mascot. `size` is the display height. */
export function Capy({ mood = 'happy', size = 120 }: { mood?: CapyMood; size?: number }) {
  const p = POSES[mood] ?? POSES.happy;
  const h = size;
  const w = Math.round((h * p.w) / p.h);
  const t = useRef(new Animated.Value(0)).current;

  // Always animates, even with Reduce Motion on (owner's choice).
  // Runs on the native animation thread, so it keeps going even when JS is busy.
  useEffect(() => {
    t.setValue(0);
    const loop = Animated.loop(Animated.timing(t, { toValue: SEQ.length, duration: p.dur * 1000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [p.dur]);

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={p.label} style={{ width: w, height: h }}>
      {CURVES.map((curve, i) => (
        <Animated.View
          key={i}
          style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', opacity: t.interpolate(curve) }}
        >
          <Image source={p.src} style={{ position: 'absolute', top: 0, left: -i * w, width: w * 6, height: h }} resizeMode="stretch" />
        </Animated.View>
      ))}
    </View>
  );
}
