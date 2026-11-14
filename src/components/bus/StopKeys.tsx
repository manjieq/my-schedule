// A row of keys for picking a stop: FROM, and TO where a stop offers a choice.
//
// The chosen stop is a key held down, with a short trim bar lit under its
// legend, rather than a filled key. The instrument fills exactly one key per
// screen with the trim colour, and on this screen that is the Schedule key in
// its bus function.
import { Text, View } from 'react-native';

import { PanelKey } from '@/components/panel/PanelKey';
import { usePanelColors } from '@/lib/theme';

interface StopOption<T extends string> {
  id: T;
  name: string;
  /** A smaller second line — what the stop is near, for someone new. */
  detail?: string;
}

interface StopKeysProps<T extends string> {
  label: string;
  options: StopOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function StopKeys<T extends string>({ label, options, value, onChange }: StopKeysProps<T>) {
  const c = usePanelColors();

  return (
    <View>
      <Text className="mb-2 font-panel-bold text-label uppercase text-ink-2">{label}</Text>
      <View className="flex-row gap-2" accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <PanelKey
              key={option.id}
              onPress={() => onChange(option.id)}
              latched={selected}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.detail ? `${option.name}, ${option.detail}` : option.name}
              style={{ flex: 1, minHeight: option.detail ? 64 : 52 }}
              contentStyle={{ paddingHorizontal: 4, paddingTop: 9, paddingBottom: 7 }}
            >
              <Text
                className={`font-panel-semi text-body ${selected ? 'text-accent-hi' : 'text-ink'}`}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {option.name}
              </Text>
              {option.detail ? (
                <Text className="mt-0.5 font-panel-semi text-tag uppercase text-ink-2" numberOfLines={1}>
                  {option.detail}
                </Text>
              ) : null}
              {/* The lit bar sits in the flow under the legend, never over it,
                  and every key keeps the slot so a choice does not shift the
                  text. */}
              <View
                style={{
                  marginTop: 6,
                  width: 16,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: selected ? c.accent : 'transparent',
                }}
              />
            </PanelKey>
          );
        })}
      </View>
    </View>
  );
}
