// The keycap and the well — the two things this instrument is built from.
//
// A keycap stands proud of the chassis on a hard offset shadow that models its
// height; a well is cut into the chassis and is darker than the body. Every
// pressable surface in the app is one of these, so the physical rule is stated
// once here rather than re-derived per component.
//
// The face is a two-stop gradient, lit at the top and shaded at the bottom,
// which is what makes a cap read as moulded rather than as a coloured
// rectangle. Flat faces were tried first and the whole panel looked like a dark
// app instead of an object.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { KEY_REST, usePanelColors } from '@/lib/theme';

interface KeycapProps extends ViewProps {
  /** Pressed state: the offset collapses rather than a new effect appearing. */
  pressed?: boolean;
  /** The class-identity inlay down the left edge, if this key carries one. */
  inlay?: string;
}

export function Keycap({ pressed = false, inlay, style, children, className, ...rest }: KeycapProps) {
  const c = usePanelColors();

  return (
    <View
      className={`overflow-hidden rounded-key ${className ?? ''}`}
      style={[
        { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
        pressed
          ? { transform: [{ translateY: 2 }], shadowOpacity: 0, elevation: 1 }
          : KEY_REST,
        style,
      ]}
      {...rest}
    >
      <LinearGradient colors={[c.key1, c.key2]} style={StyleSheet.absoluteFill} />
      {inlay ? (
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: inlay }} />
      ) : null}
      {children}
    </View>
  );
}

/** A recess: grid columns, toggle slots, an excluded class. The inverse of a
 *  keycap, so it never carries the offset shadow and never catches the light. */
export function Well({ style, children, className, ...rest }: ViewProps) {
  return (
    <View
      className={`overflow-hidden rounded-well bg-well ${className ?? ''}`}
      style={[{ borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.10)' }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
