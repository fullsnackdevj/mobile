import { Href, router, Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../src/components/Icon';
import { fonts, useTheme } from '../../src/theme';

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Home', icon: 'camera' },
  favorites: { label: 'Favorites', icon: 'heart' },
  order: { label: 'Order', icon: 'clipboard' },
  history: { label: 'History', icon: 'clock' },
  profile: { label: 'Profile', icon: 'user' },
};

function TabBar({ state }: BottomTabBarProps) {
  const c = useTheme();
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 6, paddingHorizontal: 6, paddingBottom: Math.max(ins.bottom, 12) }}>
      {state.routes.map((r, i) => {
        const t = TABS[r.name];
        if (!t) return null;
        const on = state.index === i;
        const col = on ? c.primary : c.muted;
        return (
          <Pressable
            key={r.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
            onPress={() => router.navigate((r.name === 'index' ? '/(tabs)' : `/(tabs)/${r.name}`) as Href)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 48 }}
          >
            <Icon n={t.icon} s={24} color={col} fill={on && r.name === 'favorites'} />
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 12, color: col }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const c = useTheme();
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="order" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
