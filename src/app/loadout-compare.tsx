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
import { revisionStock } from '@/lib/revisions';
import { useRipple } from '@/lib/theme';

const MIN_PANEL_WIDTH = 260;
const OUTER_PADDING = 16;
const PANEL_GAP = 12;

export default function LoadoutCompareScreen() {
  const router = useRouter();
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const { state } = useAppState();
  const ripple = useRipple();

  const classesById = useMemo(() => new Map(state.classes.map((c) => [c.id, c])), [state.classes]);
  const colorMap = useMemo(() => buildColorMap(state.classes), [state.classes]);
  const colorFor = (id: string) => colorMap.get(id) ?? '#5c7f96';

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
        stock={revisionStock(state.loadouts.findIndex((l) => l.id === loadout.id))}
      />
    ));
  }

  return (
    <View className="flex-1 bg-stock">
      <View className="gap-1 px-4 pb-2 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-panel-semi text-micro uppercase text-ink-2">
            Comparing {count} loadout{count === 1 ? '' : 's'}
          </Text>
          <Pressable
            onPress={() => router.back()}
            hitSlop={14}
            accessibilityRole="button"
            android_ripple={{ ...ripple, borderless: true, radius: 24 }}
            className="min-h-12 justify-center px-1"
          >
            <Text className="font-panel-semi text-code uppercase text-ink">
              {isLandscape ? 'Rotate back, or done' : 'Done'}
            </Text>
          </Pressable>
        </View>
        {isLandscape && count >= 2 && (
          <Text className="font-panel-semi text-code text-ink-3">
            Dashed edge = not in every compared loadout · {sharedClassIds.size} class
            {sharedClassIds.size === 1 ? '' : 'es'} in all
          </Text>
        )}
      </View>

      {!isLandscape ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-panel-semi text-code uppercase text-ink-2">
            rotate sideways
          </Text>
          <Text className="mt-2 text-center text-meta text-ink-3">
            The sheets go side by side in landscape, at a size you can actually read.
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
