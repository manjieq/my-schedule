// Adapted from course-scheduler-mobile's apps/mobile/lib/theme.ts. Every
// component styles with NativeWind's `dark:` variant, driven by the OS
// scheme by default; this adds a per-user override on top, not a parallel
// styling system. NativeWind v4's colorScheme.set() calls React Native's
// own Appearance.setColorScheme() under the hood, which is what every
// existing `dark:` class already reacts to — no component needs to know
// this override exists.
import { colorScheme, useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';

import { readJSON, writeJSON } from './storage';
import { STORAGE_KEYS, type ThemePreference } from './models';

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Persists and applies a theme choice — see app/settings.tsx. colorScheme.set
 * drives every `dark:` class in the app immediately, but is in-memory only;
 * the storage write here is what makes the choice survive an app restart,
 * read back by useThemeRestore below. Propagates a write failure to the
 * caller (Settings) rather than swallowing it, same reasoning as app-state's
 * writes.
 */
export async function setThemePreference(preference: ThemePreference): Promise<void> {
  colorScheme.set(preference);
  await writeJSON(STORAGE_KEYS.themePreference, preference);
}

/**
 * Reads back the last-saved preference, e.g. for the Settings screen to
 * highlight the active choice — NativeWind's own useColorScheme() only
 * exposes the *resolved* light/dark value, not whether the user actually
 * picked "system" or just happens to be on a system that resolves the
 * same way.
 */
export async function getThemePreference(): Promise<ThemePreference> {
  const saved = await readJSON<string | null>(STORAGE_KEYS.themePreference, null);
  return isThemePreference(saved) ? saved : 'system';
}

/**
 * Restores and applies the saved preference on app startup, and reports
 * when that's done so app/_layout.tsx can hold the splash screen up until
 * this finishes too — avoids a flash of the wrong theme while the read is
 * still in flight. A first launch with nothing ever saved just leaves
 * NativeWind at its own 'system' default, nothing to apply.
 */
export function useThemeRestore(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getThemePreference()
      .then((preference) => {
        if (preference !== 'system') colorScheme.set(preference);
      })
      .finally(() => {
        if (isMounted) setIsReady(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return isReady;
}

export { useColorScheme };

/* ---------------------------------------------------------------------------
   Raw colour values.

   These mirror src/global.css exactly, and exist only for the React Native APIs
   that cannot take a className: Ionicons' `color`, Switch's `trackColor` /
   `thumbColor`, `android_ripple`, expo-router's tabBar tints, ActivityIndicator,
   and the gradient stops the chassis and keycaps are built from. Anything that
   CAN take a className must use the Tailwind token instead (`text-ink-2`, not
   `panelColors('dark').ink2`) — two ways to say the same colour is how the old
   code drifted.

   If you change a value here, change it in src/global.css in the same edit.
--------------------------------------------------------------------------- */

export interface PanelColors {
  /** The app's ground. Always chassis2. */
  stock: string;
  /** Brushed-steel gradient stops, lightest first. */
  chassis1: string;
  chassis2: string;
  chassis3: string;
  /** The machined ring around the body. */
  edge: string;
  /** Keycap gradient stops, lit from above. */
  key1: string;
  key2: string;
  /** A recess cut into the body: grid columns, toggle slots, excluded rows. */
  well: string;
  ink: string;
  ink2: string;
  ink3: string;
  hair: string;
  /** Trim. Fills exactly one key per screen; never a large surface. */
  accent: string;
  accentHi: string;
  accentLo: string;
  onAccent: string;
  /** The LCD well and its segments. Never used outside the readout. */
  lcd: string;
  lcd2: string;
  segOn: string;
  segOff: string;
  lcdLabel: string;
  /** Segment bloom. Transparent in light — a daylight LCD does not emit. */
  lcdGlow: string;
  screw1: string;
  screw2: string;
  alert: string;
  warn: string;
  alertWash: string;
  warnWash: string;
  todayWash: string;
  todayEdge: string;
}

/** Casio fx-570ES: silver body, blue trim, reflective readout. */
const LIGHT: PanelColors = {
  stock: '#cbc9c0',
  chassis1: '#dedcd4',
  chassis2: '#cbc9c0',
  chassis3: '#b8b6ac',
  edge: '#a3a198',
  key1: '#f0eee7',
  key2: '#dedbd2',
  well: '#c6c4bb',
  ink: '#23262a',
  ink2: 'rgba(35, 38, 42, 0.58)',
  ink3: 'rgba(35, 38, 42, 0.4)',
  hair: 'rgba(35, 38, 42, 0.08)',
  accent: '#55678f',
  accentHi: '#6d7fa8',
  accentLo: '#3f4f73',
  onAccent: '#f4f8fb',
  lcd: '#aab79f',
  lcd2: '#98a78d',
  segOn: '#1b2a1e',
  segOff: 'rgba(27, 42, 30, 0.08)',
  lcdLabel: 'rgba(27, 42, 30, 0.62)',
  lcdGlow: 'transparent',
  screw1: '#f2f1ec',
  screw2: '#9a988e',
  alert: '#c8102e',
  warn: '#a86400',
  alertWash: '#f0dcdf',
  warnWash: '#ece0c6',
  todayWash: 'rgba(85, 103, 143, 0.055)',
  todayEdge: 'rgba(85, 103, 143, 0.28)',
};

/** The instrument at rest: near-black steel, gold trim, backlit readout. */
const DARK: PanelColors = {
  stock: '#232427',
  chassis1: '#3a3b3d',
  chassis2: '#232427',
  chassis3: '#17181a',
  edge: '#4c4d50',
  key1: '#2c2d30',
  key2: '#1c1d1f',
  well: '#141517',
  ink: '#ece7d8',
  ink2: 'rgba(236, 231, 216, 0.42)',
  ink3: 'rgba(236, 231, 216, 0.28)',
  hair: 'rgba(255, 255, 255, 0.045)',
  accent: '#c7a455',
  accentHi: '#e8cd8a',
  accentLo: '#9c8143',
  onAccent: '#201804',
  lcd: '#1c2b22',
  lcd2: '#12201a',
  segOn: '#8fe3a0',
  segOff: 'rgba(143, 227, 160, 0.09)',
  lcdLabel: 'rgba(143, 227, 160, 0.55)',
  lcdGlow: 'rgba(143, 227, 160, 0.55)',
  screw1: '#6b6c6f',
  screw2: '#202123',
  alert: '#f5354f',
  warn: '#ffc233',
  alertWash: '#2b1014',
  warnWash: '#2a2109',
  todayWash: 'rgba(199, 164, 85, 0.05)',
  todayEdge: 'rgba(199, 164, 85, 0.26)',
};

/** The resolved palette for the live colour scheme. */
export function usePanelColors(): PanelColors {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? DARK : LIGHT;
}

/** Same palette, for the handful of non-hook callers (the off-screen export
 *  plate, which renders at a fixed scheme). Prefer usePanelColors(). */
export function panelColors(scheme: 'light' | 'dark'): PanelColors {
  return scheme === 'dark' ? DARK : LIGHT;
}

/* ---------------------------------------------------------------------------
   Depth.

   Every shadow in this world models a real material edge. A keycap sits on a
   hard offset shadow that IS its height: pressing it removes the offset rather
   than adding an effect, so the shadow change is the press feedback. React
   Native cannot express two shadows on one View, so the ambient half is dropped
   and the offset half — the part that carries the illusion — is kept.

   Do not put KEY_REST on something that is not a key. It belongs to the keycap,
   not to cards generally.
--------------------------------------------------------------------------- */

export const KEY_REST = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.5,
  shadowRadius: 0,
  elevation: 3,
} as const;

export const KEY_PRESSED = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.4,
  shadowRadius: 1,
  elevation: 1,
} as const;

// Material ripple tints for android_ripple. A plain opacity dim on press is
// the iOS convention (that's what every `active:opacity-*` class here used
// to do); Android users expect a ripple instead, so every Pressable in this
// app passes one of these rather than an opacity variant. useRipple() reads
// the live color scheme; pass true for a Pressable whose own background is
// already accent-filled (the one primary key per screen) so the ripple reads
// against that fill instead of against the chassis.
const RIPPLE_ON_LIGHT_SURFACE = 'rgba(0, 0, 0, 0.10)';
const RIPPLE_ON_DARK_SURFACE = 'rgba(255, 255, 255, 0.16)';
const RIPPLE_ON_LIGHT_FILL = 'rgba(255, 255, 255, 0.24)';
const RIPPLE_ON_DARK_FILL = 'rgba(0, 0, 0, 0.20)';

/** @param onFill true for a Pressable whose own background is the accent fill —
 *  the ripple then has to read against the trim colour, which changes between
 *  schemes because the trim itself does. */
export function useRipple(onFill = false): { color: string } {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  if (onFill) return { color: isDark ? RIPPLE_ON_DARK_FILL : RIPPLE_ON_LIGHT_FILL };
  return { color: isDark ? RIPPLE_ON_DARK_SURFACE : RIPPLE_ON_LIGHT_SURFACE };
}

/* ---------------------------------------------------------------------------
   Type.

   One face is bundled (see assets/fonts, loaded in app/_layout.tsx): Chivo, in
   three weights. A control panel is engraved in a single die, so there is no
   second typeface — the hierarchy is carried by weight, size and tracking.

   Chivo carries no Hangul, and that matters: the user's class names,
   instructors and rooms are Korean (see PRODUCT.md). Android's per-glyph font
   fallback substitutes the system Korean face inside a run set in Chivo, so
   mixed strings render, but the *weight* will not always carry across the
   fallback. So: never set a panel face on user-entered content. Class names use
   the platform default, where Korean and Latin both have a real bold.
--------------------------------------------------------------------------- */

export const FONTS = {
  'Chivo-Regular': require('../../assets/fonts/Chivo-Regular.ttf'),
  'Chivo-SemiBold': require('../../assets/fonts/Chivo-SemiBold.ttf'),
  'Chivo-Bold': require('../../assets/fonts/Chivo-Bold.ttf'),
} as const;
