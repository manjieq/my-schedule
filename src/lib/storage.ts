// The ONLY module that talks to AsyncStorage directly — everything else
// (app-state.tsx, theme.ts) goes through readJSON/writeJSON so persistence
// stays in one place.
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Reads and parses a stored value, falling back to `fallback` on a missing
 * key, corrupted JSON, or a storage read failure. A first launch (nothing
 * saved yet) and a genuinely broken read look the same to the caller by
 * design — see app-state.tsx's HYDRATE, which treats both as "start from
 * defaults" rather than surfacing a scary error for what's usually just
 * an empty app.
 */
export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Writes a value as JSON. Deliberately does NOT catch its own errors —
 * unlike a read, a failed write here is unrecoverable data loss (there's
 * no server copy to fall back on), so it must propagate to the caller,
 * which surfaces it in app state rather than failing silently.
 */
export async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
