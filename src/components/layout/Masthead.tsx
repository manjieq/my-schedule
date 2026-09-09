// The nameplate — the engraved header every tab screen wears.
//
// Replaces the stock expo-router Tabs header. On a desk calculator the top of
// the body carries the model name, engraved small and widely letter-spaced, cut
// off from the rest of the panel by a single hairline. It is part of the
// chassis, not a bar laid on top of it: no fill, no elevation, no colour of its
// own beyond the trim the name is engraved in.
//
// There is deliberately no right-hand status text. The nameplate says what the
// instrument is; what it currently holds is the readout's job, and duplicating
// "6 entries · 4 called" up here was noise on a panel that should read at a
// glance.
//
// Safe-area aware, because the Android theme makes the status bar transparent
// and nothing in this app used to account for that — content sat underneath it.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRipple, usePanelColors } from '@/lib/theme';

interface MastheadAction {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** A latched mode, e.g. delete mode. Draws the icon in the alert colour so
   *  the screen never sits in a destructive state without saying so. */
  active?: boolean;
}

interface MastheadProps {
  title: string;
  /** Screen actions, drawn in order to the left of the settings gear. Icons
   *  only: the nameplate row is engraving, and a word here would compete with
   *  the model name for the one line the panel gives it. */
  actions?: MastheadAction[];
}

export function Masthead({ title, actions = [] }: MastheadProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = usePanelColors();
  const ripple = useRipple();

  return (
    <View style={{ paddingTop: insets.top }}>
      <View
        className="mx-4 h-12 flex-row items-center"
        // The hairline under the nameplate is tinted with the trim rather than
        // drawn in a neutral: on the real thing this line is where the engraved
        // panel ends, and it picks up the same ink the name is filled with.
        style={{ borderBottomWidth: 1, borderBottomColor: c.accent + '2e' }}
      >
        <Text className="shrink font-panel-bold text-plate uppercase text-accent-hi" numberOfLines={1}>
          {title}
        </Text>

        <View className="ml-auto flex-row items-center">
          {actions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              disabled={action.disabled}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              android_ripple={{ ...ripple, borderless: true, radius: 22 }}
              className="h-11 w-11 items-center justify-center disabled:opacity-40"
            >
              <Ionicons name={action.icon} size={19} color={action.active ? c.alert : c.ink2} />
            </Pressable>
          ))}

          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            android_ripple={{ ...ripple, borderless: true, radius: 22 }}
            className="h-11 w-11 items-center justify-center"
          >
            <Ionicons name="settings-outline" size={19} color={c.ink2} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
