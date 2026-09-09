import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { usePanelColors } from '@/lib/theme';

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
}

/** A centered placeholder for a screen/list with nothing in it yet. Icon is
 *  a name from the app's own icon set — never an emoji glyph standing in
 *  for it, so the mark stays the same stroke and weight as everything else
 *  drawn on screen.
 *
 *  Set as a blank line on a form rather than a friendly illustration: the
 *  title is the typewriter stating the condition, the message is what to do
 *  about it. A stranger installing the APK cold reads this first, so it names
 *  the action rather than the feeling (PRODUCT.md, principle 5). */
export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const c = usePanelColors();

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      {icon ? <Ionicons name={icon} size={32} color={c.ink3} /> : null}
      <Text className="mt-3 text-center font-panel-semi text-label uppercase text-ink">{title}</Text>
      {message ? (
        <Text className="mt-2 max-w-[46ch] text-center text-meta text-ink-2">{message}</Text>
      ) : null}
    </View>
  );
}
