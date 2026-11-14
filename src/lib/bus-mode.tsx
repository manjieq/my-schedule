// Whether the Schedule key is showing its second function: the shuttle panel.
//
// The bus panel is not a tab of its own. Holding the Schedule key switches
// that tab to the bus panel, the way SHIFT switches a calculator key to the
// function printed above it; a plain tap switches it back. The flag lives in
// the tab layout, which owns the keys, and the Schedule screen reads it to
// decide which panel to draw. It is deliberately not persisted: the app always
// opens on the board.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface BusModeValue {
  busMode: boolean;
  setBusMode: (on: boolean) => void;
}

const BusModeContext = createContext<BusModeValue | null>(null);

export function BusModeProvider({ children }: { children: ReactNode }) {
  const [busMode, setBusMode] = useState(false);
  const value = useMemo(() => ({ busMode, setBusMode }), [busMode]);
  return <BusModeContext.Provider value={value}>{children}</BusModeContext.Provider>;
}

export function useBusMode(): BusModeValue {
  const ctx = useContext(BusModeContext);
  if (!ctx) throw new Error('useBusMode must be used within a BusModeProvider');
  return ctx;
}
