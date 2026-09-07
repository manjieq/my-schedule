// Ported from course-scheduler-mobile's app/(tabs)/loadouts.tsx (Course ->
// ClassEntry, LoadoutRow -> Loadout, no university/department gate).
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { LoadoutComparisonView } from '@/components/loadouts/LoadoutComparisonView';
import { LoadoutList } from '@/components/loadouts/LoadoutList';
import { useAppState } from '@/lib/app-state';
import { buildColorMap } from '@/lib/color';
import type { Loadout } from '@/lib/models';

// Beyond this, side-by-side comparison stops being readable — panels just
// get squeezed past the point a schedule grid means anything. Both
// comparison views already fall back to horizontal scroll below their
// floor width regardless, so this cap is about readability, not a
// technical limit either view actually has.
const MAX_COMPARE = 4;

export default function LoadoutsScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  const classesById = useMemo(() => new Map(state.classes.map((c) => [c.id, c])), [state.classes]);
  const colorMap = useMemo(() => buildColorMap(state.classes), [state.classes]);
  const colorFor = (id: string) => colorMap.get(id) ?? '#9ca3af';

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.has(id)) {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }
      if (prev.size >= MAX_COMPARE) {
        Alert.alert('Comparison limit reached', `You can compare up to ${MAX_COMPARE} loadouts at once — untick one first.`);
        return prev;
      }
      return new Set(prev).add(id);
    });
  }

  function handleLoad(loadout: Loadout) {
    dispatch({ type: 'LOAD_LOADOUT', id: loadout.id });
    router.push('/(tabs)/schedule');
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_LOADOUT', id });
    setCompareIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const comparedLoadouts = state.loadouts.filter((l) => compareIds.has(l.id));

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-black p-4" contentContainerClassName="gap-4 pb-10">
      <View>
        <Text className="mb-1 text-base font-semibold text-neutral-900 dark:text-neutral-50">Saved loadouts</Text>
        <Text className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
          Tick two or more below to compare them side by side (up to {MAX_COMPARE} at once).
        </Text>
        <LoadoutList
          loadouts={state.loadouts}
          classesById={classesById}
          maxCredits={state.creditCap}
          compareSelectedIds={compareIds}
          compareLimitReached={compareIds.size >= MAX_COMPARE}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onToggleCompare={toggleCompare}
        />
      </View>

      {comparedLoadouts.length >= 2 && (
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/loadout-compare',
              params: { ids: comparedLoadouts.map((l) => l.id).join(',') },
            })
          }
          className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Open full-screen comparison</Text>
          <Text className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Rotate your phone sideways for a bigger, easier-to-read version of the comparison below
          </Text>
        </Pressable>
      )}

      <LoadoutComparisonView
        loadouts={comparedLoadouts}
        classesById={classesById}
        maxCredits={state.creditCap}
        colorFor={colorFor}
      />
    </ScrollView>
  );
}
