import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getThemePreference, setThemePreference, useRipple } from '@/lib/theme';
import type { ThemePreference } from '@/lib/models';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Stock' },
  { value: 'dark', label: 'Negative' },
];

/** Light and dark are named for what they actually are in this world — the
 *  printed sheet and its photostat negative — with "System" left plain because
 *  it names the phone's setting, not the sheet. */
export function ThemePicker() {
  // Starts at 'system' (the pre-restore default) and is corrected once the
  // saved preference read comes back — app/_layout.tsx already blocks
  // rendering until that same read resolves, so in practice this only
  // ever shows the already-correct value.
  const [preference, setPreference] = useState<ThemePreference>('system');
  const rippleNeutral = useRipple(false);
  const rippleOnFill = useRipple(true);

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
    <View className="flex-row overflow-hidden rounded-key border border-edge">
      {OPTIONS.map((option, i) => {
        const selected = preference === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option.value)}
            android_ripple={selected ? rippleOnFill : rippleNeutral}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`min-h-12 flex-1 items-center justify-center ${i > 0 ? 'border-l border-edge' : ''} ${
              selected ? 'bg-accent' : 'bg-key'
            }`}
          >
            <Text
              className={`font-panel-semi text-code uppercase ${selected ? 'text-accent-on' : 'text-ink-2'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
