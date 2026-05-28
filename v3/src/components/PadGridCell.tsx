// ─────────────────────────────────────────────────────────────────────────────
// PadGridCell — single cell in the 4×4 pad grid
//
// Two states:
//   occupied (.sb-pad.is-deep): shows type-colored pad with name + type badge
//   empty (.sb-pad-grid-cell.is-empty): dashed shell with centered +, click → Path A
//
// DnD state classes applied from outside by padDnd.ts via cellRef:
//   is-drag-source, is-drag-swap, is-insert-before, is-insert-after
// ─────────────────────────────────────────────────────────────────────────────

import type { JSX } from 'preact';
import type { AppMode, Pad } from '../types';
import { padTypeColor, padTypeLabel } from '../lib/padUtils';
import { play, stop, isPlaying } from '../audio/index';
import { playingPads, loopingPads } from '../state/store';

interface PadGridCellProps {
  pad: Pad | null;
  mode: AppMode;
  selected: boolean;
  /** Grid position of this cell (used as data-pos attribute for drag-over). */
  col: number;
  row: number;
  /** Called when empty cell is tapped (→ Path A); receives the cell's DOMRect. */
  onEmpty: (rect: DOMRect) => void;
  /** Called when occupied cell is tapped in SETUP mode. */
  onPadSelect: (pad: Pad) => void;
  /** Called on pad pointerdown (SETUP mode only — starts DnD). */
  onPadPointerDown?: (e: PointerEvent, pad: Pad) => void;
  /** Callback to register the cell DOM element with padDnd.ts. */
  cellRef?: (el: HTMLElement | null) => void;
}

export function PadGridCell({
  pad,
  mode,
  selected,
  col,
  row,
  onEmpty,
  onPadSelect,
  onPadPointerDown,
  cellRef,
}: PadGridCellProps): JSX.Element {
  if (!pad) {
    return (
      <div
        ref={cellRef as ((el: Element | null) => void) | undefined}
        class="sb-pad-grid-cell is-empty"
        data-pos={`${col},${row}`}
        data-testid={`pad-cell-empty-${col}-${row}`}
        onClick={(e) => onEmpty((e.currentTarget as HTMLElement).getBoundingClientRect())}
        role="button"
        aria-label="Add pad"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onEmpty((e.currentTarget as HTMLElement).getBoundingClientRect());
          }
        }}
      >
        <span class="sb-pad-cell-add" aria-hidden="true">
          +
        </span>
      </div>
    );
  }

  // Capture non-null reference — pad is guaranteed Pad (not null) by the guard above.
  const p = pad;
  const color = padTypeColor(p.type);
  const typeLabel = padTypeLabel(p.type);
  const isSetup = mode === 'edit';
  const isHot = playingPads.value.has(p.id);
  const isLooping = loopingPads.value.has(p.id);

  function handleTap(): void {
    if (isSetup) {
      onPadSelect(p);
      return;
    }
    // GAME mode: play/stop toggle
    if (isPlaying(p.id)) {
      stop(p.id);
    } else {
      play(p.id, p);
    }
  }

  return (
    <div
      ref={cellRef as ((el: Element | null) => void) | undefined}
      class="sb-pad-grid-cell"
      data-pos={`${col},${row}`}
      data-testid={`pad-cell-${p.id}`}
    >
      <div
        class={
          'sb-pad is-deep' +
          (isSetup ? ' is-setup' : '') +
          (selected ? ' is-active' : '') +
          (isHot ? ' is-hot' : '') +
          (isLooping ? ' is-looping' : '')
        }
        style={
          {
            '--pad-color': color,
            '--pad-glow': `var(--pad-${p.type}-glow)`,
            '--pix-bg': 'var(--raised)',
            height: '100%',
            touchAction: 'none', // required for pointer capture on iOS
          } as Record<string, string>
        }
        onClick={handleTap}
        onPointerDown={
          isSetup && onPadPointerDown ? (e: PointerEvent) => onPadPointerDown(e, p) : undefined
        }
        role="button"
        aria-label={p.name}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleTap();
        }}
      >
        {/* Type badge */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color,
            letterSpacing: '.08em',
            opacity: 0.8,
          }}
        >
          {typeLabel}
        </div>

        {/* Pad name */}
        <div
          class="sb-pad-title"
          style={{
            fontSize: 'var(--fs-sm)',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {p.name || '—'}
        </div>

        {/* Hotkey badge */}
        {p.hotkey && <div class="sb-pad-key">{p.hotkey}</div>}

        {/* SETUP: drag handle indicator */}
        {isSetup && (
          <div
            style={{
              position: 'absolute',
              bottom: 4,
              right: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--border-strong)',
              cursor: 'grab',
              userSelect: 'none',
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            ⣿
          </div>
        )}
      </div>
    </div>
  );
}
