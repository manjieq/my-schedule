// Ported from course-scheduler-mobile's components/loadouts/LoadoutCard.tsx
// (Course -> ClassEntry, course.code -> class.name).
//
// A saved loadout is drawn as a filed revision: a keycap carrying an engraved
// plate at its head, numbered, dated, with its running total and its class
// list. The numbers shown are the frozen snapshot stored on the loadout, not a
// live recomputation — see SAVE_LOADOUT in lib/app-state.
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { KEY_REST } from '@/lib/theme';
import { revisionStock } from '@/lib/revisions';
import { findConflicts } from '@/lib/time';
import type { ClassEntry } from '@/lib/models';

interface LoadoutCardData {
  id: string;
  name: string;
  totalCredits: number;
  createdAt: string;
}

interface LoadoutCardProps {
  loadout: LoadoutCardData;
  classes: ClassEntry[];
  maxCredits: number;
  /** Position in the list — mirrors ClassCard's stagger so both lists in the
   *  app reveal with the same cascade rather than each inventing its own
   *  entrance. Also picks the revision stock. */
  index: number;
  colorFor?: (classId: string) => string;
  actions?: ReactNode;
}

export function LoadoutCard({
  loadout,
  classes,
  maxCredits,
  index,
  colorFor,
  actions,
}: LoadoutCardProps) {
  const conflicts = findConflicts(classes);
  const overLimit = loadout.totalCredits > maxCredits;
  const stock = revisionStock(index);

  return (
    <Animated.View entering={FadeInDown.duration(260).delay(Math.min(index, 8) * 35)}>
      <View className="mb-2.5 overflow-hidden rounded-key bg-key" style={KEY_REST}>
        {/* the engraved plate */}
        <View
          className="flex-row items-center justify-between px-3 py-1.5"
          style={{ backgroundColor: stock.paper }}
        >
          <Text className="font-panel-bold text-micro uppercase" style={{ color: stock.ink }}>
            R—{String(index + 1).padStart(2, '0')} · {stock.name}
          </Text>
          <Text className="font-panel-semi text-tag uppercase" style={{ color: stock.ink, opacity: 0.7 }}>
            {new Date(loadout.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View className="flex-row items-baseline gap-2 px-3 pt-2.5">
          <Text className="flex-1 text-item font-bold text-ink" numberOfLines={1}>
            {loadout.name}
          </Text>
          <Text
            className={`font-panel-bold text-item ${overLimit ? 'text-warn' : 'text-accent-hi'}`}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {loadout.totalCredits.toFixed(1)}
          </Text>
          <Text className="font-panel-semi text-code text-ink-2">/ {maxCredits.toFixed(1)}</Text>
        </View>

        <View className="flex-row flex-wrap gap-x-3 px-3 pt-1">
          <Text className="font-panel-semi text-code uppercase text-ink-2">
            {classes.length} class{classes.length === 1 ? '' : 'es'}
          </Text>
          {overLimit ? (
            <Text className="font-panel-semi text-code uppercase text-warn">over cap</Text>
          ) : null}
          {conflicts.length > 0 ? (
            <Text className="font-panel-semi text-code uppercase text-alert">
              {conflicts.length} clash{conflicts.length > 1 ? 'es' : ''}
            </Text>
          ) : null}
        </View>

        <View className="mt-2 px-3">
          {classes.map((c) => (
            <View key={c.id} className="flex-row items-center py-0.5">
              <View
                className="h-4 w-[3px] rounded-full"
                style={{ backgroundColor: colorFor ? colorFor(c.id) : 'transparent' }}
              />
              <Text className="flex-1 py-1 pl-2.5 text-meta text-ink" numberOfLines={1}>
                {c.name}
              </Text>
              <Text className="font-panel-semi text-code text-ink-2">{c.credits.toFixed(1)}</Text>
            </View>
          ))}
          {classes.length === 0 ? (
            <Text className="py-2 font-panel-semi text-code uppercase text-ink-3">
              every class in this loadout has since been deleted
            </Text>
          ) : null}
        </View>

        {actions}
      </View>
    </Animated.View>
  );
}
