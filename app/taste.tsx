import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Capy } from '../src/components/Capy';
import { Icon, IconName } from '../src/components/Icon';
import { Banner, Btn, Card, Chip, Field, H1, H3, Label, ListRow, Progress, Row, S, Screen, T, XS } from '../src/components/ui';
import { useStore } from '../src/store';
import { fonts, useTheme } from '../src/theme';
import { ALLERGIES, AVOIDS, BUDGETS, DIETS, GOALS, LOVES, SPICE, Taste } from '../src/types';

const STEPS = [
  ['Foods and drinks you love', 'Pick as many as you like.'],
  ['Foods you avoid', "We'll steer clear of these."],
  ['Dietary needs', 'Anything we should always respect?'],
  ['Allergies', 'Tell us what to keep off your plate.'],
  ['Spice and budget', 'How hot, and how much per meal?'],
  ['Your usual goals', 'Pick as many as you like.'],
];
const GOAL_ICONS: Record<string, IconName> = { Cheap: 'wallet', Filling: 'bowl', Healthy: 'leaf', 'Comfort food': 'heart', 'High protein': 'flame', 'Low calorie': 'sparkle' };

export default function TasteProfile() {
  const c = useTheme();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const saved = useStore((s) => s.taste);
  const dislikes = useStore((s) => s.dislikes);
  const setStore = useStore((s) => s.set);
  const [t, setT] = useState<Taste>(saved);
  const [extra, setExtra] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [step, setStep] = useState(edit ? 6 : 0);

  const toggle = (key: 'love' | 'avoid' | 'diet' | 'allergy' | 'goal', label: string, none?: string) => {
    const cur = t[key];
    let nx: string[];
    if (none && label === none) nx = [none];
    else {
      nx = cur.includes(label) ? cur.filter((x) => x !== label) : cur.filter((x) => x !== none).concat(label);
      if (none && nx.length === 0) nx = [none];
    }
    setT({ ...t, [key]: nx });
    if (key === 'avoid' && none && label === none) setExtra([]);
  };

  const addExtra = (v: string) => {
    setExtra([...extra, v]);
    setT((cur) => ({ ...cur, avoid: cur.avoid.filter((x) => x !== 'None') }));
  };

  function save() {
    setStore({ taste: t, dislikes: Array.from(new Set([...dislikes, ...extra])) });
    if (edit) router.back();
    else router.replace('/permissions');
  }

  const join = (a: string[]) => (a.length ? a.join(', ') : 'None');

  if (step === 6) {
    const rows = [
      ['Loves', join(t.love)],
      ['Avoids', join([...t.avoid.filter((x) => !(x === 'None' && extra.length)), ...extra])],
      ['Diet', join(t.diet)],
      ['Allergies', join(t.allergy)],
      ['Spice', `${t.spice} · ${t.budget} per meal`],
      ['Goals', join(t.goal)],
    ];
    return (
      <Screen
        top={<View style={{ height: 60 }} />}
        gap={18}
        bodyStyle={{ paddingBottom: 40 }}
        foot={
          <>
            <Btn title={edit ? 'Save' : 'Start'} onPress={save} />
            <Btn kind="txt" title="Edit" onPress={() => setStep(0)} />
          </>
        }
      >
        <Row>
          <Capy mood="happy" size={88} />
          <H1 style={{ flex: 1 }}>{edit ? 'Your taste profile' : 'Your profile is ready'}</H1>
        </Row>
        <Card>
          {rows.map(([k, v], i) => (
            <ListRow key={k} last={i === rows.length - 1} style={{ alignItems: 'flex-start', minHeight: 0, paddingVertical: 14 }}>
              <S b style={{ width: 82, lineHeight: 22 }}>{k}</S>
              <T b style={{ flex: 1 }}>{v}</T>
            </ListRow>
          ))}
        </Card>
      </Screen>
    );
  }

  const chipSets: [keyof Taste, readonly string[], string?][] = [
    ['love', LOVES],
    ['avoid', [...AVOIDS, 'None'], 'None'],
    ['diet', DIETS, 'None'],
    ['allergy', ALLERGIES, 'None'],
  ];
  const back = () => (step === 0 ? (edit ? setStep(6) : router.replace('/signup')) : setStep(step - 1));

  return (
    <Screen
      top={
        <Row gap={6} style={{ height: 60, paddingHorizontal: 10 }}>
          <Pressable accessibilityLabel="Back" onPress={back} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Icon n="back" s={24} color={c.ink} />
          </Pressable>
          <Progress pct={((step + 1) / 6) * 100} />
          <Btn kind="txt" sm title="Skip" onPress={() => setStep(step + 1)} style={{ paddingHorizontal: 12 }} />
        </Row>
      }
      gap={18}
      foot={<Btn title="Continue" onPress={() => setStep(step + 1)} />}
    >
      <View style={{ gap: 6 }}>
        <XS b>Step {step + 1} of 6</XS>
        <H1>{STEPS[step][0]}</H1>
        <S>{STEPS[step][1]}</S>
      </View>

      {step < 4 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {chipSets[step][1].map((label) => (
            <Chip key={label} label={label} on={(t[chipSets[step][0]] as string[]).includes(label)} onPress={() => toggle(chipSets[step][0] as any, label, chipSets[step][2])} />
          ))}
          {step === 1 && extra.map((x) => <Chip key={x} label={x} on onPress={() => setExtra(extra.filter((e) => e !== x))} />)}
        </View>
      )}
      {step === 1 && (
        <Field
          placeholder="Add other..."
          value={other}
          onChangeText={setOther}
          returnKeyType="done"
          onSubmitEditing={() => {
            const v = other.trim();
            if (v && !extra.includes(v)) addExtra(v);
            setOther('');
          }}
          right={
            <Pressable
              accessibilityLabel="Add"
              onPress={() => {
                const v = other.trim();
                if (v && !extra.includes(v)) addExtra(v);
                setOther('');
              }}
            >
              <Icon n="plus" s={22} color={c.ink} />
            </Pressable>
          }
        />
      )}
      {step === 3 && <Banner icon="info">Allergy info is a helper, not a guarantee.</Banner>}

      {step === 4 && (
        <>
          <View style={{ gap: 10 }}>
            <Label style={{ marginBottom: 0 }}>Spice tolerance</Label>
            <Row gap={8}>
              {SPICE.map((label, i) => {
                const on = t.spice === label;
                const lvl = SPICE.indexOf(t.spice);
                return (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setT({ ...t, spice: label })}
                    style={{ flex: 1, minHeight: 72, borderRadius: 22, borderWidth: 2, borderColor: on ? c.primary : c.line, backgroundColor: on ? c.tint : c.card, alignItems: 'center', justifyContent: 'center', gap: 2 }}
                  >
                    <Icon n="flame" s={22} color={on ? c.tintInk : c.ink} fill={i > 0 && i <= lvl} />
                    <T style={{ fontFamily: fonts.head, fontSize: 13, color: on ? c.tintInk : c.ink }}>{label}</T>
                  </Pressable>
                );
              })}
            </Row>
          </View>
          <View style={{ gap: 10 }}>
            <Label style={{ marginBottom: 0 }}>Typical budget per meal</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {BUDGETS.map((b) => (
                <Chip key={b} label={b} on={t.budget === b} onPress={() => setT({ ...t, budget: b })} />
              ))}
            </View>
          </View>
        </>
      )}

      {step === 5 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {GOALS.map((g) => {
            const on = t.goal.includes(g);
            return (
              <Pressable
                key={g}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => toggle('goal', g)}
                style={{ width: '47.5%', minHeight: 112, padding: 14, borderRadius: 24, borderWidth: 2, borderColor: on ? c.primary : c.line, backgroundColor: on ? c.tint : c.card, justifyContent: 'space-between' }}
              >
                <Icon n={GOAL_ICONS[g]} s={28} color={c.primary} />
                <H3>{g}</H3>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
