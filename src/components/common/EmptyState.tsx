import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { ICON_MUTED } from '@/lib/theme';

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
}

/** A centered placeholder for a screen/list with nothing in it yet. Icon is
 *  a name from the app's own icon set — never an emoji glyph standing in
 *  for it, so the mark stays the same stroke and weight as everything else
 *  drawn on screen. */
export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-8 py-16">
      {icon ? <Ionicons name={icon} size={40} color={ICON_MUTED} /> : null}
      <Text className="text-center text-lg font-bold text-neutral-900 dark:text-neutral-50">{title}</Text>
      {message ? (
        <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">{message}</Text>
      ) : null}
    </View>
  );
}
