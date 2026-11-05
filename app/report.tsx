import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { api } from '../src/api';
import { RouteSheet } from '../src/components/RouteSheet';
import { Banner, Btn, Field, H2, IconBtn, Row, T } from '../src/components/ui';
import { useTheme } from '../src/theme';

const TYPES = ['Wrong price', 'Wrong nutrition', 'Wrong allergen info', 'Wrong item name', 'Missing item', 'Other'];

export default function ReportSheet() {
  const c = useTheme();
  const { restaurant, item } = useLocalSearchParams<{ restaurant?: string; item?: string }>();
  const [sel, setSel] = useState(TYPES[0]);
  const [note, setNote] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function submit() {
    setState('sending');
    try {
      await api.report({ type: sel, note, restaurant, item });
      setState('sent');
      setTimeout(() => router.back(), 1200);
    } catch {
      setState('error');
    }
  }

  return (
    <RouteSheet>
      <Row style={{ justifyContent: 'space-between' }}>
        <H2>Something look off?</H2>
        <IconBtn n="close" size={22} label="Close" onPress={() => router.back()} />
      </Row>
      {state === 'sent' ? (
        <Banner kind="dark" icon="check">
          Thanks, we'll review this.
        </Banner>
      ) : null}
      {state === 'error' ? (
        <Banner kind="w" icon="warn">
          Couldn't send. Check your connection and try again.
        </Banner>
      ) : null}
      <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
        {TYPES.map((t) => {
          const on = sel === t;
          return (
            <Pressable
              key={t}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => setSel(t)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 14, borderRadius: 16, borderWidth: 2, borderColor: on ? c.primary : c.line, backgroundColor: on ? c.tint : c.card }}
            >
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? c.primary : c.muted, alignItems: 'center', justifyContent: 'center' }}>
                {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary }} /> : null}
              </View>
              <T b>{t}</T>
            </Pressable>
          );
        })}
      </View>
      <Field placeholder="Add a note (optional)" value={note} onChangeText={setNote} />
      <Btn title="Submit" loading={state === 'sending'} disabled={state === 'sent'} onPress={submit} />
    </RouteSheet>
  );
}
