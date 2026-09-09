// The readout, at the head of the board.
//
// A bench instrument shows its number at the top, under the nameplate, and
// everything below is the work that produced it. The credit total against the
// cap is that number, so it sits directly under the nameplate rather than being
// buried at the foot with the meter it drives.
//
// The trace line carries the state of the week — the cap and the clash count —
// because status the readout can speak does not get a banner elsewhere.
import { Lcd } from '@/components/panel/Lcd';
import { SevenSegment } from '@/components/panel/SevenSegment';

interface CreditReadoutProps {
  total: number;
  creditCap: number;
  conflictCount: number;
}

export function CreditReadout({ total, creditCap, conflictCount }: CreditReadoutProps) {
  const clash =
    conflictCount === 0 ? 'no clash' : `${conflictCount} clash${conflictCount === 1 ? '' : 'es'}`;

  return (
    <Lcd className="mx-4" trace={`cap ${creditCap.toFixed(1)} · ${clash}`} legend="Total">
      <SevenSegment value={total.toFixed(1)} size={34} />
    </Lcd>
  );
}
