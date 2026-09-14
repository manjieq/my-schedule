// Ported (structurally) from course-scheduler-mobile's app/(tabs)/schedule.tsx.
// Build the week (toggle included classes right here, no need to switch
// tabs), then save it as a loadout once it looks right.
//
// The instrument composition treats this screen as one panel rather than a
// scroll: nameplate at the head, the board taking whatever is left, the readout
// and its meter at the foot. Nothing here
// scrolls vertically — the board shrinks its hour rows toward MIN_HOUR_PX
// instead, which is why the two onLayout measurements below matter. Saving a
// loadout used to be a form sitting at the bottom of a scroll; it is now an
// action on the nameplate opening its own modal, so this screen is only the
// schedule.
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, type LayoutChangeEvent } from 'react-native';

import { ErrorState } from '@/components/common/ErrorState';
import { ExportScheduleButton } from '@/components/export/ExportScheduleButton';
import { Masthead } from '@/components/layout/Masthead';
import { ConflictWarningBanner } from '@/components/schedule/ConflictWarningBanner';
import { CreditReadout } from '@/components/schedule/CreditReadout';
import { RunningTotal } from '@/components/schedule/RunningTotal';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import { useAppState } from '@/lib/app-state';
import { sumCredits } from '@/lib/credits';
import { buildColorMap } from '@/lib/color';
import { REST_MESSAGES, isRestDay, pickRestMessage } from '@/lib/rest';
import { findConflicts, todayDay } from '@/lib/time';

export default function ScheduleScreen() {
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const [exportOpen, setExportOpen] = useState(false);

  // Measured (not estimated) so the board can take exactly what's left after
  // the head and the foot, without a page scroll.
  const [bodyHeight, setBodyHeight] = useState(0);
  const [topSectionHeight, setTopSectionHeight] = useState(0);
  const handleBodyLayout = (e: LayoutChangeEvent) => setBodyHeight(e.nativeEvent.layout.height);
  const handleTopSectionLayout = (e: LayoutChangeEvent) => setTopSectionHeight(e.nativeEvent.layout.height);
  const gridMaxHeight =
    bodyHeight && topSectionHeight ? Math.max(bodyHeight - topSectionHeight - 8, 0) : undefined;

  // Built from the full, unfiltered class list — never from includedClasses.
  // See the contract on buildColorMap in lib/color.ts.
  const colorMap = useMemo(() => buildColorMap(state.classes), [state.classes]);
  const colorFor = (id: string) => colorMap.get(id) ?? '#5c7f96';

  const includedIdSet = useMemo(() => new Set(state.includedIds), [state.includedIds]);
  const includedClasses = useMemo(
    () => state.classes.filter((c) => includedIdSet.has(c.id)),
    [state.classes, includedIdSet]
  );

  const conflicts = findConflicts(includedClasses);
  const total = sumCredits(includedClasses);

  // The board rests on a weekend, or on a weekday with nothing called. With
  // nothing called at all the grid's own "nothing called this week" panel is
  // the better answer, so rest mode stays out of its way.
  //
  // `new Date()` is read during render with no ticker (the grid does the same
  // for its NOW band), so a screen left open across midnight keeps yesterday's
  // answer until something else re-renders it. A clock here would re-render
  // the whole board every tick for a case nobody sits through.
  const atRest = includedClasses.length > 0 && isRestDay(includedClasses, todayDay());
  const [revealed, setRevealed] = useState(false);
  const [messageIndex, setMessageIndex] = useState(() => pickRestMessage());
  const resting = atRest && !revealed;

  const toggleBoard = () => {
    // Re-rolled on the way back, so returning to rest never looks like a
    // display that failed to change.
    if (revealed) setMessageIndex((i) => pickRestMessage(i));
    setRevealed((v) => !v);
  };

  return (
    <View className="flex-1">
      <Masthead
        title="MY SCHEDULE"
        actions={[
          {
            icon: 'bookmark-outline',
            label: 'Save this schedule as a loadout',
            onPress: () => router.push('/save-loadout'),
            disabled: includedClasses.length === 0,
          },
          {
            icon: 'share-outline',
            label: 'Export this schedule as an image',
            onPress: () => setExportOpen((v) => !v),
            disabled: includedClasses.length === 0,
          },
        ]}
      />

      <View className="flex-1" onLayout={handleBodyLayout}>
        <View className="gap-2 pb-2 pt-1" onLayout={handleTopSectionLayout}>
          <CreditReadout
            total={total}
            creditCap={state.creditCap}
            conflictCount={conflicts.length}
            message={resting ? REST_MESSAGES[messageIndex] : undefined}
          />
          {state.saveError ? (
            <ErrorState message={state.saveError} onDismiss={() => dispatch({ type: 'DISMISS_SAVE_ERROR' })} />
          ) : null}
          <ConflictWarningBanner conflicts={resting ? [] : conflicts} />
          {exportOpen ? (
            <ExportScheduleButton
              classes={includedClasses}
              colorFor={colorFor}
              conflicts={conflicts}
              creditCap={state.creditCap}
              total={total}
            />
          ) : null}
        </View>

        <ScheduleGrid
          classes={includedClasses}
          colorFor={colorFor}
          conflicts={conflicts}
          maxBodyHeight={gridMaxHeight}
          hideEvents={resting}
          onPress={atRest ? toggleBoard : undefined}
        />
      </View>

      <View className="pb-3 pt-1">
        <RunningTotal
          classes={state.classes}
          includedIds={includedIdSet}
          creditCap={state.creditCap}
          colorFor={colorFor}
          onToggle={(id) => dispatch({ type: 'TOGGLE_INCLUDED', id })}
        />
      </View>
    </View>
  );
}
