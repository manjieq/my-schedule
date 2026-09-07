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
