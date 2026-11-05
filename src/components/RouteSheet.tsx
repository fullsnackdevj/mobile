import { router } from 'expo-router';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { SheetBody } from './ui';

/** A route presented as a bottom sheet over the previous screen. */
export function RouteSheet({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  const c = useTheme();
  const ins = useSafeAreaInsets();
  const close = onClose ?? (() => router.back());
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Pressable accessibilityLabel="Close sheet" onPress={close} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.scrim }} />
      <SheetBody c={c} bottom={ins.bottom}>
        {children}
      </SheetBody>
    </KeyboardAvoidingView>
  );
}
