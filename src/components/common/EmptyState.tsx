import { Text, View } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

/** A centered placeholder for a screen/list with nothing in it yet. */
export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-8 py-16">
      {icon ? <Text className="text-5xl">{icon}</Text> : null}
      <Text className="text-center text-base font-semibold text-neutral-900 dark:text-neutral-50">{title}</Text>
      {message ? (
        <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">{message}</Text>
      ) : null}
    </View>
  );
}
