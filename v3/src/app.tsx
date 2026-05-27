// ─────────────────────────────────────────────────────────────────────────────
// App — Root component
//
// Responsibilities:
//  1. Bootstrap: load library metadata from IDB on first mount
//  2. Top-level screen routing via currentScreen signal
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import { currentScreen, libraryItems } from './state/store';
import { libGetAllMeta } from './db/idb';
import { StartScreen } from './screens/StartScreen';
import { LibraryScreen } from './screens/LibraryScreen';

export function App(): JSX.Element {
  // Bootstrap: populate libraryItems signal from IDB once on mount.
  // libGetAllMeta() uses a cursor — safe for any library size (no Blob in RAM).
  useEffect(() => {
    libGetAllMeta()
      .then(items => { libraryItems.value = items; })
      .catch(err => console.error('Library bootstrap failed:', err));
  }, []);

  const screen = currentScreen.value;

  if (screen === 'library') return <LibraryScreen />;
  return <StartScreen />;
}
