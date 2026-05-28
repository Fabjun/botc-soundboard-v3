// ─────────────────────────────────────────────────────────────────────────────
// Audio engine — internal types
// ─────────────────────────────────────────────────────────────────────────────

import type { ComboPad, Pad } from '../types';

/** Callbacks wired by index.ts to connect engine events to Preact Signals. */
export type AudioCallbacks = {
  onPadStarted: (id: string, isLoop: boolean) => void;
  onPadStopped: (id: string) => void;
  /** Resolves a pad by ID — required for combo step execution. */
  getPad: (id: string) => Pad | null;
};

/**
 * A self-contained playable handle produced by createPadInstance().
 * Used exclusively inside the combo sequencer.
 */
export type PadInstance = {
  start: (onEnded: (() => void) | null) => void;
  stop: () => void;
};

/** Per-combo runtime state stored in comboState[padId]. */
export type ComboRuntimeState = {
  stopped: boolean;
  bgInstances: PadInstance[];
  currentFgInstances: PadInstance[];
  onFinish: (() => void) | null;
  pauseTimer?: ReturnType<typeof setTimeout>;
  /** Reference to the ComboPad for cleanup: iterate steps to stop nested combos. */
  pad: ComboPad;
};
