// The instrument body.
//
// One brushed-steel gradient running the height of the app, with a screw at
// each corner of the working area. Everything else in the app sits on this: the
// nameplate is engraved into it, keycaps stand proud of it, wells are cut into
// it. It is deliberately drawn once, around the whole tab area, rather than per
// screen — a real body does not restart at every panel, and drawing it twice
// put a visible seam between the board and the key row.
//
// Full-bleed rather than inset with a rounded corner: on a phone the chassis IS
// the device, and insetting it would spend real estate to draw an edge the
// screen bezel already provides.
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePanelColors } from '@/lib/theme';

/** A slotted screw head. Four of them are the whole hardware vocabulary. */
function Screw({ style }: { style: object }) {
  const c = usePanelColors();
  return (
    <View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: c.screw2 },
        style,
      ]}
    >
      {/* the lit upper-left of the head, and the slot cut across it */}
      <View
        style={{
          position: 'absolute',
          left: 0.5,
          top: 0.5,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: c.screw1,
          opacity: 0.75,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 1.5,
          top: 3,
          width: 4,
          height: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      />
    </View>
  );
}

export function Chassis({ children }: { children: ReactNode }) {
  const c = usePanelColors();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      // 155deg in the reference. React Native takes unit-square start/end
      // points instead of an angle; this pair is that diagonal, lightest at the
      // top-left and darkest at the bottom-right.
      colors={[c.chassis1, c.chassis2, c.chassis3]}
      locations={[0, 0.55, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      {children}
      <Screw style={{ left: 10, top: insets.top + 6 }} />
      <Screw style={{ right: 10, top: insets.top + 6 }} />
      <Screw style={{ left: 10, bottom: insets.bottom + 6 }} />
      <Screw style={{ right: 10, bottom: insets.bottom + 6 }} />
    </LinearGradient>
  );
}
