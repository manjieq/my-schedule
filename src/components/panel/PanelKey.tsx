// A pressable keycap: the instrument's button.
//
// Keycap (Keycap.tsx) draws a key face but is not itself pressable, and the
// Pressables that wrap it elsewhere cannot show a ripple through its clipped
// face. This is the pressable version: an outer View carries the key's height
// (the offset shadow), the inner Pressable carries the face and a ripple
// clipped to its rounded corners.
//
// Press travel is tracked in state rather than with Pressable's
// `style={({ pressed }) => …}` callback. NativeWind's interop reads `style` as
// a style object and silently drops a function — which is what left the first
// shuttle keys as bare floating text with no face, height or shadow.
import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type AccessibilityRole, type StyleProp, type ViewStyle } from 'react-native';

import { KEY_PRESSED, KEY_REST, useRipple, usePanelColors } from '@/lib/theme';

interface PanelKeyProps {
  onPress: () => void;
  children: ReactNode;
  /** Held down: a selected option. Drawn the way a pressed key sits — the
   *  shadow collapses and the face drops — so a choice reads as a key that
   *  stayed down, not as a fill. */
  latched?: boolean;
  /** Placement and size of the key (flex, minHeight, margins). */
  style?: StyleProp<ViewStyle>;
  /** Layout of the legend inside the face. */
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean; expanded?: boolean };
}

export function PanelKey({
  onPress,
  children,
  latched = false,
  style,
  contentStyle,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityState,
}: PanelKeyProps) {
  const c = usePanelColors();
  const ripple = useRipple();
  const [pressed, setPressed] = useState(false);
  const down = latched || pressed;

  return (
    <View
      style={[
        { borderRadius: 9, backgroundColor: c.key2 },
        down ? { ...KEY_PRESSED, transform: [{ translateY: 2 }] } : KEY_REST,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        android_ripple={ripple}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        style={{
          flexGrow: 1,
          borderRadius: 9,
          overflow: 'hidden',
          borderTopWidth: 1,
          borderTopColor: down ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Lit from above at rest; a key held down sits in its own shadow, so
            its face goes flat and a step darker. */}
        <LinearGradient
          colors={down ? [c.key2, c.key2] : [c.key1, c.key2]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }, contentStyle]}>
          {children}
        </View>
      </Pressable>
    </View>
  );
}
