import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { RouteSheet } from '../src/components/RouteSheet';
import { Btn, Chip, Field, H2, IconBtn, Label, Row } from '../src/components/ui';
import { useStore } from '../src/store';

const AVOIDS = ['Peanuts', 'Shellfish', 'Dairy', 'No pork', 'No beef', 'Vegetarian', 'None'];

export default function AddPerson() {
  const addPerson = useStore((s) => s.addPerson);
  const [name, setName] = useState('');
  const [avoid, setAvoid] = useState<string[]>(['None']);

  const tog = (l: string) => {
    let nx: string[];
    if (l === 'None') nx = ['None'];
    else {
      nx = avoid.includes(l) ? avoid.filter((x) => x !== l) : avoid.filter((x) => x !== 'None').concat(l);
      if (!nx.length) nx = ['None'];
    }
    setAvoid(nx);
  };

  function add() {
    const n = name.trim();
    if (!n) return;
    addPerson({ name: n, avoids: avoid });
    router.replace({ pathname: '/add-items', params: { who: n } });
  }

  return (
    <RouteSheet>
      <Row style={{ justifyContent: 'space-between' }}>
        <H2>Add person</H2>
        <IconBtn n="close" size={22} label="Close" onPress={() => router.back()} />
      </Row>
      <View>
        <Label>Name</Label>
        <Field value={name} onChangeText={setName} placeholder="Friend's name" autoFocus autoCapitalize="words" />
      </View>
      <View style={{ gap: 8 }}>
        <Label style={{ marginBottom: 0 }}>Avoids</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {AVOIDS.map((a) => (
            <Chip key={a} label={a} on={avoid.includes(a)} onPress={() => tog(a)} />
          ))}
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <Btn title="Add" disabled={!name.trim()} onPress={add} />
        <Btn kind="txt" title="Cancel" onPress={() => router.back()} />
      </View>
    </RouteSheet>
  );
}
