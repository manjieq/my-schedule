// The shuttle panel: the Schedule tab's second function, reached by holding
// the Schedule key (see app/(tabs)/_layout.tsx and lib/bus-mode.tsx).
//
// Minimal by default — one readout and the two choices that change what it
// says (where you are, and at Shuttlecock where you are going). The whole
// day's table stays folded behind one key until it is asked for.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler, Text, View } from 'react-native';

import { BusReadout } from '@/components/bus/BusReadout';
import { BusTimetable } from '@/components/bus/BusTimetable';
import { StopKeys } from '@/components/bus/StopKeys';
import { Masthead } from '@/components/layout/Masthead';
import { PanelKey } from '@/components/panel/PanelKey';
import { useAppState } from '@/lib/app-state';
import {
  BUS_STOPS,
  PERIOD_LABELS,
  dayLabel,
  destinationLabel,
  destinationsFrom,
  effectivePeriod,
  isOverrideActive,
  readBus,
  stopName,
  type BusStop,
} from '@/lib/bus';
import { useBusMode } from '@/lib/bus-mode';
import { usePanelColors } from '@/lib/theme';
import { useNow } from '@/lib/use-now';

export function BusPanel() {
  const { state, dispatch } = useAppState();
  const { setBusMode } = useBusMode();
  const now = useNow();
  const c = usePanelColors();
  const [expanded, setExpanded] = useState(false);

  const { from, override } = state.bus;
  const destinations = destinationsFrom(from);
  const to = destinations.length ? state.bus.to : undefined;
  const query = { from, to, override };

  const reading = readBus(now, query);
  const period = effectivePeriod(now, override);
  // The readout always names the table it is reading, so a wrong guess about
  // the term is visible at a glance; "(set)" marks a manual choice.
  const trace = `${PERIOD_LABELS[period]}${isOverrideActive(now, override) ? ' (set)' : ''} · ${dayLabel(now)}`;

  // Android back steps out one level at a time: the open table first, then
  // the bus panel itself, back to the board. Only while this tab is focused —
  // tab screens stay mounted, and back on the Classes tab is not ours.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (expanded) setExpanded(false);
        else setBusMode(false);
        return true;
      });
      return () => sub.remove();
    }, [expanded, setBusMode])
  );

  const setFrom = (next: BusStop) => dispatch({ type: 'SET_BUS_PREFS', prefs: { from: next } });
  const setTo = (next: BusStop) => dispatch({ type: 'SET_BUS_PREFS', prefs: { to: next } });

  return (
    <View className="flex-1">
      <Masthead title="SHUTTLE BUS" />

      <View className="flex-1 px-4 pb-1.5 pt-3">
        <BusReadout reading={reading} destination={destinationLabel(from, to)} trace={trace} compact={expanded} />

        {expanded ? (
          <View className="mt-3.5 flex-1">
            <BusTimetable
              now={now}
              period={period}
              from={from}
              to={to}
              title={`${stopName(from)} → ${destinationLabel(from, to)}`}
            />
          </View>
        ) : (
          <View className="mt-5 flex-1 gap-4">
            <StopKeys label="From" options={BUS_STOPS} value={from} onChange={setFrom} />
            {destinations.length && to ? (
              <StopKeys
                label="To"
                options={destinations.map((id) => ({ id, name: stopName(id) }))}
                value={to}
                onChange={setTo}
              />
            ) : null}
          </View>
        )}

        <PanelKey
          onPress={() => setExpanded((v) => !v)}
          accessibilityState={{ expanded }}
          style={{ marginTop: 12, minHeight: 50 }}
          contentStyle={{ flexDirection: 'row', gap: 10 }}
        >
          <Text className="font-panel-semi text-meta uppercase tracking-[0.2em] text-ink">
            {expanded ? 'Close timetable' : 'Full timetable'}
          </Text>
          <Ionicons name={expanded ? 'chevron-down' : 'chevron-up'} size={14} color={c.ink2} />
        </PanelKey>
      </View>
    </View>
  );
}
