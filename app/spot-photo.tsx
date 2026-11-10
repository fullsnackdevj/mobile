import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Image, PanResponder, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_FOCUS, MAX_ZOOM, placePhoto, SpotImage, usePhotoSize } from '../src/components/SpotImage';
import { Btn, Empty, IconBtn, Label, Row, S, Screen, T, TopBar, XS } from '../src/components/ui';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';
import type { PhotoFocus } from '../src/types';

/** Drag and zoom a spot photo to choose what its header and thumbnails show. */
export default function AdjustSpotPhoto() {
  const c = useTheme();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const ins = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const place = useStore((s) => s.places.find((p) => p.name === name));
  const savePlace = useStore((s) => s.savePlace);
  const [focus, setFocus] = useState<PhotoFocus>(place?.photoFocus ?? DEFAULT_FOCUS);
  const img = usePhotoSize(place?.photo);

  // As big as fits: the editor never scrolls, so dragging the photo can't fight with scrolling.
  const side = Math.round(Math.max(180, Math.min(screenW - 40, 340, screenH - ins.top - ins.bottom - 420)));
  const frame = { w: side, h: side };

  // Keep the centre point where the photo still covers the whole frame at this zoom.
  const clampFocus = (f: PhotoFocus): PhotoFocus => {
    const zoom = Math.min(MAX_ZOOM, Math.max(1, f.zoom));
    if (!img) return { ...f, zoom };
    const p = placePhoto(img, frame, { x: 0.5, y: 0.5, zoom });
    const hx = frame.w / 2 / p.width;
    const hy = frame.h / 2 / p.height;
    return { zoom, x: Math.min(1 - hx, Math.max(hx, f.x)), y: Math.min(1 - hy, Math.max(hy, f.y)) };
  };

  const live = useRef(focus);
  live.current = focus;
  const start = useRef({ focus, dist: 0 });
  const dist = (t: readonly { pageX: number; pageY: number }[]) => Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const t = e.nativeEvent.touches;
          start.current = { focus: live.current, dist: t && t.length >= 2 ? dist(t) : 0 };
        },
        onPanResponderMove: (e, g) => {
          if (!img) return;
          const t = e.nativeEvent.touches;
          // Two fingers: pinch to zoom.
          if (t && t.length >= 2) {
            if (!start.current.dist) start.current = { focus: live.current, dist: dist(t) };
            setFocus(clampFocus({ ...start.current.focus, zoom: (start.current.focus.zoom * dist(t)) / start.current.dist }));
            return;
          }
          // One finger: drag the photo (it moves with your finger).
          const p = placePhoto(img, frame, start.current.focus);
          setFocus(clampFocus({ ...start.current.focus, x: start.current.focus.x - g.dx / p.width, y: start.current.focus.y - g.dy / p.height }));
        },
        onPanResponderRelease: () => (start.current.dist = 0),
      }),
    [img, side]
  );

  if (!place?.photo) {
    return (
      <Screen top={<TopBar title="Adjust photo" />}>
        <Empty text="This spot doesn't have a photo yet." />
      </Screen>
    );
  }

  const zoomBy = (d: number) => setFocus(clampFocus({ ...focus, zoom: Math.round((focus.zoom + d) * 4) / 4 }));
  const shown = img ? placePhoto(img, frame, focus) : null;

  return (
    <Screen
      top={<TopBar title="Adjust photo" sub={place.name} />}
      scroll={false}
      gap={14}
      foot={
        <Btn
          title="Save"
          onPress={() => {
            savePlace(place.name, { photoFocus: clampFocus(focus) });
            router.back();
          }}
        />
      }
    >
      <S>Drag to move the photo. Pinch or use − and + to zoom.</S>
      <View
        {...pan.panHandlers}
        accessible
        accessibilityLabel="Photo position. Drag to move, pinch to zoom."
        style={{ width: side, height: side, alignSelf: 'center', borderRadius: 24, overflow: 'hidden', backgroundColor: c.tint }}
      >
        {shown ? <Image source={{ uri: place.photo }} style={{ position: 'absolute', ...shown }} /> : null}
        {/* Thirds grid to help line things up */}
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
          {[1, 2].map((k) => (
            <View key={'v' + k} style={{ position: 'absolute', top: 0, bottom: 0, left: (side * k) / 3, width: 1, backgroundColor: 'rgba(255,255,255,0.45)' }} />
          ))}
          {[1, 2].map((k) => (
            <View key={'h' + k} style={{ position: 'absolute', left: 0, right: 0, top: (side * k) / 3, height: 1, backgroundColor: 'rgba(255,255,255,0.45)' }} />
          ))}
        </View>
      </View>

      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={10}>
          <IconBtn n="minus" size={24} label="Zoom out" onPress={() => zoomBy(-0.25)} />
          <T b style={{ minWidth: 44, textAlign: 'center' }}>
            {focus.zoom.toFixed(2).replace(/\.?0+$/, '')}×
          </T>
          <IconBtn n="plus" size={24} label="Zoom in" onPress={() => zoomBy(0.25)} />
        </Row>
        <Btn kind="txt" sm title="Reset" onPress={() => setFocus(DEFAULT_FOCUS)} />
      </Row>

      <View style={{ gap: 8 }}>
        <Label style={{ marginBottom: 0 }}>Preview</Label>
        <Row gap={10}>
          <View style={{ flex: 1, gap: 4 }}>
            <SpotImage uri={place.photo} focus={focus} h={51} r={12} />
            <XS>Spot page</XS>
          </View>
          <View style={{ gap: 4 }}>
            <SpotImage uri={place.photo} focus={focus} w={100} h={51} r={12} />
            <XS>Home</XS>
          </View>
          <View style={{ gap: 4 }}>
            <SpotImage uri={place.photo} focus={focus} w={51} h={51} r={14} />
            <XS>List</XS>
          </View>
        </Row>
      </View>
    </Screen>
  );
}
