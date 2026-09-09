// Ported from course-scheduler-mobile's components/schedule/ConflictWarningBanner.tsx
// (Course -> ClassEntry).
//
// The detail list only. Whether the sheet is clear at all is reported by
// RunningTotal's status line, so this stays silent until there is something to
// enumerate — a permanent "all clear" strip would be chrome, and the sheet does
// not carry chrome.
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { slotLabel } from '@/lib/time';
import type { ConflictPair } from '@/lib/models';

export function ConflictWarningBanner({ conflicts }: { conflicts: ConflictPair[] }) {
  if (conflicts.length === 0) return null;

  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(140)}>
      {/* A correction slip: the header bar is stamped solid and the notes sit
          on the wash below it. Deliberately not an accent bar down the left —
          that is the generic alert pattern, and this world states urgency the
          way a sheet does, by overprinting. */}
      <View className="mx-4">
        <View className="rounded-t-key bg-alert px-3 py-1">
          <Text className="font-panel-semi text-code uppercase text-key">
            {conflicts.length} time clash{conflicts.length > 1 ? 'es' : ''}
          </Text>
        </View>
        <View className="gap-1 rounded-b-key bg-alert-wash px-3 py-2">
          {conflicts.map((c, i) => (
            <Text key={i} className="text-meta text-ink" numberOfLines={2}>
              <Text className="font-bold">{c.classA.name}</Text>
              <Text className="font-panel-semi text-ink-2"> {slotLabel(c.slotA)} </Text>
              overlaps <Text className="font-bold">{c.classB.name}</Text>
              <Text className="font-panel-semi text-ink-2"> {slotLabel(c.slotB)}</Text>
            </Text>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}
