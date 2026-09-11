// The capture subject: the week, photographed as the instrument rather than
// lifted off it.
//
// This used to be the grid alone on a flat sheet of stock, inside a plate
// pinned to a fixed 900px. The grid draws at its own natural width, so a
// five-day week sat 300px short of the right edge and the schedule read as
// shoved into one corner. The plate now sizes itself around the board and
// centres it, and wears the chassis, screws, nameplate and readout the app
// itself wears — what leaves the phone should look like what is on it.
//
// Everything here is laid out from known numbers, never from onLayout: this
// renders off-screen and is captured immediately, so there may be no
// measurement pass before the shot is taken.
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { Screw, chassisGradient } from '@/components/panel/Chassis';
import { CreditReadout } from '@/components/schedule/CreditReadout';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import { DEFAULT_DAY_COLUMN_WIDTH, scheduleGridWidth } from '@/lib/layout';
import { usePanelColors } from '@/lib/theme';
import type { ClassEntry, ConflictPair } from '@/lib/models';

const PLATE_PADDING = 20;
/** ScheduleGrid insets itself by mx-2. Symmetric, so it does not throw the
 *  centring off — but the plate has to account for it to fit exactly. */
const GRID_INSET = 8;
/** A five-day week is only ~544px of board. Below this the image comes out as
 *  a strip rather than a faceplate, and the nameplate and readout above it look
 *  stretched. Slack over the board width falls evenly on both sides. */
const MIN_PLATE_WIDTH = 560;

interface ExportPlateProps {
  classes: ClassEntry[];
  colorFor: (classId: string) => string;
  conflicts: ConflictPair[];
  creditCap: number;
  total: number;
}

export function ExportPlate({ classes, colorFor, conflicts, creditCap, total }: ExportPlateProps) {
  const c = usePanelColors();

  const gridWidth = scheduleGridWidth(classes);
  const plateWidth = Math.max(gridWidth + GRID_INSET * 2 + PLATE_PADDING * 2, MIN_PLATE_WIDTH);

  return (
    <LinearGradient
      {...chassisGradient(c)}
      style={{ width: plateWidth, padding: PLATE_PADDING, borderRadius: 14 }}
    >
      {/* The nameplate, engraved the way Masthead engraves it. Redrawn rather
          than reused: Masthead carries a router, safe-area insets and three
          pressables, none of which mean anything inside a PNG. */}
      <View
        className="mx-4 pb-2.5"
        style={{ borderBottomWidth: 1, borderBottomColor: c.accent + '2e' }}
      >
        <Text className="font-panel-bold text-plate uppercase text-accent-hi">MY SCHEDULE</Text>
      </View>

      <View className="mt-3">
        <CreditReadout total={total} creditCap={creditCap} conflictCount={conflicts.length} />
      </View>

      {/* Fixed column width and an exact wrapper, so the board is centred by
          construction instead of by whatever space happens to be left. */}
      <View style={{ width: gridWidth + GRID_INSET * 2, alignSelf: 'center' }} className="mt-3">
        <ScheduleGrid
          classes={classes}
          colorFor={colorFor}
          conflicts={conflicts}
          dayColumnWidth={DEFAULT_DAY_COLUMN_WIDTH}
          // Today's strike and the NOW band are suppressed: the image gets sent
          // to someone else, for whom today is not today.
          showNow={false}
        />
      </View>

      <Screw style={{ left: 10, top: 10 }} />
      <Screw style={{ right: 10, top: 10 }} />
      <Screw style={{ left: 10, bottom: 10 }} />
      <Screw style={{ right: 10, bottom: 10 }} />
    </LinearGradient>
  );
}
