// ─────────────────────────────────────────────────────────────────────────────
// TopBarV2 — persistent 48px header used on all screens
//
// Source: SoS_DESIGN_25052026/v2-screens.jsx TopBarV2
// ─────────────────────────────────────────────────────────────────────────────

import type { ComponentChildren, JSX } from 'preact';
import { PixelIcon } from '../components/PixelIcon';
import type { AppMode } from '../types';

interface TopBarV2Props {
  title: string;
  breadcrumb?: string;
  /** Present only on Board screen; omit on screens without a mode toggle. */
  mode?: AppMode;
  onModeSwap?: () => void;
  /** Right-aligned slot — icon buttons, etc. */
  right?: ComponentChildren;
}

export function TopBarV2({
  title,
  breadcrumb,
  mode,
  onModeSwap,
  right,
}: TopBarV2Props): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        background: 'var(--deep)',
        borderBottom: '1px solid var(--border)',
        height: 48,
        flexShrink: 0,
      }}
    >
      {/* Flame logo */}
      <div style={{ color: 'var(--flame)', flexShrink: 0 }}>
        <PixelIcon name="flame" size={20} />
      </div>

      {/* Title + breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          minWidth: 0,
          flex: 1,
        }}
      >
        <span
          class="sb-display-vt"
          style={{
            fontSize: 22,
            letterSpacing: '.08em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>
        {breadcrumb && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-mute)',
              whiteSpace: 'nowrap',
            }}
          >
            · {breadcrumb}
          </span>
        )}
      </div>

      {/* Mode badge — only when mode is provided */}
      {mode && (
        <div
          onClick={onModeSwap}
          style={{ flexShrink: 0, cursor: onModeSwap ? 'pointer' : 'default' }}
        >
          <span
            class={
              'sb-mode-badge ' + (mode === 'play' ? 'is-game' : 'is-setup')
            }
          >
            <PixelIcon
              name={mode === 'play' ? 'play' : 'edit'}
              size={11}
              color="currentColor"
            />
            {mode === 'play' ? 'GAME' : 'SETUP'}
          </span>
        </div>
      )}

      {/* Right slot */}
      {right}
    </div>
  );
}
