import { Pressable, Text, View } from 'react-native';

interface ErrorStateProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

/** A small inline banner for a failed save/load — see lib/storage.ts's
 *  writeJSON doc comment for why writes must never fail silently. */
export function ErrorState({ message, onDismiss, onRetry }: ErrorStateProps) {
  return (
    <View className="mx-4 mb-2 flex-row items-center gap-3 rounded-xl bg-red-50 px-4 py-3 dark:bg-red-950">
      <Text className="flex-1 text-sm text-red-700 dark:text-red-300">{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text className="text-sm font-semibold text-red-700 dark:text-red-300">Retry</Text>
        </Pressable>
      ) : null}
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text className="text-sm font-semibold text-red-700 dark:text-red-300">Dismiss</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
