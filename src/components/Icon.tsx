import Svg, { Path } from 'react-native-svg';
import { ICON_PATHS, IconName } from './iconPaths';

export type { IconName };

export function Icon({ n, s = 24, color, fill = false }: { n: IconName; s?: number; color: string; fill?: boolean }) {
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={ICON_PATHS[n]} />
    </Svg>
  );
}
