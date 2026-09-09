// Saving the working sheet as a named loadout.
//
// This was a form pinned to the bottom of the Schedule screen's scroll. It is
// its own modal now so the Schedule screen can be one printed page and nothing
// else. Same action, same default naming, same disabled rule — only the place
// it lives changed.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Lcd } from '@/components/panel/Lcd';
import { SevenSegment } from '@/components/panel/SevenSegment';
import { useAppState } from '@/lib/app-state';
import { sumCredits } from '@/lib/credits';
import { useRipple, usePanelColors } from '@/lib/theme';

export default function SaveLoadoutScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const c = usePanelColors();
  const ripple = useRipple(true);

  const [name, setName] = useState('');
  const fallbackName = `Loadout ${state.loadouts.length + 1}`;

  const includedIdSet = new Set(state.includedIds);
  const included = state.classes.filter((cl) => includedIdSet.has(cl.id));
  const total = sumCredits(included);

  function handleSave() {
    dispatch({ type: 'SAVE_LOADOUT', name: name.trim() || fallbackName });
    router.back();
  }

  return (
    <View className="flex-1 bg-stock px-4 pt-5">
      <Text className="font-panel-semi text-micro uppercase text-ink-2">Issuing revision</Text>

      {/* What is being filed, said by the readout rather than by a styled
          number — the instrument has one place it reports a total. */}
      <Lcd
        className="mt-2"
        trace={`${included.length} class${included.length === 1 ? '' : 'es'} called · cap ${state.creditCap.toFixed(1)}`}
        legend="Total"
      >
        <SevenSegment value={total.toFixed(1)} size={30} />
      </Lcd>

      <Text className="mt-5 font-panel-semi text-micro uppercase text-ink-2">Name this loadout</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={fallbackName}
        placeholderTextColor={c.ink3}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSave}
        className="mt-1.5 rounded-well border border-edge bg-key px-3 py-3 text-item text-ink"
      />
      <Text className="mt-1.5 font-panel-semi text-code text-ink-3">
        Left blank, it is filed as “{fallbackName}”.
      </Text>

      <Pressable
        onPress={handleSave}
        android_ripple={ripple}
        accessibilityRole="button"
        className="mt-6 min-h-12 items-center justify-center rounded-key bg-accent"
      >
        <Text className="font-panel-bold text-meta uppercase text-accent-on">Save loadout</Text>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        className="mt-2 min-h-12 items-center justify-center"
      >
        <Text className="font-panel-semi text-code uppercase text-ink-2">Cancel</Text>
      </Pressable>
    </View>
  );
}
