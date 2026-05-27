// ─────────────────────────────────────────────────────────────────────────────
// V3.0 Central State — Preact Signals
//
// All UI state lives here as signals. Components read via signal.value or
// the auto-subscribing JSX binding. Mutations happen through the exported
// setter signals — never mutate store internals directly.
// ─────────────────────────────────────────────────────────────────────────────

import { signal } from '@preact/signals';
import type { AppMode, AudioContextState, LibraryItemMeta, UploadResult } from '../types';

// ---------------------------------------------------------------------------
// Audio context
// ---------------------------------------------------------------------------

/** Lifecycle state of the Web Audio API context. */
export const audioContextState = signal<AudioContextState>('locked');

// ---------------------------------------------------------------------------
// Navigation / routing
// ---------------------------------------------------------------------------

export type AppScreen = 'start' | 'library';

/** Top-level screen routing. Expanded with board/scene navigation in later slices. */
export const currentScreen = signal<AppScreen>('start');

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

// ---------------------------------------------------------------------------
// Library
//
// libraryItems holds LibraryItemMeta only — never a Blob.
// The blob lives exclusively in IndexedDB; use libGet(id) for playback.
// ---------------------------------------------------------------------------

/** All library entries, metadata only. Populated at app boot via libGetAllMeta(). */
export const libraryItems = signal<LibraryItemMeta[]>([]);

/**
 * Upload batch result. Set after processFilesSerial() resolves.
 * Reset to null at the start of each new upload.
 */
export const uploadStatus = signal<UploadResult | null>(null);

/** Add a newly uploaded entry to the in-memory list. */
export function addLibraryItemMeta(meta: LibraryItemMeta): void {
  libraryItems.value = [...libraryItems.value, meta];
}

/** Remove an entry from the in-memory list (after IDB delete). */
export function removeLibraryItemMeta(id: string): void {
  libraryItems.value = libraryItems.value.filter(m => m.id !== id);
}

/** Patch the name of an in-memory entry (after IDB rename). */
export function renameLibraryItemMeta(id: string, newName: string): void {
  libraryItems.value = libraryItems.value.map(m =>
    m.id === id ? { ...m, name: newName } : m
  );
}
