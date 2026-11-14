import { Pressable, Text, View } from 'react-native';

import {
  BUS_PERIODS,
  PERIOD_LABELS,
  effectivePeriod,
  guessPeriod,
  isOverrideActive,
  type BusPeriod,
  type BusPeriodOverride,
} from '@/lib/bus';
import { useRipple } from '@/lib/theme';

interface BusPeriodPickerProps {
  override: BusPeriodOverride | null;
  onChange: (override: BusPeriodOverride | null) => void;
}

/**
 * Which shuttle timetable to use. Auto guesses from the date (lib/bus.ts's
 * guessPeriod); picking a table records which guess it replaced, so the
 * choice lapses on its own when the term changes rather than silently
 * running the wrong table for months.
 */
export function BusPeriodPicker({ override, onChange }: BusPeriodPickerProps) {
  const rippleNeutral = useRipple(false);
  const rippleOnFill = useRipple(true);
  const now = new Date();
  const guess = guessPeriod(now);
  const manual = isOverrideActive(now, override);
  const current = effectivePeriod(now, override);

  const options: { value: BusPeriod | 'auto'; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    ...BUS_PERIODS.map((p) => ({ value: p, label: PERIOD_LABELS[p] })),
  ];

  function handleSelect(value: BusPeriod | 'auto') {
    // Choosing the table the guess would pick anyway is the same as Auto.
    if (value === 'auto' || value === guess) onChange(null);
    else onChange({ period: value, over: guess });
  }

  return (
    <View>
      <View className="flex-row overflow-hidden rounded-key border border-edge">
        {options.map((option, i) => {
          const selected = option.value === 'auto' ? !manual : manual && option.value === current;
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
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="mt-1.5 text-meta text-ink-2">
        {manual
          ? `Set to ${PERIOD_LABELS[current]} until the term changes. Auto would pick ${PERIOD_LABELS[guess]}.`
          : `Auto picks ${PERIOD_LABELS[guess]} from today's date. Pick a table if that is wrong — it lasts until the term changes.`}
      </Text>
    </View>
  );
}
