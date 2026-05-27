// ─────────────────────────────────────────────────────────────────────────────
// V3.0 Shared TypeScript Types
// Source of truth: V3_CONCEPT_BRIEF.md §4.1
// ─────────────────────────────────────────────────────────────────────────────

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

export type Board = {
  id: string;
  name: string;
  themeId: string;
  settings: {
    quickAccessLayout: 'tabs' | 'stack' | 'hidden';
    quickAccessSetCount: number; // default 1
  };
  scenes: Scene[];
  sets: PadSet[];
};

export type Scene = {
  id: string;
  name: string;
  order: number;
  gridConfig: {
    cols: number;
    rows: number;
    gap: number;
    padSize: string;
  };
  pads: Pad[];
};

/**
 * A named quick-access collection of Pads.
 * Named "PadSet" (not "Set") to avoid collision with TypeScript built-in Set<T>.
 */
export type PadSet = {
  id: string;
  name: string;
  order: number;
  pads: Pad[];
};

export type PadType = 'single' | 'loop' | 'playlist' | 'combo';

export type Pad = {
  id: string;
  type: PadType;
  name: string;
  hotkey?: string;
  libraryItemRef: string;
  iconRef?: string;
  color?: string;
  volume: number;  // 0–100
  fadeIn: number;  // seconds
  fadeOut: number; // seconds
};

export type LibraryItemType = 'audio' | 'icon' | 'image';

export type LibraryItem = {
  id: string;
  type: LibraryItemType;
  name: string;
  blob: Blob;
  tags: string[];
  addedAt: number; // ms since epoch
};

// ---------------------------------------------------------------------------
// App state shape
//
// The canonical runtime store lives in src/state/store.ts as Preact Signals.
// This interface documents the complete shape for type safety.
// ---------------------------------------------------------------------------

export type AppMode = 'play' | 'edit';

export type AudioContextState = 'locked' | 'running' | 'suspended';

export interface AppState {
  currentBoardId: string | null;
  currentSceneId: string | null;
  currentMode: AppMode;
  activeTheme: string;
  activeSetIds: string[];
  /** IDs of pads currently in one-shot playback */
  playingPads: ReadonlySet<string>;
  /** IDs of pads currently looping */
  loopingPads: ReadonlySet<string>;
  masterVolume: number; // 0–100
}
