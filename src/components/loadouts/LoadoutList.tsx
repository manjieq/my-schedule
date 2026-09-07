// Ported from course-scheduler-mobile's components/loadouts/LoadoutList.tsx
// (Course -> ClassEntry, LoadoutRow -> Loadout).
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { useColorScheme, useRipple } from '@/lib/theme';
import type { ClassEntry, Loadout } from '@/lib/models';

import { LoadoutCard } from './LoadoutCard';

interface LoadoutListProps {
  loadouts: Loadout[];
  classesById: Map<string, ClassEntry>;
  maxCredits: number;
  compareSelectedIds: Set<string>;
  /** True once compareSelectedIds is at the cap — dims (but doesn't disable
   *  the tap on, so the explanatory alert still fires) any not-yet-selected
   *  loadout's Compare checkbox. */
  compareLimitReached?: boolean;
  onLoad: (loadout: Loadout) => void;
  onDelete: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

export function LoadoutList({
  loadouts,
  classesById,
  maxCredits,
  compareSelectedIds,
  compareLimitReached = false,
  onLoad,
  onDelete,
  onToggleCompare,
}: LoadoutListProps) {
  const ripple = useRipple();
  const { colorScheme } = useColorScheme();

  if (loadouts.length === 0) {
    return (
      <EmptyState
        icon="bookmark-outline"
        title="No loadouts saved yet"
        message="Add classes in the Classes tab, then save your schedule from the Schedule tab."
      />
    );
  }

  return (
    <View>
      {loadouts.map((loadout, index) => {
        const classes = loadout.classIds.map((id) => classesById.get(id)).filter((c): c is ClassEntry => Boolean(c));
        const compared = compareSelectedIds.has(loadout.id);
        return (
          <LoadoutCard
            key={loadout.id}
            loadout={loadout}
            classes={classes}
            maxCredits={maxCredits}
            index={index}
            actions={
              <View className="flex-row flex-wrap items-center gap-4 pt-1">
                <Pressable
                  onPress={() => onLoad(loadout)}
                  hitSlop={10}
                  android_ripple={ripple}
                  className="rounded-md px-1 py-0.5"
                >
                  <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Load into Classes</Text>
                </Pressable>
                <Pressable
                  onPress={() => onDelete(loadout.id)}
                  hitSlop={10}
                  android_ripple={ripple}
                  className="rounded-md px-1 py-0.5"
                >
                  <Text className="text-sm font-medium text-red-600 dark:text-red-400">Delete</Text>
                </Pressable>
                <Pressable
                  onPress={() => onToggleCompare(loadout.id)}
                  className={`flex-row items-center gap-1.5 rounded-md px-1 py-0.5 ${!compared && compareLimitReached ? 'opacity-40' : ''}`}
                  hitSlop={10}
                  android_ripple={ripple}
                >
                  <View
                    className={`h-4 w-4 items-center justify-center rounded border ${
                      compared
                        ? 'border-neutral-900 bg-neutral-900 dark:border-neutral-100 dark:bg-neutral-100'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    {compared && (
                      <Ionicons name="checkmark" size={11} color={colorScheme === 'dark' ? '#171717' : '#ffffff'} />
                    )}
                  </View>
                  <Text className="text-sm text-neutral-700 dark:text-neutral-300">Compare</Text>
                </Pressable>
              </View>
            }
          />
        );
      })}
    </View>
  );
}
