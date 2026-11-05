import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { Btn, H2, T } from '../src/components/ui';
import { pickFromGallery, scanPrefs } from '../src/scan';
import { useStore } from '../src/store';
import { fonts } from '../src/theme';

const LANGS = ['Auto', 'English', 'Filipino', '日本語'];
const glass = 'rgba(255,255,255,0.14)';

export default function Camera() {
  const ins = useSafeAreaInsets();
  const [perm, request] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const set = useStore((s) => s.set);
  const [multi, setMulti] = useState(false);
  const [torch, setTorch] = useState(false);
  const [lang, setLang] = useState(scanPrefs.language);
  const [shots, setShots] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function shoot() {
    if (!cam.current || busy) return;
    setBusy(true);
    try {
      const p = await cam.current.takePictureAsync({ quality: 0.8, skipProcessing: false });
      if (!p) return;
      if (multi) setShots((s) => [...s, p.uri]);
      else {
        set({ photos: [p.uri] });
        router.replace('/scanning');
      }
    } finally {
      setBusy(false);
    }
  }

  function cycleLang() {
    const n = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
    scanPrefs.language = n;
    setLang(n);
  }

  if (!perm) return <View style={{ flex: 1, backgroundColor: '#151110' }} />;
  if (!perm.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#151110', padding: 32, justifyContent: 'center', gap: 16 }}>
        <H2 style={{ color: '#fff', textAlign: 'center' }}>Pickybara needs your camera to read menus</H2>
        <T style={{ color: '#ddd', textAlign: 'center' }}>Photos stay on your phone unless you choose to save them.</T>
        <Btn title="Allow camera" onPress={request} />
        <Btn kind="txt" title="Pick from gallery instead" color="#fff" onPress={() => pickFromGallery().then((ok) => ok && router.back())} />
        <Btn kind="txt" title="Close" color="#fff" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#151110' }}>
      <CameraView ref={cam} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} facing="back" enableTorch={torch} />
      <View style={{ paddingTop: ins.top + 8, height: ins.top + 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 6 }}>
        <Pressable accessibilityLabel="Close" onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: glass, alignItems: 'center', justifyContent: 'center' }}>
          <Icon n="close" s={24} color="#fff" />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Pressable accessibilityLabel={`Menu language: ${lang}`} onPress={cycleLang} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 16, borderRadius: 22, backgroundColor: glass }}>
            <Icon n="globe" s={18} color="#fff" />
            <Text style={{ fontFamily: fonts.head, fontSize: 15, color: '#fff' }}>Menu: {lang}</Text>
          </Pressable>
        </View>
        <Pressable accessibilityLabel="Flash" onPress={() => setTorch(!torch)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: torch ? '#FFD166' : glass, alignItems: 'center', justifyContent: 'center' }}>
          <Icon n="flash" s={22} color={torch ? '#2E1F17' : '#fff'} fill={torch} />
        </Pressable>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }} pointerEvents="none">
        <View style={{ width: 300, height: 390 }}>
          {(
            [
              { left: 0, top: 0, borderLeftWidth: 5, borderTopWidth: 5, borderTopLeftRadius: 22 },
              { right: 0, top: 0, borderRightWidth: 5, borderTopWidth: 5, borderTopRightRadius: 22 },
              { left: 0, bottom: 0, borderLeftWidth: 5, borderBottomWidth: 5, borderBottomLeftRadius: 22 },
              { right: 0, bottom: 0, borderRightWidth: 5, borderBottomWidth: 5, borderBottomRightRadius: 22 },
            ] as const
          ).map((st, i) => (
            <View key={i} style={[{ position: 'absolute', width: 56, height: 56, borderColor: '#fff' }, st]} />
          ))}
        </View>
        <View style={{ backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}>
          <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: '#fff', textAlign: 'center' }}>
            {multi && shots.length ? `Page ${shots.length} captured. Next page?` : 'Hold steady and fit the whole menu in frame'}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: ins.bottom + 20, alignItems: 'center', gap: 18 }}>
        <View style={{ flexDirection: 'row', backgroundColor: glass, borderRadius: 24, padding: 4, gap: 4 }}>
          {[
            ['Single Photo', false],
            ['Multi-Photo', true],
          ].map(([label, m]) => {
            const on = multi === m;
            return (
              <Pressable key={label as string} onPress={() => setMulti(m as boolean)} style={{ minHeight: 44, paddingHorizontal: 16, borderRadius: 22, justifyContent: 'center', backgroundColor: on ? '#fff' : 'transparent' }}>
                <Text style={{ fontFamily: fonts.head, fontSize: 15, color: on ? '#2E1F17' : '#fff' }}>{label as string}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 12 }}>
          <Pressable accessibilityLabel="Pick from gallery" onPress={() => pickFromGallery()} style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: glass, alignItems: 'center', justifyContent: 'center' }}>
            <Icon n="image" s={26} color="#fff" />
          </Pressable>
          <Pressable accessibilityLabel="Take photo" onPress={shoot} style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            {busy ? <ActivityIndicator color="#fff" /> : <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: '#fff' }} />}
          </Pressable>
          {multi && shots.length ? (
            <Pressable
              accessibilityLabel={`Review ${shots.length} photos`}
              onPress={() => {
                set({ photos: shots });
                router.replace('/multi-photo');
              }}
              style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: '#FFD166', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: fonts.headBold, fontSize: 18, color: '#2E1F17' }}>{shots.length}</Text>
              <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 10, color: '#2E1F17' }}>DONE</Text>
            </Pressable>
          ) : (
            <View style={{ width: 56 }} />
          )}
        </View>
      </View>
    </View>
  );
}
