// Ported unchanged from course-scheduler-mobile's
// packages/shared-types/src/color.ts (Course -> ClassEntry).
import type { ClassEntry } from './models';

/**
 * Anodized inlays — the class identity colour, 16 of them.
 *
 * On this instrument a class is identified by a machined edge: a 3px inlay down
 * the left side of its keycap in the grid, the same inlay on its row in the
 * class list, and its rule in a comparison. So these are *anodized metal
 * finishes*, not UI accents — muted, low-chroma, the colour a milled aluminium
 * edge takes rather than the colour of a highlighter.
 *
 * All sixteen sit in a narrow mid-tone band (roughly 45-55% lightness) for one
 * specific reason: the same hex has to read on the silver chassis (#cbc9c0) and
 * on the near-black one (#232427) without changing, because a class that
 * changed colour between schemes would break the one thing colour is for here —
 * finding a class at a glance. That constraint is also why colour is never a
 * large fill: it is an edge, and the key face behind it stays steel.
 *
 * Hues are spread rather than ramped, and the set avoids leaning on a red/green
 * distinction, since colour is never the only carrier of meaning (every item
 * also shows its code and name).
 */
export const PALETTE: string[] = [
  '#5c7f96', // steel blue
  '#8f7355', // bronze
  '#5f8a72', // patina
  '#8f6875', // rose brass
  '#756795', // violet steel
  '#8a8659', // brass
  '#4f8a86', // verdigris
  '#96705c', // copper
  '#66799a', // slate blue
  '#7d8a59', // olive steel
  '#96607d', // magenta oxide
  '#4f8a63', // jade
  '#94794f', // ochre
  '#6e8a54', // moss
  '#5f6a9a', // indigo steel
  '#9a5f5f', // rust
];

/**
 * Assigns each class a stable color from PALETTE, sorted by class name so
 * the assignment is deterministic across reloads. Must be built once from
 * the full, unfiltered class list so a given class always renders the
 * same color everywhere (class card, schedule grid, loadout comparison) —
 * never build a per-component/per-filtered-list color map.
 */
export function buildColorMap(classes: ClassEntry[]): Map<string, string> {
  const sorted = [...classes].sort((a, b) => a.name.localeCompare(b.name));
  const map = new Map<string, string>();
  sorted.forEach((classEntry, i) => {
    map.set(classEntry.id, PALETTE[i % PALETTE.length]);
  });
  return map;
}

/** Picks black or white label text for readable contrast against a hex background. */
export function getContrastText(hex: string): '#000000' | '#ffffff' {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Perceived luminance (ITU-R BT.601)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#ffffff';
}
