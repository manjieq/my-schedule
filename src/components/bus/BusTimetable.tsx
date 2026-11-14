// The whole day's table for one stop — only when it is asked for.
//
// Opens on today's table, scrolled to now: hours already gone fold into one
// line at the top (tap it to unfold), the current hour carries the same wash
// the board uses for today, and the next bus is lit in the trim colour.
// WEEKDAY / WEEKEND lets you look at the other day's table without changing
// anything; the readout above keeps answering for today.
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Well } from '@/components/panel/Keycap';
import { PanelKey } from '@/components/panel/PanelKey';
import {
  ROUTE_MARKS,
  departuresFor,
  dayKindOn,
  minutesOfDay,
  timetableFor,
  type BusDayKind,
  type BusPeriod,
  type BusStop,
  type Departure,
} from '@/lib/bus';
import { useRipple, usePanelColors } from '@/lib/theme';

interface BusTimetableProps {
  now: Date;
  period: BusPeriod;
  from: BusStop;
  to?: BusStop;
  /** "Shuttlecock → Handaeap" */
  title: string;
}

interface HourRow {
  hour: number;
  departures: Departure[];
}

function groupByHour(list: Departure[]): HourRow[] {
  const rows: HourRow[] = [];
  for (const d of list) {
    const hour = Math.floor(d.minutes / 60);
    const last = rows[rows.length - 1];
    if (last && last.hour === hour) last.departures.push(d);
    else rows.push({ hour, departures: [d] });
  }
  return rows;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function BusTimetable({ now, period, from, to, title }: BusTimetableProps) {
  const c = usePanelColors();
  const ripple = useRipple();
  const todayKind = dayKindOn(now);
  const [kind, setKind] = useState<BusDayKind>(todayKind);
  const [showEarlier, setShowEarlier] = useState(false);

  const list = departuresFor(timetableFor(period, kind), from, to);
  const rows = groupByHour(list);

  // "Now" only means something on today's table; a peek at the other one is
  // drawn plain.
  const isToday = kind === todayKind;
  const nowMinutes = minutesOfDay(now);
  const next = isToday ? list.find((d) => d.minutes >= nowMinutes) : undefined;
  const currentHour = Math.floor(nowMinutes / 60);

  // Fold the hours already gone — but only while there is still a bus to
  // come. After the last one the whole day is history and stays visible.
  const earlier = next && !showEarlier ? rows.filter((r) => r.hour < currentHour) : [];
  const visible = earlier.length ? rows.slice(earlier.length) : rows;
  const earlierCount = earlier.reduce((n, r) => n + r.departures.length, 0);

  const marks = new Set(list.map((d) => ROUTE_MARKS[d.route]).filter(Boolean));

  return (
    <View className="flex-1">
      <View className="mb-2.5 flex-row items-center gap-2">
        <Text className="flex-1 font-panel-bold text-item text-ink" numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
        {(['weekday', 'weekend'] as const).map((option) => {
          const selected = option === kind;
          return (
            <PanelKey
              key={option}
              onPress={() => setKind(option)}
              latched={selected}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={{ minHeight: 48 }}
              contentStyle={{ paddingHorizontal: 12 }}
            >
              <Text className={`font-panel-bold text-micro uppercase ${selected ? 'text-accent-hi' : 'text-ink-2'}`}>
                {option}
              </Text>
            </PanelKey>
          );
        })}
      </View>

      <Well className="flex-1">
        <ScrollView contentContainerClassName="py-1.5 pr-1.5">
          {earlier.length ? (
            <Pressable
              onPress={() => setShowEarlier(true)}
              android_ripple={ripple}
              accessibilityRole="button"
              accessibilityLabel={`Show ${earlierCount} earlier departures`}
              className="min-h-12 justify-center pl-3"
            >
              <Text className="font-panel-bold text-micro uppercase text-ink-3">
                ▴ {pad(earlier[0].hour)}–{pad(earlier[earlier.length - 1].hour)} · {earlierCount} earlier
              </Text>
            </Pressable>
          ) : null}

          {visible.map((row) => {
            const isCurrent = isToday && row.hour === currentHour;
            const isPast = isToday && row.hour < currentHour;
            return (
              <View
                key={row.hour}
                className={`flex-row items-start py-1 ${isCurrent ? 'bg-today-wash' : ''}`}
                style={{ borderLeftWidth: 2, borderLeftColor: isCurrent ? c.todayEdge : 'transparent' }}
              >
                <Text
                  className={`w-9 text-center font-panel-bold text-label leading-[22px] ${
                    isCurrent ? 'text-accent-hi' : isPast ? 'text-ink-3' : 'text-ink-2'
                  }`}
                >
                  {pad(row.hour)}
                </Text>
                <View className="flex-1 flex-row flex-wrap gap-x-1">
                  {row.departures.map((d) => {
                    const gone = isToday && d.minutes < nowMinutes;
                    const lit = d === next;
                    const mark = ROUTE_MARKS[d.route];
                    return (
                      <View key={`${d.minutes}-${d.route}`} className="w-8">
                        <Text
                          className={`font-panel-semi text-body leading-[22px] ${
                            lit ? 'text-accent-hi' : gone ? 'text-ink-3' : 'text-ink'
                          }`}
                          style={[
                            { fontVariant: ['tabular-nums'] },
                            lit ? { textDecorationLine: 'underline', textDecorationColor: c.accent } : null,
                          ]}
                        >
                          {pad(d.minutes % 60)}
                        </Text>
                        {mark ? (
                          <Text
                            className={`absolute right-0.5 top-0 font-panel-bold text-tag ${
                              lit ? 'text-accent-hi' : gone ? 'text-ink-3' : 'text-ink-2'
                            }`}
                          >
                            {mark}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Well>

      {/* The key to the marks. Colour never carries a route on its own. */}
      <View className="mt-2 flex-row flex-wrap gap-x-4 gap-y-1 px-0.5">
        <Text className="font-panel text-code text-ink-2">
          <Text className="font-panel-bold text-ink">00</Text> direct
        </Text>
        {marks.has('C') ? (
          <Text className="font-panel text-code text-ink-2">
            <Text className="font-panel-bold text-ink">C</Text> cycle route
          </Text>
        ) : null}
        {marks.has('J') ? (
          <Text className="font-panel text-code text-ink-2">
            <Text className="font-panel-bold text-ink">J</Text> via Jungang Stn
          </Text>
        ) : null}
      </View>
    </View>
  );
}
