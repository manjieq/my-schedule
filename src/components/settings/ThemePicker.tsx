import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getThemePreference, setThemePreference } from '@/lib/theme';
import type { ThemePreference } from '@/lib/models';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function ThemePicker() {
  // Starts at 'system' (the pre-restore default) and is corrected once the
  // saved preference read comes back — app/_layout.tsx already blocks
  // rendering until that same read resolves, so in practice this only
  // ever shows the already-correct value.
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    getThemePreference().then(setPreference);
  }, []);

  function handleSelect(next: ThemePreference) {
    setPreference(next);
    setThemePreference(next).catch(() => {
      // A failed theme-preference save just means it won't survive an app
      // restart — the choice still applies immediately for this session,
      // so this is a soft failure, not surfaced as a blocking error.
    });
  }

  return (
    <View className="flex-row gap-2">
      {OPTIONS.map((option) => {
        const selected = preference === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option.value)}
            className={`flex-1 items-center rounded-xl py-2.5 ${
              selected ? 'bg-blue-600' : 'bg-neutral-100 dark:bg-neutral-900'
            }`}
          >
            <Text
              className={`text-sm font-medium ${selected ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
