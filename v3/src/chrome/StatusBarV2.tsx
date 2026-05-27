// ─────────────────────────────────────────────────────────────────────────────
// StatusBarV2 — fixed bottom bar showing mode, board, and info
//
// Source: SoS_DESIGN_25052026/v2-screens.jsx StatusBarV2
// ─────────────────────────────────────────────────────────────────────────────

import type { ComponentChildren, JSX } from 'preact';
import type { AppMode } from '../types';

interface StatusBarV2Props {
  mode: AppMode;
  boardName?: string;
  infoText?: string;
  right?: ComponentChildren;
}

export function StatusBarV2({ mode, boardName, infoText, right }: StatusBarV2Props): JSX.Element {
  const modeColor = mode === 'play' ? 'var(--gold)' : 'var(--mode-setup)';
  const modeLabel = mode === 'play' ? 'LIVE' : 'EDIT';

  return (
    <div class="sb-status-bar">
      <span class="sb-status-section" style={{ color: modeColor }}>
        {modeLabel}
      </span>
      {boardName && <span class="sb-status-section">{boardName}</span>}
      {infoText && <span class="sb-status-section">{infoText}</span>}
      {right && <span style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>{right}</span>}
    </div>
  );
}
