// ─────────────────────────────────────────────────────────────────────────────
// App — Root component
//
// Currently renders StartScreen only.
// Routing / screen switching will be added in later slices.
// ─────────────────────────────────────────────────────────────────────────────

import type { JSX } from 'preact';
import { StartScreen } from './screens/StartScreen';

export function App(): JSX.Element {
  return <StartScreen />;
}
