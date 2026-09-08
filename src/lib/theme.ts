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

// Material ripple tints for android_ripple. A plain opacity dim on press is
// the iOS convention (that's what every `active:opacity-*` class here used
// to do); Android users expect a ripple instead, so every Pressable in this
// app passes one of these rather than an opacity variant. useRipple() reads
// the live color scheme; pass true for a Pressable whose own background is
// already a saturated brand color (the FAB, a filled primary button) so the
// ripple reads against that color instead of against a neutral surface.
const RIPPLE_ON_LIGHT_SURFACE = 'rgba(0, 0, 0, 0.10)';
const RIPPLE_ON_DARK_SURFACE = 'rgba(255, 255, 255, 0.16)';
const RIPPLE_ON_COLOR = 'rgba(255, 255, 255, 0.28)';

export function useRipple(onColor = false): { color: string } {
  const { colorScheme } = useColorScheme();
  if (onColor) return { color: RIPPLE_ON_COLOR };
  return { color: colorScheme === 'dark' ? RIPPLE_ON_DARK_SURFACE : RIPPLE_ON_LIGHT_SURFACE };
}

/** Shared tint for secondary/meta icons (trash, location pin, empty-state
 *  glyphs) — the same neutral-400 value already used as `text-neutral-400`
 *  elsewhere, centralized here because RN icon libraries take a raw color
 *  prop rather than a className. */
export const ICON_MUTED = '#9ca3af';

/** The app's one brand accent — Tailwind's violet-600, replacing the stock
 *  blue-600 every primary action used to default to. Used identically in
 *  both themes (same as blue-600 was): it's a filled-surface or icon/text
 *  color, not a page background, so it doesn't need a separate dark-mode
 *  shade. Raw hex because RN APIs that don't take a className (Ionicons'
 *  `color`, Switch's `trackColor`/`thumbColor`, tabBarActiveTintColor) need
 *  the actual value — the `violet-600`/`violet-400` Tailwind classes used
 *  elsewhere are this same color. */
export const ACCENT = '#7c3aed';
