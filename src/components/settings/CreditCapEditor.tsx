import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useRipple } from '@/lib/theme';

interface CreditCapEditorProps {
  creditCap: number;
  onSave: (creditCap: number) => void;
}

export function CreditCapEditor({ creditCap, onSave }: CreditCapEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(String(creditCap));
  const ripple = useRipple();

  function handleSave() {
    const next = Number(input);
    if (!Number.isFinite(next) || next <= 0) return;
    onSave(next);
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <Pressable
        onPress={() => {
          setInput(String(creditCap));
          setIsEditing(true);
        }}
        android_ripple={ripple}
        className="flex-row items-center justify-between rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-900"
      >
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">Max credits per schedule</Text>
        <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{creditCap}</Text>
      </Pressable>
    );
  }

  return (
    <View className="flex-row items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 dark:bg-neutral-900">
      <Text className="flex-1 text-sm text-neutral-600 dark:text-neutral-400">Max credits per schedule</Text>
      <TextInput
        value={input}
        onChangeText={setInput}
        keyboardType="decimal-pad"
        autoFocus
        className="w-16 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-right text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
      />
      <Pressable onPress={handleSave} hitSlop={10} android_ripple={ripple} className="rounded-md p-1">
        <Text className="text-sm font-semibold text-violet-600 dark:text-violet-400">Save</Text>
      </Pressable>
    </View>
  );
}
