import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { deleteSpotPhoto } from '../spots';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Btn, Card, H2, ListRow, S, Sheet, Switch, T, XS } from './ui';

/** Confirms deleting a spot, says exactly what goes, and optionally removes your visits there too. */
export function DeleteSpotSheet({ name, visible, onClose, onDeleted }: { name: string; visible: boolean; onClose: () => void; onDeleted?: () => void }) {
  const c = useTheme();
  const places = useStore((s) => s.places);
  const menus = useStore((s) => s.menus);
  const history = useStore((s) => s.history);
  const deleteSpot = useStore((s) => s.deleteSpot);
  const [withHistory, setWithHistory] = useState(false);
  useEffect(() => {
    if (visible) setWithHistory(false);
  }, [visible]);

  const k = name.trim().toLowerCase();
  const place = places.find((p) => p.name.toLowerCase() === k);
  const menuCount = menus.filter((m) => m.restaurant.trim().toLowerCase() === k).length;
  const visits = history.filter((h) => h.restaurant.trim().toLowerCase() === k).length;

  const parts = [
    place?.photo ? 'the photo' : '',
    place?.address || place?.lat != null ? 'location' : '',
    place?.notes ? 'notes' : '',
    menuCount ? `${menuCount} scanned ${menuCount === 1 ? 'menu' : 'menus'}` : '',
    'favorites from here',
  ].filter(Boolean);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];

  return (
    <Sheet visible={visible} onClose={onClose}>
      <H2>Delete {name}?</H2>
      <T>
        This removes {list}. You can't undo this.
      </T>
      {visits ? (
        <Card flat>
          <ListRow last>
            <View style={{ flex: 1 }}>
              <T b>Also delete my visits</T>
              <XS>
                {visits} {visits === 1 ? 'pick' : 'picks'} in History. Pickybara uses them to learn your taste.
              </XS>
            </View>
            <Switch label="Also delete my visits" on={withHistory} onPress={() => setWithHistory(!withHistory)} />
          </ListRow>
        </Card>
      ) : null}
      <S>Saved order lists stay in History.</S>
      <View style={{ gap: 6 }}>
        <Btn
          title="Delete spot"
          icon="trash"
          color="#fff"
          style={{ backgroundColor: c.warn, borderColor: c.warn }}
          onPress={() => {
            deleteSpotPhoto(place?.photo);
            deleteSpot(name, withHistory);
            onClose();
            onDeleted?.();
          }}
        />
        <Btn kind="txt" title="Cancel" onPress={onClose} />
      </View>
    </Sheet>
  );
}
