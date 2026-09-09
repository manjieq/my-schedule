import { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useRipple, usePanelColors } from '@/lib/theme';

interface CreditCapEditorProps {
  creditCap: number;
  onSave: (creditCap: number) => void;
}

/** The slot the running total has to fit inside. Reads as a filled-in field on
 *  a form; tapping it puts the caret in the box. */
export function CreditCapEditor({ creditCap, onSave }: CreditCapEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(String(creditCap));
  const ripple = useRipple();
  const c = usePanelColors();

  const parsed = Number(input);
  const isValid = Number.isFinite(parsed) && parsed > 0;

  function handleSave() {
    if (!isValid) return;
    onSave(parsed);
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
        accessibilityRole="button"
        accessibilityLabel={`Credit cap, currently ${creditCap}. Tap to change.`}
        className="min-h-12 flex-row items-center justify-between rounded-key border border-edge bg-key px-3 py-2"
      >
        <Text className="font-panel-semi text-code uppercase text-ink-2">Max credits</Text>
        <Text
          className="font-panel-bold text-item text-ink"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {creditCap.toFixed(1)}
        </Text>
      </Pressable>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(120)}
      className="flex-row items-center gap-2 rounded-key border border-edge bg-key px-3 py-2"
    >
      <Text className="flex-1 font-panel-semi text-code uppercase text-ink-2">Max credits</Text>
      <TextInput
        value={input}
        onChangeText={setInput}
        keyboardType="decimal-pad"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSave}
        selectionColor={c.ink}
        accessibilityLabel="Credit cap"
        className="min-h-12 w-16 rounded-well border border-edge bg-well px-2 text-right text-item text-ink"
      />
      <Pressable
        onPress={handleSave}
        disabled={!isValid}
        hitSlop={12}
        android_ripple={ripple}
        accessibilityRole="button"
        className="min-h-12 justify-center px-2 disabled:opacity-40"
      >
        <Text className="font-panel-semi text-code uppercase text-ink">Set</Text>
      </Pressable>
    </Animated.View>
  );
}
