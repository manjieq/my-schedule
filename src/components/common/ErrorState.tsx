import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useRipple } from '@/lib/theme';

interface ErrorStateProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

/** A small inline banner for a failed save/load — see lib/storage.ts's
 *  writeJSON doc comment for why writes must never fail silently.
 *
 *  Same correction-slip form as ConflictWarningBanner: a stamped header bar
 *  over its wash, rather than an accent bar down the left. */
export function ErrorState({ message, onDismiss, onRetry }: ErrorStateProps) {
  const ripple = useRipple();

  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(140)}>
      <View className="mx-4">
        <View className="rounded-t-key bg-alert px-3 py-1">
          <Text className="font-panel-semi text-code uppercase text-key">Not saved</Text>
        </View>
        <View className="flex-row items-center gap-2 rounded-b-key bg-alert-wash px-3 py-2">
          <Text className="flex-1 text-meta text-ink">{message}</Text>
          {onRetry ? (
            <Pressable
              onPress={onRetry}
              hitSlop={12}
              android_ripple={ripple}
              accessibilityRole="button"
              className="px-1 py-1"
            >
              <Text className="font-panel-semi text-code uppercase text-alert">Retry</Text>
            </Pressable>
          ) : null}
          {onDismiss ? (
            <Pressable
              onPress={onDismiss}
              hitSlop={12}
              android_ripple={ripple}
              accessibilityRole="button"
              className="px-1 py-1"
            >
              <Text className="font-panel-semi text-code uppercase text-ink-2">Dismiss</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
