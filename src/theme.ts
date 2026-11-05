import { useColorScheme } from 'react-native';
import { useStore } from './store';

const light = {
  bg: '#FFF8EB',
  card: '#FFFFFF',
  ink: '#3F2518',
  muted: '#6F5646',
  line: '#EEDFC4',
  primary: '#B05A14',
  onPrimary: '#FFFFFF',
  tint: '#FBE8C3',
  tintInk: '#6B3507',
  green: '#2F6B2B',
  greenTint: '#E3F0CC',
  warn: '#B3261E',
  warnTint: '#FDE2DC',
  butter: '#FFD166',
  lime: '#A4CF63',
  scrim: 'rgba(46,31,23,0.55)',
  shadow: 'rgba(80,40,10,0.10)',
  dark: false,
};

export type Colors = typeof light;

const dark: Colors = {
  bg: '#1E140D',
  card: '#2B1D13',
  ink: '#FBEFD9',
  muted: '#CDB89B',
  line: '#43301F',
  primary: '#F0A94E',
  onPrimary: '#2A1405',
  tint: '#4A3016',
  tintInk: '#FFD9A0',
  green: '#A9D88C',
  greenTint: '#2D3B1F',
  warn: '#FF9A8F',
  warnTint: '#4D221E',
  butter: '#FFD166',
  lime: '#A4CF63',
  scrim: 'rgba(0,0,0,0.6)',
  shadow: 'rgba(0,0,0,0.4)',
  dark: true,
};

export const fonts = {
  head: 'Fredoka_600SemiBold',
  headBold: 'Fredoka_700Bold',
  body: 'Nunito_400Regular',
  bodyBold: 'Nunito_700Bold',
  bodyHeavy: 'Nunito_800ExtraBold',
};

export function useTheme(): Colors {
  const pref = useStore((s) => s.settings.theme);
  const system = useColorScheme();
  const isDark = pref === 'dark' || (pref === 'auto' && system === 'dark');
  return isDark ? dark : light;
}

/** Person avatar colours, same order as the design's palette(). */
export function personColors(c: Colors, i: number): [string, string] {
  const p: [string, string][] = [
    [c.primary, c.onPrimary],
    [c.green, c.card],
    [c.ink, c.bg],
    [c.butter, '#2E1F17'],
  ];
  return p[i % p.length];
}
