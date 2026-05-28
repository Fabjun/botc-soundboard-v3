// ─────────────────────────────────────────────────────────────────────────────
// BoardTopBarV3 — 3-column header for Board screen
//
// Source: SoS_DESIGN_25052026/v24-mode-toggle.jsx BoardTopBarV3
//
// Layout: 1fr (left: flame + breadcrumb) | auto (center: ModeToggle) | 1fr (right: actions)
// ─────────────────────────────────────────────────────────────────────────────

import type { JSX } from 'preact';
import { PixelIcon } from './PixelIcon';
import { ModeToggle } from './ModeToggle';
import type { AppMode } from '../types';

interface BoardTopBarV3Props {
  boardName: string;
  sceneName?: string;
  mode: AppMode;
  onModeSwitch: (newMode: AppMode) => void;
  /** Toggle state of the library panel (right slot) */
  libraryOpen: boolean;
  onLibraryToggle: () => void;
  onBack: () => void;
}

export function BoardTopBarV3({
  boardName,
  sceneName,
  mode,
  onModeSwitch,
  libraryOpen,
  onLibraryToggle,
  onBack,
}: BoardTopBarV3Props): JSX.Element {
  // Detect compact (mobile) viewport
  const compact = typeof window !== 'undefined' && window.innerWidth < 480;

  return (
    <div class="sb-board-topbar">
      {/* Left: back button + breadcrumb */}
      <div class="sb-board-topbar-left">
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          data-testid="board-back-button"
          onClick={onBack}
          title="Back to board list"
          style={{ minWidth: 44, padding: '0 8px' }}
        >
          <PixelIcon name="flame" size={14} color="var(--flame)" />
        </button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            minWidth: 0,
          }}
        >
          <span
            class="sb-display-vt"
            style={{
              fontSize: 16,
              letterSpacing: '.06em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: compact ? 80 : 140,
            }}
          >
            {boardName}
          </span>
          {sceneName && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-mute)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              · {sceneName}
            </span>
          )}
        </div>
      </div>

      {/* Center: Mode toggle */}
      <ModeToggle mode={mode} onSwitch={onModeSwitch} compact={compact} />

      {/* Right: library toggle + secondary actions */}
      <div class="sb-board-topbar-right">
        <button
          class={`sb-btn sb-btn-sm ${libraryOpen ? 'sb-btn-primary' : 'sb-btn-ghost'}`}
          onClick={onLibraryToggle}
          title={libraryOpen ? 'Close library panel' : 'Open library panel'}
          style={{ minWidth: 44, padding: '0 8px', gap: 4 }}
        >
          <PixelIcon name="book" size={12} />
          {!compact && 'LIB'}
        </button>
      </div>
    </div>
  );
}
