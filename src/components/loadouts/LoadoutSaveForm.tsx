// Ported unchanged (structurally) from course-scheduler-mobile's
// components/loadouts/LoadoutSaveForm.tsx.
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface LoadoutSaveFormProps {
  disabled: boolean;
  existingCount: number;
  onSave: (name: string) => void;
}

export function LoadoutSaveForm({ disabled, existingCount, onSave }: LoadoutSaveFormProps) {
  const [name, setName] = useState('');

  function handleSubmit() {
    const trimmed = name.trim() || `Loadout ${existingCount + 1}`;
    onSave(trimmed);
    setName('');
  }

  return (
    <View className="gap-2">
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={`Loadout ${existingCount + 1}`}
        placeholderTextColor="#9ca3af"
        editable={!disabled}
        className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
      />
      <Pressable
        onPress={handleSubmit}
        disabled={disabled}
        className="items-center rounded-xl bg-neutral-900 py-3 disabled:opacity-50 dark:bg-neutral-100"
      >
        <Text className="text-sm font-medium text-white dark:text-neutral-900">Save current schedule as loadout</Text>
      </Pressable>
    </View>
  );
}
