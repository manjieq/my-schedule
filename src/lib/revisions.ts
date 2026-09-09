// Revision plates.
//
// A saved loadout is a revision of the week, and on this instrument each one is
// filed behind a small engraved plate — the way a machined part carries a stamp
// naming its batch. The nth saved loadout gets the nth plate finish.
//
// These are anodized finishes rather than UI accents, chosen so a plate stays
// legible with the same pale ink on it in both schemes: the finish is the metal
// either way, and metal does not invert. They are not related to PALETTE in
// lib/color.ts, which identifies classes, and they are deliberately darker and
// less saturated than it so a plate never competes with a class inlay.

export interface RevisionStock {
  name: string;
  /** The plate's finish. */
  paper: string;
  /** Ink engraved into `paper`. Every finish is mid-to-dark, so this is
   *  constant — it is spelled out rather than computed so the pairing is
   *  obvious at the call site. */
  ink: string;
}

export const REVISION_STOCKS: RevisionStock[] = [
  { name: 'Steel', paper: '#4a5560', ink: '#eef1f4' },
  { name: 'Brass', paper: '#5e5334', ink: '#f6f0dd' },
  { name: 'Patina', paper: '#3c584c', ink: '#e9f3ed' },
  { name: 'Copper', paper: '#5e4438', ink: '#f6e8e0' },
  { name: 'Slate', paper: '#454a5c', ink: '#eceef6' },
  { name: 'Olive', paper: '#4c5236', ink: '#eff2e2' },
  { name: 'Oxide', paper: '#5c3c46', ink: '#f6e6ea' },
  { name: 'Graphite', paper: '#3f4144', ink: '#eeeeef' },
];

/** The plate a loadout is filed behind, by its position in the saved list.
 *  Wraps, the way a long run of revisions starts the finish order over. */
export function revisionStock(index: number): RevisionStock {
  return REVISION_STOCKS[index % REVISION_STOCKS.length];
}
