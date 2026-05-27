// ─────────────────────────────────────────────────────────────────────────────
// V3.0 Central State — Preact Signals
//
// All UI state lives here as signals. Components read via signal.value or
// the auto-subscribing JSX binding. Mutations happen through the exported
// setter signals — never mutate store internals directly.
// ─────────────────────────────────────────────────────────────────────────────

import { signal } from '@preact/signals';
import type { AppMode, AudioContextState } from '../types';

// ---------------------------------------------------------------------------
// Audio context
// ---------------------------------------------------------------------------

/** Lifecycle state of the Web Audio API context. */
export const audioContextState = signal<AudioContextState>('locked');

// ---------------------------------------------------------------------------
// Navigation / routing (expanded in later slices)
// ---------------------------------------------------------------------------

export const currentBoardId = signal<string | null>(null);
export const currentSceneId = signal<string | null>(null);

// ---------------------------------------------------------------------------
// Mode
// ---------------------------------------------------------------------------

/** GAME (play) vs SETUP (edit) mode — the primary UI bifurcation. */
export const currentMode = signal<AppMode>('play');

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

/** Active theme ID — maps to a CSS class applied to the root element. */
export const activeTheme = signal<string>('hearth');

// ---------------------------------------------------------------------------
// Quick-access sets
// ---------------------------------------------------------------------------

/** IDs of PadSets currently displayed in the quick-access strip. */
export const activeSetIds = signal<string[]>([]);

// ---------------------------------------------------------------------------
// Playback state
//
// Using globalThis.Set to avoid naming collision with the soundboard PadSet type.
// ReadonlySet in the type signature prevents callers from mutating directly;
// mutations go through the helpers below.
// ---------------------------------------------------------------------------

export const playingPads = signal<ReadonlySet<string>>(
  new globalThis.Set<string>()
);

export const loopingPads = signal<ReadonlySet<string>>(
  new globalThis.Set<string>()
);

/** Mark a pad as playing (one-shot). */
export function addPlayingPad(id: string): void {
  const next = new globalThis.Set(playingPads.value);
  next.add(id);
  playingPads.value = next;
}

/** Remove a pad from the playing set (playback ended). */
export function removePlayingPad(id: string): void {
  const next = new globalThis.Set(playingPads.value);
  next.delete(id);
  playingPads.value = next;
}

/** Mark a pad as looping. */
export function addLoopingPad(id: string): void {
  const next = new globalThis.Set(loopingPads.value);
  next.add(id);
  loopingPads.value = next;
}

/** Remove a pad from the looping set. */
export function removeLoopingPad(id: string): void {
  const next = new globalThis.Set(loopingPads.value);
  next.delete(id);
  loopingPads.value = next;
}

// ---------------------------------------------------------------------------
// Master volume
// ---------------------------------------------------------------------------

/** Master volume 0–100. Mirrors the master GainNode's value × 100. */
export const masterVolume = signal<number>(80);
