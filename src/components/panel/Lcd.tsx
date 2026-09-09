// The readout well: the one recessed piece of glass on the instrument.
//
// It is the only place segment colours appear, and it is where the app says
// what it thinks — the credit total, whether anything clashes, how a revision
// compares. Status that can be spoken here does not get a banner.
//
// The bezel is built the way the reference stacks it: a ring of the darkest
// chassis stop around the glass, then a hairline of trim around that. A single
// border made the readout look like an outlined box sitting on the surface
// rather than glass sunk into it.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { usePanelColors } from '@/lib/theme';

interface LcdProps extends ViewProps {
  /** The small right-aligned line above the digits: units, state, comparison. */
  trace?: string;
  /** An engraved label sitting to the left of the digits, e.g. "TOTAL". */
  legend?: string;
}

export function Lcd({ trace, legend, children, style, className, ...rest }: LcdProps) {
  const c = usePanelColors();

  return (
    <View
      className={className}
      style={[
        { backgroundColor: c.chassis3, borderRadius: 12, padding: 5, borderWidth: 1, borderColor: c.accent },
        style,
      ]}
      {...rest}
    >
      <View className="overflow-hidden rounded-well px-4 pb-2.5 pt-3">
        <LinearGradient colors={[c.lcd, c.lcd2]} style={StyleSheet.absoluteFill} />
      {trace ? (
        <Text className="text-right font-panel-semi text-meta uppercase text-lcd-label" numberOfLines={1}>
          {trace}
        </Text>
      ) : null}

      <View className="mt-1.5 flex-row items-end justify-between">
        {legend ? (
          <Text className="pb-1 font-panel-bold text-label uppercase text-lcd-label">{legend}</Text>
        ) : (
          <View />
        )}
        <View className="flex-row items-end">{children}</View>
        </View>
      </View>
    </View>
  );
}
