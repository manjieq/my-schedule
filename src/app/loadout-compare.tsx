// Ported from course-scheduler-mobile's app/loadout-compare.tsx (Course ->
// ClassEntry, no university/department lookups). Dedicated full-screen
// route for the landscape side-by-side loadout comparison. Orientation
// unlocks only while this screen is mounted (app/_layout.tsx locks portrait
// everywhere else by default via app.json, and re-locks it here on
// unmount), so the rest of the app never rotates.
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';

import { ComparisonPanel } from '@/components/loadouts/ComparisonPanel';
import { useAppState } from '@/lib/app-state';
import { buildColorMap } from '@/lib/color';
import { useComparisonLayout } from '@/lib/loadout-compare';

const MIN_PANEL_WIDTH = 260;
const OUTER_PADDING = 16;
const PANEL_GAP = 12;

export default function LoadoutCompareScreen() {
  const router = useRouter();
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const { state } = useAppState();

  const classesById = useMemo(() => new Map(state.classes.map((c) => [c.id, c])), [state.classes]);
  const colorMap = useMemo(() => buildColorMap(state.classes), [state.classes]);
  const colorFor = (id: string) => colorMap.get(id) ?? '#9ca3af';

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  // A ref, not state — this only needs to be read inside the effect below,
  // never to drive a render itself, so tracking it as state would just
  // trigger an extra cascading render for no visual benefit.
  const hasBeenLandscapeRef = useRef(false);

  // Unlock on mount so a physical rotation can actually take effect here;
  // re-lock to the app-wide portrait default on unmount.
  useEffect(() => {
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // Rotating back to portrait after having been landscape means "I'm done
  // comparing" — return automatically. Guarded by the ref so this doesn't
  // fire immediately on open, before the user has had a chance to rotate.
  useEffect(() => {
    if (isLandscape) {
      hasBeenLandscapeRef.current = true;
      return;
    }
    if (hasBeenLandscapeRef.current) router.back();
  }, [isLandscape, router]);

  const selectedIds = useMemo(() => (ids ? ids.split(',').filter(Boolean) : []), [ids]);
  const comparedLoadouts = useMemo(
    () =>
      selectedIds
        .map((id) => state.loadouts.find((l) => l.id === id))
        .filter((l): l is NonNullable<typeof l> => Boolean(l)),
    [selectedIds, state.loadouts]
  );

  const maxCredits = state.creditCap;
  const count = comparedLoadouts.length;

  const contentWidth = width - OUTER_PADDING * 2;
  const evenWidth = count > 0 ? (contentWidth - PANEL_GAP * (count - 1)) / count : contentWidth;
  const fitsEven = evenWidth >= MIN_PANEL_WIDTH;
  const panelWidth = fitsEven ? evenWidth : MIN_PANEL_WIDTH;

  const { loadoutClasses, startHour, endHour, days, sharedClassIds } = useComparisonLayout(
    comparedLoadouts,
    classesById
  );

  const [panelsAreaHeight, setPanelsAreaHeight] = useState(0);
  const handlePanelsAreaLayout = (e: LayoutChangeEvent) => setPanelsAreaHeight(e.nativeEvent.layout.height);

  function renderPanels() {
    return comparedLoadouts.map((loadout, i) => (
      <ComparisonPanel
        key={loadout.id}
        name={loadout.name}
        totalCredits={loadout.totalCredits}
        classes={loadoutClasses[i]}
        maxCredits={maxCredits}
        colorFor={colorFor}
        width={panelWidth}
        startHour={startHour}
        endHour={endHour}
        days={days}
        maxHeight={panelsAreaHeight || undefined}
        sharedClassIds={sharedClassIds}
      />
    ));
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-black">
      <View className="gap-1 px-4 pb-2 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
            Comparing {count} loadout{count === 1 ? '' : 's'}
          </Text>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {isLandscape ? 'Rotate back, or tap Done' : 'Done'}
            </Text>
          </Pressable>
        </View>
        {isLandscape && count >= 2 && (
          <Text className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Dashed outline = not in every compared loadout ({sharedClassIds.size} class
            {sharedClassIds.size === 1 ? '' : 'es'} shared by all)
          </Text>
        )}
      </View>

      {!isLandscape ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Rotate your device sideways to see both full schedules side by side.
          </Text>
        </View>
      ) : fitsEven ? (
        <View className="flex-1 flex-row gap-3 px-4 pb-4" onLayout={handlePanelsAreaLayout}>
          {renderPanels()}
        </View>
      ) : (
        <ScrollView
          horizontal
          className="flex-1"
          contentContainerClassName="flex-row gap-3 px-4 pb-4"
          onLayout={handlePanelsAreaLayout}
        >
          {renderPanels()}
        </ScrollView>
      )}
    </View>
  );
}
