// Ported from course-scheduler-mobile's components/loadouts/LoadoutList.tsx
// (Course -> ClassEntry, LoadoutRow -> Loadout).
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { useRipple, usePanelColors } from '@/lib/theme';
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
  colorFor: (classId: string) => string;
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
  colorFor,
  onLoad,
  onDelete,
  onToggleCompare,
}: LoadoutListProps) {
  const ripple = useRipple();
  const c = usePanelColors();

  if (loadouts.length === 0) {
    return (
      <EmptyState
        icon="albums-outline"
        title="No loadouts saved"
        message="A loadout is a saved combination of classes. Build a week on the Schedule tab, save it, then save another — and compare them side by side to decide."
      />
    );
  }

  return (
    <View>
      {loadouts.map((loadout, index) => {
        const classes = loadout.classIds
          .map((id) => classesById.get(id))
          .filter((cl): cl is ClassEntry => Boolean(cl));
        const compared = compareSelectedIds.has(loadout.id);
        return (
          <LoadoutCard
            key={loadout.id}
            loadout={loadout}
            classes={classes}
            maxCredits={maxCredits}
            index={index}
            colorFor={colorFor}
            actions={
              // Each cell clears 48dp and they are separated by a real gap
              // rather than sharing a hairline; DELETE is pushed out to its own
              // narrow cell at the end, so the destructive action is never
              // adjacent to the one people press constantly.
              <View className="flex-row gap-2 p-2 pt-1.5">
                <Pressable
                  onPress={() => onLoad(loadout)}
                  android_ripple={ripple}
                  accessibilityRole="button"
                  accessibilityLabel={`Load ${loadout.name} into the schedule`}
                  className="h-12 flex-1 items-center justify-center rounded-key bg-accent"
                >
                  <Text className="font-panel-semi text-code uppercase text-accent-on">Load</Text>
                </Pressable>

                <Pressable
                  onPress={() => onToggleCompare(loadout.id)}
                  android_ripple={ripple}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: compared }}
                  accessibilityLabel={`Compare ${loadout.name}`}
                  className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-key ${
                    compared ? 'bg-accent-lo' : 'bg-well'
                  } ${!compared && compareLimitReached ? 'opacity-40' : ''}`}
                >
                  <View
                    className={`h-4 w-4 items-center justify-center rounded-[5px] ${
                      compared ? 'bg-accent-hi' : 'bg-key'
                    }`}
                  >
                    {compared ? <Ionicons name="checkmark" size={11} color={c.onAccent} /> : null}
                  </View>
                  <Text
                    className={`font-panel-semi text-code uppercase ${compared ? 'text-accent-on' : 'text-ink-2'}`}
                  >
                    Compare
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => onDelete(loadout.id)}
                  android_ripple={ripple}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${loadout.name}`}
                  className="h-12 w-12 items-center justify-center rounded-key bg-well"
                >
                  <Ionicons name="trash-outline" size={16} color={c.ink3} />
                </Pressable>
              </View>
            }
          />
        );
      })}
    </View>
  );
}
