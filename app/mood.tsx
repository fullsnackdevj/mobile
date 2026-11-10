import { router } from 'expo-router';
import { View } from 'react-native';
import { Capy } from '../src/components/Capy';
import { IconName } from '../src/components/Icon';
import { Btn, H1, Label, Row, S, Screen, Segment, Toggle, TopBar } from '../src/components/ui';
import { useStore } from '../src/store';
import type { Mood } from '../src/types';

const VIBES: [string, IconName][] = [
  ['Tired', 'clock'],
  ['Treat', 'sparkle'],
  ['Light', 'leaf'],
  ['Friends', 'users'],
  ['Budget', 'wallet'],
  ['New', 'dice'],
  ['Hurry', 'timer'],
  ['Healthy', 'heart'],
  ['Caffeine', 'cup'],
  ['Refresh', 'drop'],
];
const BUDGETS = ['₱100', '₱200', '₱300', '₱500'];

export default function MoodPicker() {
  const mood = useStore((s) => s.mood);
  const set = useStore((s) => s.set);
  const upd = (p: Partial<Mood>) => set({ mood: { ...mood, ...p } });

  return (
    <Screen
      top={<TopBar />}
      gap={22}
      foot={
        <>
          <Btn title="Pick for me" onPress={() => router.navigate('/result')} />
          <Btn kind="txt" title="Skip" onPress={() => router.navigate('/result')} />
        </>
      }
    >
      <Row gap={14}>
        <Capy mood="happy" size={84} />
        <View style={{ flex: 1, gap: 4 }}>
          <H1>What's the vibe?</H1>
          <S>Pick as many as you like.</S>
        </View>
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {VIBES.map(([label, icon]) => (
          <Toggle
            key={label}
            label={label}
            icon={icon}
            on={mood.vibes.includes(label)}
            onPress={() => upd({ vibes: mood.vibes.includes(label) ? mood.vibes.filter((v) => v !== label) : [...mood.vibes, label] })}
            style={{ minHeight: 52 }}
          />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <Label style={{ marginBottom: 0 }}>Budget</Label>
        <Row gap={8}>
          {BUDGETS.map((b) => (
            <Toggle key={b} grow label={b} on={mood.budget === b} onPress={() => upd({ budget: b })} style={{ paddingHorizontal: 0 }} />
          ))}
        </Row>
      </View>
      <Segment options={['Food', 'Drinks', 'Both'] as const as unknown as Mood['mode'][]} value={mood.mode} onChange={(mode) => upd({ mode })} />
    </Screen>
  );
}
