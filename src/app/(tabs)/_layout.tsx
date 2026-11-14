import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chassis } from '@/components/panel/Chassis';
import { BusModeProvider, useBusMode } from '@/lib/bus-mode';
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
//
// The Schedule key has a second function, like a calculator key with a SHIFT
// legend printed above it: hold it and the Schedule tab shows the shuttle
// panel instead of the board (lib/bus-mode.tsx); hold it again, or tap it, to
// go back. The legend is engraved above
// the key in the trim colour, because a gesture nobody can see is a feature
// nobody finds — the APK is passed to friends with no explanation. A bar along
// the key's lower edge fills while it is held, so the hold reads as deliberate
// rather than as a tap that did not work.

/** How long the Schedule key must be held for its bus function. Shorter than
 *  the platform's 500ms: this is a key you reach for, not a context menu. */
const HOLD_MS = 400;
/** The fill waits this long before starting, so an ordinary tap does not
 *  flash it. */
const HOLD_FILL_DELAY_MS = 120;

type PanelTabProps = TabTriggerSlotProps & {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  keyFace: string;
  accent: string;
  idleColor: string;
  liveColor: string;
  ripple: { color: string };
  liveRipple: { color: string };
  /** The second-function legend engraved above the key. */
  legend?: { text: string; icon: React.ComponentProps<typeof Ionicons>['name'] };
  legendColor?: string;
  /** 0..1 while the key is held; drawn as a bar along its lower edge. */
  holdProgress?: SharedValue<number>;
};

function HoldBar({ progress, color }: { progress: SharedValue<number>; color: string }) {
  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 12, right: 12, bottom: 6, height: 3 }}>
      <Animated.View style={[{ height: 3, borderRadius: 2, backgroundColor: color }, fill]} />
    </View>
  );
}

const PanelTab = forwardRef<View, PanelTabProps>(
  (
    {
      label,
      icon,
      isFocused,
      keyFace,
      accent,
      idleColor,
      liveColor,
      ripple,
      liveRipple,
      legend,
      legendColor,
      holdProgress,
      style,
      ...props
    },
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
      {holdProgress ? <HoldBar progress={holdProgress} color={isFocused ? liveColor : accent} /> : null}
      {legend ? (
        // Sits above the key, outside its bounds — React Native does not clip
        // overflow by default, and the key row leaves room for it.
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -17,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Ionicons name={legend.icon} size={10} color={legendColor} />
          <Text className="font-panel-bold text-micro uppercase" style={{ color: legendColor }}>
            {legend.text}
          </Text>
        </View>
      ) : null}
    </Pressable>
  )
);
PanelTab.displayName = 'PanelTab';

export default function TabsLayout() {
  return (
    <BusModeProvider>
      <PanelTabs />
    </BusModeProvider>
  );
}

function PanelTabs() {
  const insets = useSafeAreaInsets();
  const c = usePanelColors();
  const { busMode, setBusMode } = useBusMode();
  const holdProgress = useSharedValue(0);

  const startHold = () => {
    holdProgress.value = withDelay(
      HOLD_FILL_DELAY_MS,
      withTiming(1, { duration: HOLD_MS - HOLD_FILL_DELAY_MS, easing: Easing.linear })
    );
  };
  const endHold = () => {
    cancelAnimation(holdProgress);
    holdProgress.value = withTiming(0, { duration: 120 });
  };
  // A hold toggles between the board and the bus panel while the Schedule tab
  // is showing. From another tab it always opens the bus panel — that is what
  // the legend promises, and TabTrigger switches to this tab on the hold.
  const pathname = usePathname();
  const scheduleFocused = pathname === '/';
  const onHold = () => setBusMode(scheduleFocused ? !busMode : true);

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
            // Room above the keys for the Schedule key's engraved legend.
            paddingTop: 24,
            paddingBottom: insets.bottom + 10,
          }}
        >
            {/* A tap always lands on the board; a hold switches between the
                board and the bus panel. TabTrigger switches to this tab on
                either. */}
            <TabTrigger
              name="schedule"
              href="/"
              asChild
              onPress={() => setBusMode(false)}
              onLongPress={onHold}
              delayLongPress={HOLD_MS}
              onPressIn={startHold}
              onPressOut={endHold}
            >
              <ScheduleKey busMode={busMode} holdProgress={holdProgress} shared={shared} />
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

type SharedKeyProps = Pick<
  PanelTabProps,
  'keyFace' | 'accent' | 'idleColor' | 'liveColor' | 'ripple' | 'liveRipple'
>;

/** The Schedule key: shows the bus while its second function is engaged, and
 *  carries the legend that says how to switch. */
const ScheduleKey = forwardRef<
  View,
  TabTriggerSlotProps & { busMode: boolean; holdProgress: SharedValue<number>; shared: SharedKeyProps }
>(({ busMode, holdProgress, shared, ...props }, ref) => {
  const c = usePanelColors();
  const showingBus = busMode && !!props.isFocused;
  return (
    <PanelTab
      ref={ref}
      {...props}
      {...shared}
      label={showingBus ? 'Bus times. Tap or hold for the schedule' : 'Schedule. Hold for bus times'}
      icon={showingBus ? 'bus-outline' : 'calendar-outline'}
      legend={showingBus ? { text: 'Hold · Board', icon: 'calendar-outline' } : { text: 'Hold · Bus', icon: 'bus-outline' }}
      legendColor={c.accentHi}
      holdProgress={holdProgress}
    />
  );
});
ScheduleKey.displayName = 'ScheduleKey';
