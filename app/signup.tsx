import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Capy } from '../src/components/Capy';
import { Btn, Field, H1, Label, Row, Screen, T, TopBar, XS } from '../src/components/ui';
import { useStore } from '../src/store';
import { fonts, useTheme } from '../src/theme';

export default function SignUp() {
  const c = useTheme();
  const set = useStore((s) => s.set);
  const [mode, setMode] = useState<'choose' | 'email'>('choose');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  function finish(guest: boolean) {
    set({ profile: guest ? { name: 'Guest', email: '', guest: true } : { name: name.trim() || email.split('@')[0], email: email.trim(), guest: false } });
    router.replace('/taste');
  }

  return (
    <Screen
      top={<TopBar onBack={() => (mode === 'email' ? setMode('choose') : router.replace('/welcome'))} />}
      gap={20}
      foot={
        <XS style={{ textAlign: 'center' }}>
          By continuing you agree to our{' '}
          <Text onPress={() => router.push('/legal')} style={{ textDecorationLine: 'underline', fontFamily: fonts.bodyHeavy, color: c.ink }}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text onPress={() => router.push('/legal')} style={{ textDecorationLine: 'underline', fontFamily: fonts.bodyHeavy, color: c.ink }}>
            Privacy Policy
          </Text>
          .
        </XS>
      }
    >
      <Row gap={14}>
        <Capy mood="hungry" size={96} />
        <View>
          <H1>Hungry?</H1>
          <T style={{ color: c.muted }}>Let's get you in.</T>
        </View>
      </Row>
      {mode === 'choose' ? (
        <View style={{ gap: 12 }}>
          <Btn kind="soft" icon="mail" title="Continue with Email" onPress={() => setMode('email')} />
          <Btn kind="txt" title="Continue as guest" onPress={() => finish(true)} />
          <XS style={{ textAlign: 'center', marginTop: -8 }}>Everything is saved on this phone.</XS>
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          <View>
            <Label>Your name</Label>
            <Field icon="user" value={name} onChangeText={setName} placeholder="Alex" autoCapitalize="words" textContentType="givenName" />
          </View>
          <View>
            <Label>Email</Label>
            <Field icon="mail" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" />
          </View>
          <Btn title="Continue" disabled={!validEmail} onPress={() => finish(false)} />
          <Btn kind="txt" title="Use another way" onPress={() => setMode('choose')} />
        </View>
      )}
    </Screen>
  );
}
