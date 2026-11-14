// The shuttle readout: one number, on the same glass the board's credit total
// uses.
//
// The minutes to the next bus are the whole point of the panel, so they get
// the seven-segment digits and everything else is small print under them:
// the departure time, where it goes, and the two buses after it. When there
// is no sensible countdown — the next bus is hours away, or the last one has
// gone — the glass says so in words, the same way the board's rest state does.
import { Text, View } from 'react-native';

import { Lcd } from '@/components/panel/Lcd';
import { SevenSegment } from '@/components/panel/SevenSegment';
import { ROUTE_LABELS, ROUTE_MARKS, formatClock, type BusReading, type Departure } from '@/lib/bus';
import { usePanelColors } from '@/lib/theme';

interface BusReadoutProps {
  reading: BusReading;
  /** Where the bus goes: a stop name, or "Campus". */
  destination: string;
  /** Which timetable is in use, e.g. "Semester · Weekday". */
  trace: string;
  /** One line only, while the full timetable has the screen. */
  compact?: boolean;
}

/** "13:20 · 13:30 C" — the buses after the next one. */
function thenLine(then: Departure[]): string {
  return then
    .map((d) => `${formatClock(d.minutes)}${ROUTE_MARKS[d.route] ? ` ${ROUTE_MARKS[d.route]}` : ''}`)
    .join(' · ');
}

export function BusReadout({ reading, destination, trace, compact = false }: BusReadoutProps) {
  const c = usePanelColors();
  const glow = { textShadowColor: c.lcdGlow, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } };

  if (compact) {
    // Built as the Lcd's footer rather than its children: the children row is
    // laid out for a legend and right-aligned digits, and this line needs the
    // full width of the glass. The negative margin cancels that empty row.
    return (
      <Lcd
        footer={
          <View className="-mt-1.5 flex-row items-center gap-3">
            {reading.kind === 'ended' ? (
              <Text className="flex-1 font-panel-bold text-body uppercase text-seg-on" style={glow} numberOfLines={1}>
                No more buses today
              </Text>
            ) : (
              <>
                <Text className="font-panel-bold text-label uppercase text-lcd-label">Next</Text>
                <Text className="font-panel-bold text-item text-seg-on" style={glow}>
                  {formatClock(reading.next.minutes)}
                </Text>
                <Text className="flex-1 font-panel-semi text-code uppercase text-lcd-label" numberOfLines={1}>
                  {ROUTE_LABELS[reading.next.route]}
                </Text>
                {reading.kind === 'countdown' ? (
                  <View className="flex-row items-end gap-1.5">
                    <SevenSegment value={String(reading.inMinutes)} size={22} />
                    <Text className="font-panel-bold text-micro uppercase text-lcd-label">Min</Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
        }
      />
    );
  }

  if (reading.kind === 'ended') {
    const first = reading.firstTomorrow;
    return (
      <Lcd
        trace={reading.last ? `last bus left ${formatClock(reading.last.minutes)}` : trace}
        footer={
          first ? (
            <View className="mt-3 flex-row items-baseline justify-between border-t pt-2" style={{ borderColor: c.segOff }}>
              <Text className="font-panel-bold text-label uppercase text-lcd-label">First tomorrow</Text>
              <Text className="font-panel-bold text-item text-seg-on" style={glow}>
                {formatClock(first.minutes)}
                {ROUTE_MARKS[first.route] ? (
                  <Text className="font-panel-semi text-meta text-lcd-label"> {ROUTE_MARKS[first.route]}</Text>
                ) : null}
              </Text>
            </View>
          ) : null
        }
      >
        <Text className="font-panel-bold text-head uppercase text-seg-on" style={glow} numberOfLines={1}>
          No more buses
        </Text>
      </Lcd>
    );
  }

  const { next, then } = reading;
  const footer = (
    <View className="mt-3 border-t pt-2" style={{ borderColor: c.segOff }}>
      <View className="flex-row items-baseline justify-between gap-3">
        <Text className="font-panel-bold text-item text-seg-on" style={glow}>
          {formatClock(next.minutes)}
        </Text>
        <Text className="shrink font-panel-semi text-meta uppercase text-lcd-label" numberOfLines={1}>
          {destination} · {ROUTE_LABELS[next.route]}
        </Text>
      </View>
      <Text className="mt-1 font-panel-semi text-label uppercase text-lcd-label" numberOfLines={1}>
        {then.length ? `Then ${thenLine(then)}` : 'Last bus today'}
      </Text>
    </View>
  );

  if (reading.kind === 'later') {
    return (
      <Lcd trace={trace} legend="Next bus" footer={footer}>
        <Text className="font-panel-bold text-head uppercase text-seg-on" style={glow}>
          at {formatClock(next.minutes)}
        </Text>
      </Lcd>
    );
  }

  return (
    <Lcd trace={trace} legend="Next bus in" footer={footer}>
      <View className="flex-row items-end gap-2.5">
        <SevenSegment value={String(reading.inMinutes)} size={64} />
        <Text className="pb-0.5 font-panel-bold text-meta uppercase text-lcd-label">Min</Text>
      </View>
    </Lcd>
  );
}
