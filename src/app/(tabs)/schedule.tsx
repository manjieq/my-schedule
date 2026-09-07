// Ported (structurally) from course-scheduler-mobile's app/(tabs)/schedule.tsx.
// Build the week (toggle included classes right here, no need to switch
// tabs), then save it as a loadout once it looks right.
import { useMemo, useState } from 'react';
import { ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';

import { ErrorState } from '@/components/common/ErrorState';
import { ExportScheduleButton } from '@/components/export/ExportScheduleButton';
import { LoadoutSaveForm } from '@/components/loadouts/LoadoutSaveForm';
import { ConflictWarningBanner } from '@/components/schedule/ConflictWarningBanner';
import { CreditCapBanner } from '@/components/schedule/CreditCapBanner';
import { IncludedClassesStrip } from '@/components/schedule/IncludedClassesStrip';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import { useAppState } from '@/lib/app-state';
import { buildColorMap } from '@/lib/color';
import { sumCredits } from '@/lib/credits';
import { findConflicts } from '@/lib/time';

export default function ScheduleScreen() {
  const { state, dispatch } = useAppState();

  // Measured (not estimated) so the grid can shrink to fit whatever's
  // actually left after the strip/banners above it.
  const [screenHeight, setScreenHeight] = useState(0);
  const [topSectionHeight, setTopSectionHeight] = useState(0);
  const handleScreenLayout = (e: LayoutChangeEvent) => setScreenHeight(e.nativeEvent.layout.height);
  const handleTopSectionLayout = (e: LayoutChangeEvent) => setTopSectionHeight(e.nativeEvent.layout.height);
  const gridMaxHeight =
    screenHeight && topSectionHeight ? Math.max(screenHeight - topSectionHeight - 16, 0) : undefined;

  const colorMap = useMemo(() => buildColorMap(state.classes), [state.classes]);
  const colorFor = (id: string) => colorMap.get(id) ?? '#9ca3af';

  const includedIdSet = useMemo(() => new Set(state.includedIds), [state.includedIds]);
  const includedClasses = useMemo(
    () => state.classes.filter((c) => includedIdSet.has(c.id)),
    [state.classes, includedIdSet]
  );

  const conflicts = findConflicts(includedClasses);
  const totalCredits = sumCredits(includedClasses);

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-black" onLayout={handleScreenLayout}>
      <View className="gap-3 pb-2 pt-3" onLayout={handleTopSectionLayout}>
        {state.saveError ? (
          <ErrorState message={state.saveError} onDismiss={() => dispatch({ type: 'DISMISS_SAVE_ERROR' })} />
        ) : null}
        <IncludedClassesStrip
          classes={state.classes}
          includedIds={includedIdSet}
          colorFor={colorFor}
          onToggle={(id) => dispatch({ type: 'TOGGLE_INCLUDED', id })}
        />
        <CreditCapBanner totalCredits={totalCredits} creditCap={state.creditCap} />
        <ConflictWarningBanner conflicts={conflicts} />
      </View>

      <ScrollView contentContainerClassName="gap-4 pb-10">
        <ScheduleGrid
          classes={includedClasses}
          colorFor={colorFor}
          conflicts={conflicts}
          maxBodyHeight={gridMaxHeight}
        />

        <ExportScheduleButton classes={includedClasses} colorFor={colorFor} conflicts={conflicts} />

        <View className="mx-4">
          <Text className="mb-1 text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Save as a loadout
          </Text>
          <Text className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
            Save this class combination — browse and compare it against others on the Loadouts tab.
          </Text>
          <LoadoutSaveForm
            disabled={includedClasses.length === 0}
            existingCount={state.loadouts.length}
            onSave={(name) => dispatch({ type: 'SAVE_LOADOUT', name })}
          />
        </View>
      </ScrollView>
    </View>
  );
}
