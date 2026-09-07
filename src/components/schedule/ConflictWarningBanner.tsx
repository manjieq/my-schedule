// Ported from course-scheduler-mobile's components/schedule/ConflictWarningBanner.tsx
// (Course -> ClassEntry).
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { slotLabel } from '@/lib/time';
import type { ConflictPair } from '@/lib/models';

export function ConflictWarningBanner({ conflicts }: { conflicts: ConflictPair[] }) {
  if (conflicts.length === 0) return null;

  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(140)}>
      <View className="mx-4 mb-3 gap-1 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
        <Text className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          {conflicts.length} time conflict{conflicts.length > 1 ? 's' : ''} in this schedule
        </Text>
        {conflicts.map((c, i) => (
          <Text key={i} className="text-xs text-amber-700 dark:text-amber-400">
            {c.classA.name} ({slotLabel(c.slotA)}) overlaps {c.classB.name} ({slotLabel(c.slotB)})
          </Text>
        ))}
      </View>
    </Animated.View>
  );
}
