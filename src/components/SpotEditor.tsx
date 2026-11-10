import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { currentPlace } from '../spots';
import { useStore } from '../store';
import { useTheme } from '../theme';
import type { Place } from '../types';
import { Btn, Field, H2, Label, Sheet, XS } from './ui';

/**
 * Add or edit a spot's details. `name` is the spot being edited, or '' to add a new one.
 * Calls onSaved with the final name.
 */
export function SpotEditor({ visible, name, onClose, onSaved }: { visible: boolean; name: string; onClose: () => void; onSaved?: (name: string) => void }) {
  const c = useTheme();
  const places = useStore((s) => s.places);
  const menus = useStore((s) => s.menus);
  const savePlace = useStore((s) => s.savePlace);
  const renamePlace = useStore((s) => s.renamePlace);
  const deletePlace = useStore((s) => s.deletePlace);
  const place = places.find((p) => p.name.toLowerCase() === name.toLowerCase());

  const [title, setTitle] = useState(name);
  const [address, setAddress] = useState(place?.address ?? '');
  const [coords, setCoords] = useState<Pick<Place, 'lat' | 'lng'>>({ lat: place?.lat, lng: place?.lng });
  const [notes, setNotes] = useState(place?.notes ?? '');
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState('');

  // Reset the form each time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setTitle(name);
    setAddress(place?.address ?? '');
    setCoords({ lat: place?.lat, lng: place?.lng });
    setNotes(place?.notes ?? '');
    setErr('');
  }, [visible]);

  async function locate() {
    setErr('');
    setLocating(true);
    try {
      const here = await currentPlace();
      setAddress(here.address);
      setCoords({ lat: here.lat, lng: here.lng });
    } catch (e: any) {
      setErr(e?.message || "Couldn't get your location.");
    } finally {
      setLocating(false);
    }
  }

  function save() {
    const next = title.trim();
    if (!next) return setErr('Give the spot a name.');
    const taken = next.toLowerCase() !== name.toLowerCase() && (places.some((p) => p.name.toLowerCase() === next.toLowerCase()) || menus.some((m) => m.restaurant.toLowerCase() === next.toLowerCase()));
    if (taken) return setErr(`You already have a spot called ${next}.`);
    if (name && next !== name) renamePlace(name, next);
    // Typing a new address drops the old map pin, unless "Use my location" just set one.
    const pinned = address.trim() === (place?.address ?? '') || coords.lat !== place?.lat;
    savePlace(next, { address: address.trim() || undefined, notes: notes.trim() || undefined, lat: pinned ? coords.lat : undefined, lng: pinned ? coords.lng : undefined });
    onSaved?.(next);
    onClose();
  }

  return (
    <Sheet visible={visible} onClose={onClose}>
      <H2>{name ? 'Edit spot' : 'Add a spot'}</H2>
      <View style={{ gap: 6 }}>
        <Label style={{ marginBottom: 0 }}>Name</Label>
        <Field placeholder="e.g. Starbucks BGC High Street" value={title} onChangeText={setTitle} autoFocus={!name} />
      </View>
      <View style={{ gap: 6 }}>
        <Label style={{ marginBottom: 0 }}>Location</Label>
        <Field icon="map" placeholder="Address or landmark" value={address} onChangeText={setAddress} />
        <Btn kind="soft" sm icon="nav" title={locating ? 'Finding you…' : 'Use my location'} disabled={locating} onPress={locate} />
      </View>
      <View style={{ gap: 6 }}>
        <Label style={{ marginBottom: 0 }}>Notes</Label>
        <Field placeholder="Parking, best seats, wifi password…" value={notes} onChangeText={setNotes} multiline />
      </View>
      {err ? <XS style={{ color: c.warn }}>{err}</XS> : null}
      <Btn title="Save spot" onPress={save} />
      {place ? (
        <Btn
          kind="txt"
          title="Remove saved details"
          onPress={() =>
            Alert.alert('Remove saved details?', 'The photo, location and notes are removed. Menus and history stay.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                  deletePlace(place.name);
                  onClose();
                },
              },
            ])
          }
        />
      ) : null}
    </Sheet>
  );
}
