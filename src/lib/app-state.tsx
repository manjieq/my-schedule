// The single useReducer + Context store for the whole app. Hydrates from
// AsyncStorage (via storage.ts) on mount, then write-throughs every slice
// that changes. This is the ONLY place that decides *when* to persist —
// storage.ts only knows *how*.
import * as Crypto from 'expo-crypto';
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

import { getErrorMessage } from './errors';
import {
  DEFAULT_CREDIT_CAP,
  STORAGE_KEYS,
  type ClassEntry,
  type Loadout,
  type TimeSlot,
} from './models';
import { readJSON, writeJSON } from './storage';

interface AppState {
  isHydrated: boolean;
  classes: ClassEntry[];
  includedIds: string[];
  loadouts: Loadout[];
  creditCap: number;
  /** Message for the most recent failed write, if any — cleared by
   *  DISMISS_SAVE_ERROR. Surfaced by ErrorState so a failed save is never
   *  silent (see lib/storage.ts's writeJSON doc comment for why). */
  saveError: string | null;
}

type Action =
  | { type: 'HYDRATE'; classes: ClassEntry[]; includedIds: string[]; loadouts: Loadout[]; creditCap: number }
  | { type: 'ADD_CLASS'; name: string; code?: string; location?: string; credits: number; instructor?: string; schedule: TimeSlot[] }
  | { type: 'UPDATE_CLASS'; id: string; name: string; code?: string; location?: string; credits: number; instructor?: string; schedule: TimeSlot[] }
  | { type: 'DELETE_CLASS'; id: string }
  | { type: 'TOGGLE_INCLUDED'; id: string }
  | { type: 'SET_CREDIT_CAP'; creditCap: number }
  | { type: 'SAVE_LOADOUT'; name: string }
  | { type: 'DELETE_LOADOUT'; id: string }
  | { type: 'LOAD_LOADOUT'; id: string }
  | { type: 'SET_SAVE_ERROR'; error: string }
  | { type: 'DISMISS_SAVE_ERROR' };

const initialState: AppState = {
  isHydrated: false,
  classes: [],
  includedIds: [],
  loadouts: [],
  creditCap: DEFAULT_CREDIT_CAP,
  saveError: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        isHydrated: true,
        classes: action.classes,
        includedIds: action.includedIds,
        loadouts: action.loadouts,
        creditCap: action.creditCap,
      };

    case 'ADD_CLASS': {
      const classEntry: ClassEntry = {
        id: Crypto.randomUUID(),
        name: action.name,
        code: action.code,
        location: action.location,
        credits: action.credits,
        instructor: action.instructor,
        schedule: action.schedule,
        createdAt: new Date().toISOString(),
      };
      // New classes default to included — matches the reference app's
      // "new adds default to included" cart semantics.
      return {
        ...state,
        classes: [...state.classes, classEntry],
        includedIds: [...state.includedIds, classEntry.id],
      };
    }

    case 'UPDATE_CLASS':
      return {
        ...state,
        classes: state.classes.map((c) =>
          c.id === action.id
            ? {
                ...c,
                name: action.name,
                code: action.code,
                location: action.location,
                credits: action.credits,
                instructor: action.instructor,
                schedule: action.schedule,
              }
            : c
        ),
      };

    case 'DELETE_CLASS':
      // Also drops the id from includedIds so a deleted class can't linger
      // in the schedule/credit total. Loadouts are left untouched (they're
      // immutable snapshots) — a loadout referencing a since-deleted class
      // just won't resolve that id at render time; see loadout-compare.ts.
      return {
        ...state,
        classes: state.classes.filter((c) => c.id !== action.id),
        includedIds: state.includedIds.filter((id) => id !== action.id),
      };

    case 'TOGGLE_INCLUDED':
      return {
        ...state,
        includedIds: state.includedIds.includes(action.id)
          ? state.includedIds.filter((id) => id !== action.id)
          : [...state.includedIds, action.id],
      };

    case 'SET_CREDIT_CAP':
      return { ...state, creditCap: action.creditCap };

    case 'SAVE_LOADOUT': {
      const includedClasses = state.classes.filter((c) => state.includedIds.includes(c.id));
      const loadout: Loadout = {
        id: Crypto.randomUUID(),
        name: action.name,
        classIds: includedClasses.map((c) => c.id),
        totalCredits: includedClasses.reduce((sum, c) => sum + c.credits, 0),
        createdAt: new Date().toISOString(),
      };
      return { ...state, loadouts: [...state.loadouts, loadout] };
    }

    case 'DELETE_LOADOUT':
      return { ...state, loadouts: state.loadouts.filter((l) => l.id !== action.id) };

    case 'LOAD_LOADOUT': {
      const loadout = state.loadouts.find((l) => l.id === action.id);
      if (!loadout) return state;
      // Filter out ids for classes that no longer exist, so loading an old
      // loadout can't resurrect a dangling reference into includedIds.
      const existingIds = new Set(state.classes.map((c) => c.id));
      return { ...state, includedIds: loadout.classIds.filter((id) => existingIds.has(id)) };
    }

    case 'SET_SAVE_ERROR':
      return { ...state, saveError: action.error };

    case 'DISMISS_SAVE_ERROR':
      return { ...state, saveError: null };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate once on mount.
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      readJSON<ClassEntry[]>(STORAGE_KEYS.classes, []),
      readJSON<string[]>(STORAGE_KEYS.includedIds, []),
      readJSON<Loadout[]>(STORAGE_KEYS.loadouts, []),
      readJSON<{ creditCap: number }>(STORAGE_KEYS.settings, { creditCap: DEFAULT_CREDIT_CAP }),
    ]).then(([classes, includedIds, loadouts, settings]) => {
      if (!isMounted) return;
      dispatch({ type: 'HYDRATE', classes, includedIds, loadouts, creditCap: settings.creditCap });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Write-through: each slice persists itself once it changes, but only
  // after hydration — otherwise the initial-render defaults would
  // overwrite real saved data for the instant before HYDRATE lands.
  useEffect(() => {
    if (!state.isHydrated) return;
    writeJSON(STORAGE_KEYS.classes, state.classes).catch((err) =>
      dispatch({ type: 'SET_SAVE_ERROR', error: getErrorMessage(err) })
    );
  }, [state.isHydrated, state.classes]);

  useEffect(() => {
    if (!state.isHydrated) return;
    writeJSON(STORAGE_KEYS.includedIds, state.includedIds).catch((err) =>
      dispatch({ type: 'SET_SAVE_ERROR', error: getErrorMessage(err) })
    );
  }, [state.isHydrated, state.includedIds]);

  useEffect(() => {
    if (!state.isHydrated) return;
    writeJSON(STORAGE_KEYS.loadouts, state.loadouts).catch((err) =>
      dispatch({ type: 'SET_SAVE_ERROR', error: getErrorMessage(err) })
    );
  }, [state.isHydrated, state.loadouts]);

  useEffect(() => {
    if (!state.isHydrated) return;
    writeJSON(STORAGE_KEYS.settings, { creditCap: state.creditCap }).catch((err) =>
      dispatch({ type: 'SET_SAVE_ERROR', error: getErrorMessage(err) })
    );
  }, [state.isHydrated, state.creditCap]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within an AppStateProvider');
  return ctx;
}
