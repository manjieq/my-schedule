// Ported from course-scheduler-mobile's app/(tabs)/loadouts.tsx (Course ->
// ClassEntry, LoadoutRow -> Loadout, no university/department gate).
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Masthead } from '@/components/layout/Masthead';
import { LoadoutComparisonView } from '@/components/loadouts/LoadoutComparisonView';
import { LoadoutList } from '@/components/loadouts/LoadoutList';
import { useAppState } from '@/lib/app-state';
import { buildColorMap } from '@/lib/color';
import { useRipple } from '@/lib/theme';
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
  const ripple = useRipple(true);

  const classesById = useMemo(() => new Map(state.classes.map((c) => [c.id, c])), [state.classes]);
  const colorMap = useMemo(() => buildColorMap(state.classes), [state.classes]);
  const colorFor = (id: string) => colorMap.get(id) ?? '#5c7f96';

  // Position in the saved list decides which revision stock a loadout is filed
  // on, so the comparison panels can show the same paper as the cards.
  const stockIndexById = useMemo(
    () => new Map(state.loadouts.map((l, i) => [l.id, i])),
    [state.loadouts]
  );

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.has(id)) {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }
      if (prev.size >= MAX_COMPARE) {
        Alert.alert(
          'Comparison limit reached',
          `You can compare up to ${MAX_COMPARE} loadouts at once — untick one first.`
        );
        return prev;
      }
      return new Set(prev).add(id);
    });
  }

  function handleLoad(loadout: Loadout) {
    dispatch({ type: 'LOAD_LOADOUT', id: loadout.id });
    router.push('/');
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
    <View className="flex-1">
      <Masthead title="LOADOUTS" />

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-10">
        <LoadoutList
          loadouts={state.loadouts}
          classesById={classesById}
          maxCredits={state.creditCap}
          compareSelectedIds={compareIds}
          compareLimitReached={compareIds.size >= MAX_COMPARE}
          colorFor={colorFor}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onToggleCompare={toggleCompare}
        />

        {comparedLoadouts.length >= 2 && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/loadout-compare',
                params: { ids: comparedLoadouts.map((l) => l.id).join(',') },
              })
            }
            android_ripple={ripple}
            accessibilityRole="button"
            className="mt-1 min-h-12 items-center justify-center rounded-key bg-accent"
          >
            <Text className="font-panel-bold text-meta uppercase text-accent-on">
              Full-screen comparison
            </Text>
            <Text className="mt-0.5 font-panel-semi text-tag uppercase text-accent-on opacity-70">
              rotate sideways for the readable version
            </Text>
          </Pressable>
        )}

        <LoadoutComparisonView
          loadouts={comparedLoadouts}
          classesById={classesById}
          maxCredits={state.creditCap}
          colorFor={colorFor}
          stockIndexById={stockIndexById}
        />
      </ScrollView>
    </View>
  );
}
