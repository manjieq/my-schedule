// The readout, at the head of the board.
//
// A bench instrument shows its number at the top, under the nameplate, and
// everything below is the work that produced it. The credit total against the
// cap is that number, so it sits directly under the nameplate rather than being
// buried at the foot with the meter it drives.
//
// The trace line carries the state of the week — the cap and the clash count —
// because status the readout can speak does not get a banner elsewhere.
//
// With the board at rest the readout says so in words instead. Seven-segment
// digits can only draw 0-9, so a message is plain lit text on the same glass,
// and it takes the whole well: the TOTAL legend would squeeze the line, and
// the number it labels is not what is being shown.
import { Text } from 'react-native';

import { Lcd } from '@/components/panel/Lcd';
import { SevenSegment } from '@/components/panel/SevenSegment';
import { usePanelColors } from '@/lib/theme';

interface CreditReadoutProps {
  total: number;
  creditCap: number;
  conflictCount: number;
  /** Shown instead of the digits while the board is at rest. */
  message?: string;
}

export function CreditReadout({ total, creditCap, conflictCount, message }: CreditReadoutProps) {
  const c = usePanelColors();

  if (message) {
    return (
      <Lcd className="mx-4" trace="at rest · tap the board to show it">
        <Text
          className="font-panel-bold text-item uppercase text-seg-on"
          numberOfLines={1}
          style={{ textShadowColor: c.lcdGlow, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } }}
        >
          {message}
        </Text>
      </Lcd>
    );
  }

  const clash =
    conflictCount === 0 ? 'no clash' : `${conflictCount} clash${conflictCount === 1 ? '' : 'es'}`;

  return (
    <Lcd className="mx-4" trace={`cap ${creditCap.toFixed(1)} · ${clash}`} legend="Total">
      <SevenSegment value={total.toFixed(1)} size={34} />
    </Lcd>
  );
}
