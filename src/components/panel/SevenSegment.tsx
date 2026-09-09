// The readout's digits, built as seven bars per digit rather than set in a font.
//
// This is the world's signature material: a font-rendered "15.0" reads as a
// label, and the whole point of the instrument is that the total is a *readout*.
// Unlit segments stay faintly visible (segOff) — that ghosting is most of what
// makes an LCD look like an LCD rather than glowing text on a dark rectangle.
//
// The web reference uses clip-path to bevel each bar's ends; React Native has no
// clip-path, so bars are plain rounded rectangles. At the sizes this renders
// (3px bars) the bevel was never legible anyway.
import { View } from 'react-native';

import { usePanelColors } from '@/lib/theme';

/** Which of the seven bars are lit for each character. */
const GLYPHS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abgcd',
  '4': 'fgbc',
  '5': 'afgcd',
  '6': 'afgedc',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
  '-': 'g',
  ' ': '',
};

interface SevenSegmentProps {
  /** Digits, '-', ' ' and '.' — anything else renders blank. */
  value: string;
  /** Height of one digit in px. Everything else is derived from it. */
  size?: number;
}

export function SevenSegment({ value, size = 34 }: SevenSegmentProps) {
  const c = usePanelColors();

  // Proportions of the reference cell: a 17x34 box with 3px bars.
  const h = size;
  const w = Math.round(size * 0.5);
  const bar = Math.max(2, Math.round(size * 0.088));
  const long = w - bar * 2;
  const tall = Math.round((h - bar * 3) / 2);

  const lit = { backgroundColor: c.segOn, shadowColor: c.lcdGlow, shadowOpacity: 1, shadowRadius: 4, elevation: 0 };
  const dark = { backgroundColor: c.segOff };
  const round = { borderRadius: bar / 2 };

  return (
    <View className="flex-row items-end" style={{ gap: Math.max(1, Math.round(size * 0.06)) }}>
      {[...value].map((ch, i) => {
        // A decimal point is its own narrow cell sitting on the baseline, so it
        // never steals width from the digit before it.
        if (ch === '.') {
          return (
            <View key={i} style={{ width: Math.round(size * 0.235), height: h }}>
              <View
                style={[
                  { position: 'absolute', bottom: 0, left: 1, width: bar, height: bar, borderRadius: bar },
                  lit,
                ]}
              />
            </View>
          );
        }

        const on = GLYPHS[ch] ?? '';
        const seg = (k: string) => (on.includes(k) ? lit : dark);

        return (
          <View key={i} style={{ width: w, height: h }}>
            {/* a — top */}
            <View style={[{ position: 'absolute', top: 0, left: bar, width: long, height: bar }, round, seg('a')]} />
            {/* g — middle */}
            <View
              style={[
                { position: 'absolute', top: (h - bar) / 2, left: bar, width: long, height: bar },
                round,
                seg('g'),
              ]}
            />
            {/* d — bottom */}
            <View style={[{ position: 'absolute', bottom: 0, left: bar, width: long, height: bar }, round, seg('d')]} />
            {/* f — upper left */}
            <View style={[{ position: 'absolute', top: bar, left: 0, width: bar, height: tall }, round, seg('f')]} />
            {/* b — upper right */}
            <View style={[{ position: 'absolute', top: bar, right: 0, width: bar, height: tall }, round, seg('b')]} />
            {/* e — lower left */}
            <View style={[{ position: 'absolute', bottom: bar, left: 0, width: bar, height: tall }, round, seg('e')]} />
            {/* c — lower right */}
            <View style={[{ position: 'absolute', bottom: bar, right: 0, width: bar, height: tall }, round, seg('c')]} />
          </View>
        );
      })}
    </View>
  );
}
