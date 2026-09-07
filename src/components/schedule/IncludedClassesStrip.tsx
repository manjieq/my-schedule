// Ported from course-scheduler-mobile's components/schedule/IncludedCoursesStrip.tsx
// (Course -> ClassEntry). Lets a class be un-/re-included right from the
// Schedule tab — no need to switch to Classes just to untick something.
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { ClassEntry } from '@/lib/models';

interface IncludedClassesStripProps {
  classes: ClassEntry[];
  includedIds: Set<string>;
  colorFor: (classId: string) => string;
  onToggle: (classId: string) => void;
}

export function IncludedClassesStrip({ classes, includedIds, colorFor, onToggle }: IncludedClassesStripProps) {
  if (classes.length === 0) {
    return (
      <Text className="px-4 text-sm text-neutral-500 dark:text-neutral-400">
        Add classes in the Classes tab to see them here.
      </Text>
    );
  }

  return (
    <View className="mb-3">
      <Text className="mx-4 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Your classes
      </Text>
      <Text className="mx-4 mb-2 text-xs text-neutral-400 dark:text-neutral-600">
        Tap to include or exclude — updates instantly
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-1.5 px-4"
      >
        {classes.map((classEntry) => {
          const included = includedIds.has(classEntry.id);
          return (
            <Pressable
              key={classEntry.id}
              onPress={() => onToggle(classEntry.id)}
              className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
                included
                  ? 'bg-neutral-900 dark:bg-neutral-100'
                  : 'border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-950'
              }`}
            >
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: colorFor(classEntry.id), opacity: included ? 1 : 0.5 }}
              />
              <Text
                className={`text-xs font-semibold ${
                  included ? 'text-white dark:text-neutral-900' : 'text-neutral-400 dark:text-neutral-500'
                }`}
                numberOfLines={1}
              >
                {classEntry.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
