import Ionicons from '@expo/vector-icons/Ionicons';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chassis } from '@/components/panel/Chassis';
import { KEY_REST, useRipple, usePanelColors } from '@/lib/theme';

// Built on expo-router's headless tabs (`expo-router/ui`, SDK 57) rather than
// the standard <Tabs> navigator, because the foot of this instrument is a row
// of keys, not a Material navigation bar, and the standard navigator's tabBar
// cannot be made into one without fighting it.
//
// The Schedule board is the index route, not a named one: PRODUCT.md's primary
// use is a two-second daily glance at what is on today, and making it `index`
// is the only way to land there that does not depend on navigator option
// plumbing. Classes lives at `/classes`.
//
// The keys carry no legend. A four-function calculator does not label its keys
// with sentences, and these three icons are the whole navigation — the active
// key is the one filled in the trim colour, which is how the instrument marks
// every other live control too.
//
// Layout here is written as explicit `style`, not `className`. TabTrigger's
// `asChild` forwards its own props (including `style`) onto this component, and
// a forwarded style silently wins over NativeWind's compiled className — which
// is what flattened all three tabs into one row of loose icons the first time
// this ran on device.

type PanelTabProps = TabTriggerSlotProps & {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  keyFace: string;
  accent: string;
  idleColor: string;
  liveColor: string;
  ripple: { color: string };
  liveRipple: { color: string };
};

const PanelTab = forwardRef<View, PanelTabProps>(
  (
    { label, icon, isFocused, keyFace, accent, idleColor, liveColor, ripple, liveRipple, style, ...props },
    ref
  ) => (
    <Pressable
      ref={ref}
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={label}
      android_ripple={isFocused ? liveRipple : ripple}
      style={[
        // TabTrigger forwards its own { flexDirection: 'row',
        // justifyContent: 'space-between' } through the Slot, so it goes FIRST
        // and ours wins. With the order reversed, every tab laid its icon out
        // side by side and spread them across the bar. Pressable's style can
        // also be a function of press state; TabTrigger never passes one, so
        // narrow rather than widen this signature.
        typeof style === 'function' ? null : style,
        {
          flex: 1,
          height: 50,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          backgroundColor: isFocused ? accent : keyFace,
        },
        KEY_REST,
      ]}
    >
      <Ionicons name={icon} size={23} color={isFocused ? liveColor : idleColor} />
    </Pressable>
  )
);
PanelTab.displayName = 'PanelTab';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const c = usePanelColors();

  const shared = {
    keyFace: c.key1,
    accent: c.accent,
    idleColor: c.ink2,
    liveColor: c.onAccent,
    ripple: useRipple(),
    liveRipple: useRipple(true),
  };

  return (
    <Chassis>
      <Tabs>
        <TabSlot />
        <TabList asChild>
          {/* The key row sits on the chassis itself, not on a bar of its own —
              the body runs unbroken from the nameplate to the bottom edge. */}
          <View
          style={{
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: insets.bottom + 10,
          }}
        >
            <TabTrigger name="schedule" href="/" asChild>
              <PanelTab label="Schedule" icon="calendar-outline" {...shared} />
            </TabTrigger>
            <TabTrigger name="classes" href="/classes" asChild>
              <PanelTab label="Classes" icon="list-outline" {...shared} />
            </TabTrigger>
            <TabTrigger name="loadouts" href="/loadouts" asChild>
              <PanelTab label="Loadouts" icon="layers-outline" {...shared} />
            </TabTrigger>
          </View>
        </TabList>
      </Tabs>
    </Chassis>
  );
}
