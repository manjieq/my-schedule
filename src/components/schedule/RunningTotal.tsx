// The foot of the panel: the allowance meter and the roster.
//
// The number itself is not here — it is the readout at the head of the board,
// see CreditReadout. This is what the readout is made of: how the cap is spent,
// and by whom.
//
// The roster lives here rather than in a chip band above the board. It carries
// who is called, who is taking it and what it costs, and tapping a name calls
// or omits that class, so include/exclude stays on this screen without spending
// board height on a second control.
//
// It is folded away by default. Changing what is called is an occasional act
// and the board is the thing you came to look at, so the roster costs nothing
// until it is asked for — except when nothing is called at all, where the board
// is empty and the roster is the only thing worth showing.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { sumCredits } from '@/lib/credits';
import { useRipple, usePanelColors } from '@/lib/theme';
import type { ClassEntry } from '@/lib/models';

interface RunningTotalProps {
  /** Every class the user has, called or not — the omitted ones stay on the
   *  panel, struck through, because that is what excluding one means. */
  classes: ClassEntry[];
  includedIds: Set<string>;
  creditCap: number;
  colorFor: (classId: string) => string;
  onToggle: (classId: string) => void;
}

export function RunningTotal({
  classes,
  includedIds,
  creditCap,
  colorFor,
  onToggle,
}: RunningTotalProps) {
  const ripple = useRipple();
  const c = usePanelColors();
  const called = classes.filter((c) => includedIds.has(c.id));
  const total = sumCredits(called);
  const isOver = total > creditCap;
  const remaining = Math.abs(creditCap - total);

  // Segment widths are a share of the cap, not of the total, so the meter reads
  // as "how much of the allowance is spent" and the unspent remainder stays
  // visible.
  const scale = Math.max(creditCap, total) || 1;

  // Nothing called means an empty board, so the roster opens itself — there is
  // nothing else on the screen to act on.
  const [open, setOpen] = useState(false);
  const showRoster = open || called.length === 0;

  return (
    <View className="mx-4">
      {/* The allowance meter: each called class takes its share of the cap. */}
      <View className="h-[9px] flex-row overflow-hidden rounded-well bg-well">
        {called.map((c) => (
          <View
            key={c.id}
            style={{ width: `${(c.credits / scale) * 100}%`, backgroundColor: colorFor(c.id) }}
          />
        ))}
      </View>

      {/* The counts line is also the roster's latch. */}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        disabled={classes.length === 0}
        android_ripple={ripple}
        accessibilityRole="button"
        accessibilityState={{ expanded: showRoster }}
        accessibilityLabel={showRoster ? 'Hide the class roster' : 'Show the class roster'}
        className="mt-1 min-h-9 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-1">
          <Text className="font-panel-semi text-tag uppercase text-ink-3">
            {called.length} called · {classes.length - called.length} omitted
          </Text>
          {classes.length > 0 ? (
            <Ionicons name={showRoster ? 'chevron-down' : 'chevron-forward'} size={11} color={c.ink3} />
          ) : null}
        </View>
        <Text className={`font-panel-semi text-tag uppercase ${isOver ? 'text-warn' : 'text-ink-3'}`}>
          {isOver ? `over by ${remaining.toFixed(1)}` : `under by ${remaining.toFixed(1)}`}
        </Text>
      </Pressable>

      {/* The roster: tap a name to call or omit it. Called classes are keycaps;
          omitted ones drop into the chassis as wells, so the state is legible
          from the physical treatment before the strike-through is read. */}
      {showRoster ? (
        <View className="mt-1 flex-row gap-1.5">
          {classes.map((c) => {
            const included = includedIds.has(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => onToggle(c.id)}
                android_ripple={ripple}
                accessibilityRole="switch"
                accessibilityState={{ checked: included }}
                accessibilityLabel={`${c.name}, ${included ? 'called' : 'omitted'}`}
                className={`min-h-12 flex-1 overflow-hidden rounded-key px-1.5 pb-1 pt-1.5 ${
                  included ? 'bg-key' : 'bg-well'
                }`}
              >
                <View
                  className="h-[3px] w-full rounded-full"
                  style={{ backgroundColor: colorFor(c.id), opacity: included ? 1 : 0.35 }}
                />
                <Text
                  className={`mt-1 text-tag font-bold ${included ? 'text-ink' : 'text-ink-3 line-through'}`}
                  numberOfLines={2}
                >
                  {c.name}
                </Text>
                <Text className="mt-auto font-panel-semi text-tag text-ink-3" numberOfLines={1}>
                  {c.instructor ? `${c.instructor} · ` : ''}
                  {c.credits.toFixed(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
