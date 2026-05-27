// ─────────────────────────────────────────────────────────────────────────────
// LibraryPanel — right-inspector slot showing library items (Path B)
//
// Allows dragging library items onto pad grid cells to create pads.
//
// Desktop + Mobile: Pointer-Events drag (via libDnd.ts).
//   Threshold 8px → ghost follows cursor → drop on [data-pos] cell.
//   HTML5 DnD ('draggable', ondragstart) is explicitly NOT used:
//   iOS Safari/Brave does not support it.
//
// Mobile extra: Long-Press (350ms without movement) → onEnterPlaceMode.
//   The place-mode flow (tap to place on a grid cell) is managed in BoardScreen.
//   When drag threshold is crossed, the long-press timer is cancelled.
//
// The pad creation on drop happens in BoardScreen (handleLibDrop).
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from 'preact/hooks';
import type { JSX } from 'preact';
import type { LibraryItemMeta } from '../types';
import { PixelIcon } from './PixelIcon';
import { Waveform } from './Waveform';
import { libraryItems } from '../state/store';
import { startLibDrag, type LibDndDropResult } from '../lib/libDnd';
import { useState } from 'preact/hooks';

interface LibraryPanelProps {
  onClose: () => void;
  /** Called when a library-item drag ends (drop or cancel). */
  onLibDrop: (result: LibDndDropResult) => void;
  /** Mobile: called to enter place-mode with chosen item. */
  onEnterPlaceMode?: (itemId: string) => void;
}

export function LibraryPanel({
  onClose,
  onLibDrop,
  onEnterPlaceMode,
}: LibraryPanelProps): JSX.Element {
  const [search, setSearch] = useState('');
  const items = libraryItems.value.filter((m) => m.type === 'audio');

  const filtered = search.trim()
    ? items.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  // Sort recent-first by default
  const sorted = [...filtered].sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div class="sb-library-panel">
      {/* Header */}
      <div class="sb-panel-header is-active">
        <PixelIcon name="book" size={12} />
        <span>Library</span>
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          style={{
            marginLeft: 'auto',
            minWidth: 28,
            minHeight: 28,
            padding: '0 4px',
          }}
          onClick={onClose}
          title="Close library panel"
        >
          ×
        </button>
      </div>

      {/* Search */}
      <div
        style={{
          padding: '6px 8px',
          borderBottom: '1px solid var(--border-soft)',
          background: 'var(--deep)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            background: 'var(--sunk)',
            border: '1px solid var(--border)',
          }}
        >
          <PixelIcon name="search" size={11} color="var(--text-mute)" />
          <input
            type="text"
            placeholder={`${items.length} files…`}
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-mute)',
                cursor: 'pointer',
                padding: '1px 3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Drag hint */}
      <div
        style={{
          padding: '4px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-mute)',
          background: 'var(--deep)',
          borderBottom: '1px solid var(--border-soft)',
          flexShrink: 0,
        }}
      >
        Drag onto a grid slot to create a pad
      </div>

      {/* Item list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {sorted.length === 0 ? (
          <div
            style={{
              padding: '24px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-mute)',
              textAlign: 'center',
            }}
          >
            {items.length === 0 ? 'No audio files in library.' : `No files matching "${search}"`}
          </div>
        ) : (
          sorted.map((item) => (
            <LibraryPanelRow
              key={item.id}
              item={item}
              onLibDrop={onLibDrop}
              onLongPress={onEnterPlaceMode ? () => onEnterPlaceMode(item.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── LibraryPanelRow ──────────────────────────────────────────────────────────

interface LibraryPanelRowProps {
  item: LibraryItemMeta;
  onLibDrop: (result: LibDndDropResult) => void;
  onLongPress?: () => void;
}

function LibraryPanelRow({ item, onLibDrop, onLongPress }: LibraryPanelRowProps): JSX.Element {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function formatDuration(s: number): string {
    if (s < 60) return `${s.toFixed(1)}s`;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  function cancelLongPress(): void {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  return (
    <div
      // Pointer Events drag (NOT HTML5 DnD — see file header)
      onPointerDown={(e) => {
        const rowEl = e.currentTarget as HTMLElement;

        // Long-press timer — fires at 350ms if no movement threshold is crossed
        if (onLongPress) {
          longPressTimer.current = setTimeout(() => {
            longPressTimer.current = null;
            onLongPress();
          }, 350);
        }

        // Start lib drag. onDragActivated cancels the long-press timer so
        // both paths don't fire simultaneously.
        startLibDrag(e, item.id, rowEl, onLibDrop, cancelLongPress);
      }}
      onPointerUp={cancelLongPress}
      onPointerCancel={cancelLongPress}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '6px 8px',
        borderBottom: '1px solid var(--border-soft)',
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none', // Required: prevents scroll from capturing the pointer
        gap: 3,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <PixelIcon name="play" size={10} color="var(--text-mute)" />
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name}
        </span>
        {item.duration > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-mute)',
              flexShrink: 0,
            }}
          >
            {formatDuration(item.duration)}
          </span>
        )}
      </div>
      {item.peaks && item.peaks.length > 0 && <Waveform peaks={item.peaks} height={20} />}
    </div>
  );
}
