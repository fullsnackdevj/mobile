import { useEffect, useState } from 'react';
import { Image, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { PhotoFocus } from '../types';

export const DEFAULT_FOCUS: PhotoFocus = { x: 0.5, y: 0.5, zoom: 1 };
export const MAX_ZOOM = 3;

const sizes = new Map<string, { w: number; h: number }>();

/** The photo's real width and height (cached), or null while loading. */
export function usePhotoSize(uri?: string) {
  const [size, setSize] = useState(uri ? (sizes.get(uri) ?? null) : null);
  useEffect(() => {
    if (!uri) return setSize(null);
    const known = sizes.get(uri);
    if (known) return setSize(known);
    let live = true;
    Image.getSize(
      uri,
      (w, h) => {
        sizes.set(uri, { w, h });
        if (live) setSize({ w, h });
      },
      () => live && setSize(null)
    );
    return () => {
      live = false;
    };
  }, [uri]);
  return size;
}

/**
 * Where to draw the photo so it fills a w×h frame, zoomed and centred on `focus`,
 * without ever showing empty space at the edges.
 */
export function placePhoto(img: { w: number; h: number }, frame: { w: number; h: number }, focus: PhotoFocus) {
  const scale = Math.max(frame.w / img.w, frame.h / img.h) * Math.min(MAX_ZOOM, Math.max(1, focus.zoom));
  const dw = img.w * scale;
  const dh = img.h * scale;
  const clamp = (v: number, lo: number) => Math.min(0, Math.max(lo, v));
  return { width: dw, height: dh, left: clamp(frame.w / 2 - focus.x * dw, frame.w - dw), top: clamp(frame.h / 2 - focus.y * dh, frame.h - dh) };
}

/** A spot photo cropped to any frame using the saved position and zoom. */
export function SpotImage({ uri, focus, w, h, r = 16, style }: { uri: string; focus?: PhotoFocus; w?: number; h: number; r?: number; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  const img = usePhotoSize(uri);
  const [width, setWidth] = useState(w ?? 0);
  const frame = { w: w ?? width, h };
  return (
    <View
      onLayout={w ? undefined : (e) => setWidth(e.nativeEvent.layout.width)}
      style={[{ width: w, height: h, borderRadius: r, overflow: 'hidden', backgroundColor: c.tint }, style]}
    >
      {img && frame.w ? <Image source={{ uri }} style={{ position: 'absolute', ...placePhoto(img, frame, focus ?? DEFAULT_FOCUS) }} /> : null}
    </View>
  );
}
