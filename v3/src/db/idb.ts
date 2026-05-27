// ─────────────────────────────────────────────────────────────────────────────
// V3.0 IndexedDB Layer
//
// Database: 'sos-v3', version 1
// Object stores:
//   'library'  (keyPath: 'id')  — LibraryItem entries (includes blob)
//
// MEMORY SAFETY RULES (carried over from V1 — see CLAUDE.md §iPhone rules):
//   - libGetAllMeta() uses a cursor and NEVER references cursor.value.blob.
//     At most one full record is in RAM at a time during enumeration.
//   - libGet() loads one full entry (with blob) — only call for playback.
//   - libRename() briefly holds one Blob in RAM (IDB has no partial-update;
//     it must read the full entry, patch the name, and re-put). The Blob is
//     released as soon as libRename() returns. This is intentional and safe.
// ─────────────────────────────────────────────────────────────────────────────

import { openDB, type IDBPDatabase } from 'idb';
import type { LibraryItem, LibraryItemMeta } from '../types';

// ---------------------------------------------------------------------------
// DB singleton
// ---------------------------------------------------------------------------

const DB_NAME = 'sos-v3';
const DB_VERSION = 1;

let _db: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('library')) {
        db.createObjectStore('library', { keyPath: 'id' });
      }
    },
  });
  return _db;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Enumerate all library entries — metadata only, blob excluded.
 *
 * Memory safety: uses a cursor and destructures only scalar/array fields from
 * cursor.value. The blob field is never referenced, so the Blob object is
 * GC-eligible after each cursor.continue(). At most one IDB record is loaded
 * at a time, regardless of library size.
 */
export async function libGetAllMeta(): Promise<LibraryItemMeta[]> {
  const db = await getDB();
  const results: LibraryItemMeta[] = [];
  let cursor = await db.transaction('library', 'readonly').store.openCursor();
  while (cursor) {
    // Destructure only the meta fields — blob is intentionally NOT referenced.
    // cursor.value goes out of scope after this block; Blob is GC-eligible.
    const { id, type, name, size, tags, addedAt, duration, peaks } = cursor.value as LibraryItem;
    results.push({ id, type, name, size, tags, addedAt, duration, peaks });
    cursor = await cursor.continue();
  }
  return results;
}

/**
 * Load a single full entry including its Blob.
 * Only call this when the audio data is actually needed (Slice 4+ playback).
 * The caller is responsible for releasing the Blob reference after use.
 */
export async function libGet(id: string): Promise<LibraryItem | null> {
  const db = await getDB();
  const entry = await db.get('library', id) as LibraryItem | undefined;
  return entry ?? null;
}

/**
 * Add or update a complete library entry (upsert).
 * Called once per file during upload, after peaks/duration are computed.
 */
export async function libPut(item: LibraryItem): Promise<void> {
  const db = await getDB();
  await db.put('library', item);
}

/**
 * Delete a library entry by id (SHA-256 hash).
 */
export async function libDelete(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('library', id);
}

/**
 * Rename a library entry.
 *
 * Note: IDB has no partial-update — this reads the full entry (including Blob),
 * patches the name, and writes it back. The Blob is held in RAM only for the
 * duration of this call and released when the function returns. This is
 * intentional; the alternative (separate name store) adds schema complexity
 * not justified by a single-field patch.
 */
export async function libRename(id: string, newName: string): Promise<void> {
  const entry = await libGet(id);
  if (!entry) return;
  await libPut({ ...entry, name: newName });
}
