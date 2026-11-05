import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { listenForRatingTaps } from '../src/notify';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const sheet = { presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } } as const;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fredoka_600SemiBold, Fredoka_700Bold, Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold });
  const hydrated = useStore((s) => s.hydrated);
  const c = useTheme();
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  useEffect(() => listenForRatingTaps(), []);

  if (!ready) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style={c.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal', contentStyle: { backgroundColor: '#151110' } }} />
        <Stack.Screen name="scanning" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="why" options={sheet} />
        <Stack.Screen name="allergen" options={sheet} />
        <Stack.Screen name="picked" options={sheet} />
        <Stack.Screen name="report" options={sheet} />
        <Stack.Screen name="add-person" options={sheet} />
        <Stack.Screen name="rate/[id]" options={sheet} />
      </Stack>
    </SafeAreaProvider>
  );
}
