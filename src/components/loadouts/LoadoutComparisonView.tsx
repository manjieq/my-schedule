// Ported from course-scheduler-mobile's components/loadouts/LoadoutComparisonView.tsx
// (Course -> ClassEntry). ComparisonPanel never scrolls itself, so it's
// safe to nest in this screen's outer vertical ScrollView — same
// even-width-then-horizontal-scroll approach as the landscape
// loadout-compare.tsx screen, just with a smaller floor to fit a phone's
// portrait width.
import { useState } from 'react';
import { ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';

import { useComparisonLayout } from '@/lib/loadout-compare';
import { revisionStock } from '@/lib/revisions';
import type { ClassEntry, Loadout } from '@/lib/models';

import { ComparisonPanel } from './ComparisonPanel';

const MIN_PANEL_WIDTH = 170;
const PANEL_GAP = 12;

interface LoadoutComparisonViewProps {
  loadouts: Loadout[];
  classesById: Map<string, ClassEntry>;
  maxCredits: number;
  colorFor: (classId: string) => string;
  /** Index of each compared loadout in the full saved list, so a panel shows
   *  the same revision stock as its card above. */
  stockIndexById: Map<string, number>;
}

export function LoadoutComparisonView({
  loadouts,
  classesById,
  maxCredits,
  colorFor,
  stockIndexById,
}: LoadoutComparisonViewProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const handleLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  const { loadoutClasses, startHour, endHour, days, sharedClassIds } = useComparisonLayout(loadouts, classesById);

  if (loadouts.length < 2) return null;

  const count = loadouts.length;
  const evenWidth = containerWidth ? (containerWidth - PANEL_GAP * (count - 1)) / count : 0;
  const fitsEven = evenWidth >= MIN_PANEL_WIDTH;
  const panelWidth = fitsEven ? evenWidth : MIN_PANEL_WIDTH;

  function renderPanels() {
    return loadouts.map((loadout, i) => (
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
        sharedClassIds={sharedClassIds}
        stock={revisionStock(stockIndexById.get(loadout.id) ?? i)}
      />
    ));
  }

  return (
    <View className="mt-4" onLayout={handleLayout}>
      <Text className="border-b border-edge pb-1 font-panel-semi text-micro uppercase text-ink-2">
        Comparing {count} loadouts
      </Text>
      <Text className="mb-2 mt-1.5 font-panel-semi text-code text-ink-3">
        Dashed edge = not in every loadout shown · {sharedClassIds.size} class
        {sharedClassIds.size === 1 ? '' : 'es'} in all
      </Text>
      {fitsEven ? (
        <View className="flex-row gap-3">{renderPanels()}</View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerClassName="flex-row gap-3">
          {renderPanels()}
        </ScrollView>
      )}
    </View>
  );
}
