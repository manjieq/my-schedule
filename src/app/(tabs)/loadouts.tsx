// Ported from course-scheduler-mobile's app/(tabs)/loadouts.tsx (Course ->
// ClassEntry, LoadoutRow -> Loadout, no university/department gate).
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Masthead } from '@/components/layout/Masthead';
import { LoadoutList } from '@/components/loadouts/LoadoutList';
import { useAppState } from '@/lib/app-state';
import { buildColorMap } from '@/lib/color';
import { useRipple } from '@/lib/theme';
import type { Loadout } from '@/lib/models';

// Beyond this, side-by-side comparison stops being readable — panels just
// get squeezed past the point a schedule grid means anything. The landscape
// comparison already falls back to horizontal scroll below its floor width
// regardless, so this cap is about readability, not a technical limit the
// view actually has.
const MAX_COMPARE = 4;

export default function LoadoutsScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  // Delete mode. Off on every visit — see the same note on the classes screen.
  const [deleting, setDeleting] = useState(false);
  const ripple = useRipple(true);

  const classesById = useMemo(() => new Map(state.classes.map((c) => [c.id, c])), [state.classes]);
  const colorMap = useMemo(() => buildColorMap(state.classes), [state.classes]);
  const colorFor = (id: string) => colorMap.get(id) ?? '#5c7f96';

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

  // A loadout is a saved snapshot the user deliberately made and cannot
  // rebuild from anything on screen, so deleting one asks first — the same
  // rule the class list follows.
  function handleDelete(id: string) {
    const target = state.loadouts.find((l) => l.id === id);
    Alert.alert(
      'Delete this loadout?',
      target ? `"${target.name}" will be removed. This cannot be undone.` : undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(id) },
      ]
    );
  }

  function confirmDelete(id: string) {
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
      <Masthead
        title="LOADOUTS"
        actions={[
          {
            icon: deleting ? 'close-outline' : 'trash-outline',
            label: deleting ? 'Done deleting' : 'Delete loadouts',
            onPress: () => setDeleting((v) => !v),
            active: deleting,
          },
        ]}
      />

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
          deletable={deleting}
        />

        {/* The only comparison surface is the landscape route. A portrait
            side-by-side was always going to be too squeezed to read, so
            picking two loadouts leads to one key and nothing else. */}
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
      </ScrollView>
    </View>
  );
}
