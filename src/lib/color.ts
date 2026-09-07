// Ported unchanged from course-scheduler-mobile's
// packages/shared-types/src/color.ts (Course -> ClassEntry).
import type { ClassEntry } from './models';

/** Fixed categorical palette (Tableau-10-inspired, extended to 16), colorblind-friendly. */
export const PALETTE: string[] = [
  '#4E79A7',
  '#F28E2B',
  '#E15759',
  '#76B7B2',
  '#59A14F',
  '#EDC948',
  '#B07AA1',
  '#FF9DA7',
  '#9C755F',
  '#BAB0AC',
  '#86BCB6',
  '#F1CE63',
  '#D37295',
  '#8CD17D',
  '#B6992D',
  '#499894',
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
