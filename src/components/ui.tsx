import { router } from 'expo-router';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, fonts, useTheme } from '../theme';
import { Capy } from './Capy';
import { Icon, IconName } from './Icon';

type TxtProps = { children?: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number };

export const H1 = ({ children, style, numberOfLines }: TxtProps) => {
  const c = useTheme();
  return <Text numberOfLines={numberOfLines} style={[{ fontFamily: fonts.head, fontSize: 30, lineHeight: 34, color: c.ink }, style]}>{children}</Text>;
};
export const H2 = ({ children, style, numberOfLines }: TxtProps) => {
  const c = useTheme();
  return <Text numberOfLines={numberOfLines} style={[{ fontFamily: fonts.head, fontSize: 22, lineHeight: 27, color: c.ink }, style]}>{children}</Text>;
};
export const H3 = ({ children, style, numberOfLines }: TxtProps) => {
  const c = useTheme();
  return <Text numberOfLines={numberOfLines} style={[{ fontFamily: fonts.head, fontSize: 18, lineHeight: 22, color: c.ink }, style]}>{children}</Text>;
};
/** Body text. `b` = extra bold. */
export const T = ({ children, style, b, numberOfLines }: TxtProps & { b?: boolean }) => {
  const c = useTheme();
  return <Text numberOfLines={numberOfLines} style={[{ fontFamily: b ? fonts.bodyHeavy : fonts.body, fontSize: 16, lineHeight: 22, color: c.ink }, style]}>{children}</Text>;
};
export const S = ({ children, style, b, numberOfLines }: TxtProps & { b?: boolean }) => {
  const c = useTheme();
  return <Text numberOfLines={numberOfLines} style={[{ fontFamily: b ? fonts.bodyHeavy : fonts.body, fontSize: 14, lineHeight: 19, color: c.muted }, style]}>{children}</Text>;
};
export const XS = ({ children, style, b, numberOfLines }: TxtProps & { b?: boolean }) => {
  const c = useTheme();
  return <Text numberOfLines={numberOfLines} style={[{ fontFamily: b ? fonts.bodyHeavy : fonts.body, fontSize: 12.5, lineHeight: 16, color: c.muted }, style]}>{children}</Text>;
};
export const Label = ({ children, style }: TxtProps) => {
  const c = useTheme();
  return <Text style={[{ fontFamily: fonts.bodyHeavy, fontSize: 14, color: c.ink, marginBottom: 6 }, style]}>{children}</Text>;
};

type BtnKind = 'primary' | 'sec' | 'soft' | 'txt' | 'dark';

export function Btn({
  title,
  onPress,
  kind = 'primary',
  sm,
  icon,
  disabled,
  loading,
  style,
  grow,
  color,
}: {
  title?: string;
  onPress?: () => void;
  kind?: BtnKind;
  sm?: boolean;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  grow?: boolean;
  color?: string;
}) {
  const c = useTheme();
  const look: Record<BtnKind, { bg: string; fg: string; border: string }> = {
    primary: { bg: c.primary, fg: c.onPrimary, border: 'transparent' },
    sec: { bg: c.card, fg: c.ink, border: c.line },
    soft: { bg: c.tint, fg: c.tintInk, border: 'transparent' },
    txt: { bg: 'transparent', fg: c.primary, border: 'transparent' },
    dark: { bg: c.ink, fg: c.bg, border: 'transparent' },
  };
  const l = look[kind];
  const fg = color ?? l.fg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: sm ? 44 : kind === 'txt' ? 48 : 56,
          paddingHorizontal: sm ? 18 : 24,
          borderRadius: 28,
          borderWidth: 2,
          borderColor: l.border,
          backgroundColor: l.bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
          alignSelf: sm && !grow ? 'flex-start' : 'stretch',
        },
        grow && { flex: 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon n={icon} s={sm ? 18 : 22} color={fg} /> : null}
      {title ? (
        <Text style={{ fontFamily: fonts.head, fontSize: sm ? 15 : 18, color: fg, textDecorationLine: kind === 'txt' ? 'underline' : 'none' }}>{title}</Text>
      ) : null}
    </Pressable>
  );
}

export function Chip({ label, on, onPress, icon, style }: { label: string; on?: boolean; onPress?: () => void; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      onPress={onPress}
      style={[
        {
          minHeight: 44,
          paddingHorizontal: 16,
          borderRadius: 22,
          borderWidth: 2,
          borderColor: on ? c.primary : c.line,
          backgroundColor: on ? c.tint : c.card,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        },
        style,
      ]}
    >
      {icon ? <Icon n={icon} s={16} color={on ? c.tintInk : c.ink} /> : null}
      <Text style={{ fontFamily: fonts.head, fontSize: 15, color: on ? c.tintInk : c.ink }}>{label}</Text>
    </Pressable>
  );
}

/** Filled pill toggle used on Mood / Add items / Split (selected = solid primary). */
export function Toggle({ label, on, onPress, icon, grow, style }: { label: string; on: boolean; onPress: () => void; icon?: IconName; grow?: boolean; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[
        {
          minHeight: 48,
          paddingHorizontal: 18,
          borderRadius: 26,
          borderWidth: 2,
          borderColor: on ? c.primary : c.line,
          backgroundColor: on ? c.primary : c.card,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        grow && { flex: 1 },
        style,
      ]}
    >
      {icon ? <Icon n={icon} s={22} color={on ? c.onPrimary : c.ink} /> : null}
      <Text style={{ fontFamily: fonts.head, fontSize: 16, color: on ? c.onPrimary : c.ink }}>{label}</Text>
    </Pressable>
  );
}

/** Segmented control inside a rounded track. */
export function Segment<V extends string>({ options, value, onChange, track }: { options: V[]; value: V; onChange: (v: V) => void; track?: 'line' | 'card' }) {
  const c = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 4,
        padding: 4,
        borderRadius: 28,
        backgroundColor: track === 'line' ? c.line : c.card,
        borderWidth: track === 'line' ? 0 : 2,
        borderColor: c.line,
      }}
    >
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={o}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o)}
            style={{ flex: 1, minHeight: 42, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.primary : 'transparent' }}
          >
            <Text style={{ fontFamily: fonts.head, fontSize: 15, color: on ? c.onPrimary : c.ink }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Pill({ label, kind, icon, style }: { label: string; kind?: 'g' | 'w' | 'p'; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  const bg = kind === 'g' ? c.greenTint : kind === 'w' ? c.warnTint : kind === 'p' ? c.primary : c.tint;
  const fg = kind === 'g' ? c.green : kind === 'w' ? c.warn : kind === 'p' ? c.onPrimary : c.tintInk;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: bg, alignSelf: 'flex-start' }, style]}>
      {icon ? <Icon n={icon} s={14} color={fg} /> : null}
      <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 12.5, color: fg }}>{label}</Text>
    </View>
  );
}

export function Card({ children, style, onPress, flat }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; flat?: boolean }) {
  const c = useTheme();
  const base: ViewStyle = {
    backgroundColor: c.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: c.line,
    shadowColor: '#50280A',
    shadowOpacity: flat ? 0 : c.dark ? 0.4 : 0.1,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
    elevation: flat ? 0 : 2,
  };
  if (onPress)
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [base, style, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  return <View style={[base, style]}>{children}</View>;
}

export function Banner({ children, kind, icon, onPress, style }: { children: ReactNode; kind?: 'w' | 'g' | 'dark'; icon?: IconName; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  const bg = kind === 'w' ? c.warnTint : kind === 'g' ? c.greenTint : kind === 'dark' ? c.ink : c.tint;
  const fg = kind === 'w' ? c.warn : kind === 'g' ? c.green : kind === 'dark' ? c.bg : c.tintInk;
  const content = (
    <>
      {icon ? <Icon n={icon} s={20} color={fg} /> : null}
      <Text style={{ flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 18, color: fg }}>{children}</Text>
      {onPress ? <Icon n="chevron" s={18} color={fg} /> : null}
    </>
  );
  const st: StyleProp<ViewStyle> = [{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: bg }, style];
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={st}>
      {content}
    </Pressable>
  ) : (
    <View style={st}>{content}</View>
  );
}

export function Field({ icon, right, style, ...p }: TextInputProps & { icon?: IconName; right?: ReactNode }) {
  const c = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingHorizontal: 16, borderRadius: 18, borderWidth: 2, borderColor: c.line, backgroundColor: c.card }, style as ViewStyle]}>
      {icon ? <Icon n={icon} s={20} color={c.ink} /> : null}
      <TextInput placeholderTextColor={c.muted} {...p} style={{ flex: 1, minHeight: 50, fontFamily: fonts.body, fontSize: 16, color: c.ink }} />
      {right}
    </View>
  );
}

export function Switch({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={{ width: 52, height: 32, borderRadius: 16, backgroundColor: on ? c.primary : c.line, justifyContent: 'center' }}
    >
      <View style={{ position: 'absolute', top: 4, left: on ? 24 : 4, width: 24, height: 24, borderRadius: 12, backgroundColor: on && c.dark ? '#2A1405' : '#fff' }} />
    </Pressable>
  );
}

export function IconBtn({ n, onPress, label, fill, color, size = 24, filled, style }: { n: IconName; onPress?: () => void; label: string; fill?: boolean; color?: string; size?: number; filled?: boolean; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={[
        { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
        fill && { backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
        style,
      ]}
    >
      <Icon n={n} s={size} color={color ?? c.ink} fill={filled} />
    </Pressable>
  );
}

export function TopBar({ title, sub, back = true, onBack, right, big }: { title?: string; sub?: string; back?: boolean; onBack?: () => void; right?: ReactNode; big?: boolean }) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 60, paddingHorizontal: big ? 20 : 10 }}>
      {back ? <IconBtn n="back" label="Back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')))} /> : null}
      <View style={{ flex: 1 }}>
        {big ? <H1>{title}</H1> : title ? <H2 numberOfLines={1}>{title}</H2> : null}
        {sub ? <XS b={!title} style={!title ? { color: c.muted } : undefined}>{sub}</XS> : null}
      </View>
      {right}
    </View>
  );
}

/** Full screen with safe areas, optional scrolling body and sticky footer. */
export function Screen({
  children,
  top,
  foot,
  scroll = true,
  gap = 16,
  bodyStyle,
  footStyle,
  bg,
  edgesBottom = true,
}: {
  children?: ReactNode;
  top?: ReactNode;
  foot?: ReactNode;
  scroll?: boolean;
  gap?: number;
  bodyStyle?: StyleProp<ViewStyle>;
  footStyle?: StyleProp<ViewStyle>;
  bg?: string;
  edgesBottom?: boolean;
}) {
  const c = useTheme();
  const ins = useSafeAreaInsets();
  const body: StyleProp<ViewStyle> = [{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24, gap }, bodyStyle];
  return (
    <View style={{ flex: 1, backgroundColor: bg ?? c.bg, paddingTop: ins.top }}>
      {top}
      {scroll ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={body} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, body]}>{children}</View>
      )}
      {foot ? <View style={[{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: edgesBottom ? Math.max(ins.bottom, 16) + 8 : 12, gap: 6 }, footStyle]}>{foot}</View> : null}
    </View>
  );
}

/** Striped placeholder used where the design shows a photo. */
export function Photo({ icon = 'utensils', h, w, r = 20, label, children, style }: { icon?: IconName; h: number; w?: number; r?: number; label?: string; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  const stripes = Array.from({ length: 24 });
  return (
    <View style={[{ height: h, width: w ?? '100%', borderRadius: r, overflow: 'hidden', backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      <View style={{ position: 'absolute', top: -200, left: -200, right: -200, bottom: -200, flexDirection: 'row', transform: [{ rotate: '45deg' }] }}>
        {stripes.map((_, i) => (
          <View key={i} style={{ width: 14, backgroundColor: i % 2 ? c.bg : c.tint }} />
        ))}
        {stripes.map((_, i) => (
          <View key={'b' + i} style={{ width: 14, backgroundColor: i % 2 ? c.bg : c.tint }} />
        ))}
      </View>
      <Icon n={icon} s={Math.min(44, Math.max(20, h / 3))} color={c.tintInk} />
      {label ? <XS b style={{ color: c.tintInk, marginTop: 6 }}>{label}</XS> : null}
      {children}
    </View>
  );
}

export function Progress({ pct, h = 8 }: { pct: number; h?: number }) {
  const c = useTheme();
  return (
    <View style={{ flex: 1, height: h, borderRadius: h / 2, backgroundColor: c.line, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', borderRadius: h / 2, backgroundColor: c.primary }} />
    </View>
  );
}

/** Bottom sheet over a scrim. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const c = useTheme();
  const ins = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable accessibilityLabel="Close sheet" onPress={onClose} style={{ flex: 1, backgroundColor: c.scrim }} />
        <SheetBody c={c} bottom={ins.bottom}>
          {children}
        </SheetBody>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function SheetBody({ children, c, bottom }: { children: ReactNode; c: Colors; bottom: number }) {
  return (
    <View style={{ backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingHorizontal: 20, paddingBottom: Math.max(bottom, 16) + 12, gap: 14 }}>
      <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: c.line, alignSelf: 'center' }} />
      {children}
    </View>
  );
}

export function Row({ children, gap = 12, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function ListRow({ children, onPress, style, last }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; last?: boolean }) {
  const c = useTheme();
  const st: StyleProp<ViewStyle> = [{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }, style];
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [st, pressed && { opacity: 0.7 }]}>
      {children}
    </Pressable>
  ) : (
    <View style={st}>{children}</View>
  );
}

/** Big square shortcut button (Gallery / Saved / More / Surprise…). */
export function Tile({ icon, label, onPress, iconColor }: { icon: IconName; label: string; onPress: () => void; iconColor?: string }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, minHeight: 72, borderRadius: 20, backgroundColor: c.card, borderWidth: 2, borderColor: c.line, alignItems: 'center', justifyContent: 'center', gap: 4, opacity: pressed ? 0.8 : 1 })}
    >
      <Icon n={icon} s={26} color={iconColor ?? c.primary} />
      <S b style={{ color: c.ink }}>{label}</S>
    </Pressable>
  );
}

/** Small toast-style confirmation shown at the top of a screen. */
export function Toast({ text }: { text: string | null }) {
  const c = useTheme();
  if (!text) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 20, right: 20, top: 70, zIndex: 10 }}>
      <Banner kind="dark" icon="check">
        {text}
      </Banner>
    </View>
  );
}

export function Empty({ mood = 'sleepy', text, cta, onCta }: { mood?: 'sleepy' | 'happy' | 'surprised'; text: string; cta?: string; onCta?: () => void }) {
  return (
    <View style={{ alignItems: 'center', gap: 16, paddingTop: 50 }}>
      <Capy mood={mood} size={130} />
      <H3 style={{ maxWidth: 250, textAlign: 'center' }}>{text}</H3>
      {cta ? <Btn sm title={cta} onPress={onCta} style={{ alignSelf: 'center' }} /> : null}
    </View>
  );
}
