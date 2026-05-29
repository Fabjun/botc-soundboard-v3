// ─────────────────────────────────────────────────────────────────────────────
// PadCreationPopover — Path A pad creation (tap an empty slot)
//
// Source: SoS_DESIGN_25052026/v20-pad-creation-flow.jsx
//
// Slice 3 scope:
//   - Source modes: RECENT (last 5) + BROWSE (searchable) implemented
//   - DROP HERE: Slice 8 (placeholder shown)
//   - "More options →" handoff to PadEditorPanel
//   - Type pills pre-selected via typeInference(duration)
//
// Desktop: fixed popover anchored to cell rect (flips above if < 200px below).
// Mobile (< 600px): bottom sheet via PadCreationSheet.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import type { LibraryItemMeta, Pad, PadPosition, PadType } from '../types';
import { PixelIcon } from './PixelIcon';
import { Waveform } from './Waveform';
import { libraryItems } from '../state/store';
import { typeInference, padTypeColor, padTypeLabel } from '../lib/padUtils';
import { nanoid } from '../lib/nanoid';

export type CreationResult =
  | { action: 'create'; pad: Pad }
  | { action: 'open-editor'; partialPad: Pad }
  | { action: 'cancel' };

interface PadCreationPopoverProps {
  /** Grid slot this popover is anchored to. */
  position: PadPosition;
  /** Bounding rect of the cell DOM element (for positioning). */
  cellRect: DOMRect;
  onResult: (result: CreationResult) => void;
}

type SourceTab = 'RECENT' | 'BROWSE';

const PAD_TYPES: PadType[] = ['single', 'loop', 'playlist', 'combo'];

export function PadCreationPopover({
  position,
  cellRect,
  onResult,
}: PadCreationPopoverProps): JSX.Element {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  const allAudio = libraryItems.value.filter((m) => m.type === 'audio');
  const recentAudio = [...allAudio].sort((a, b) => b.addedAt - a.addedAt).slice(0, 5);

  const [sourceTab, setSourceTab] = useState<SourceTab>('RECENT');
  const [search, setSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [padName, setPadName] = useState('');
  const [padType, setPadType] = useState<PadType>('single');

  const selectedItem = selectedItemId
    ? (allAudio.find((m) => m.id === selectedItemId) ?? null)
    : null;

  // Update type and name when item is selected
  function selectItem(item: LibraryItemMeta) {
    setSelectedItemId(item.id);
    setPadName((prev) => (prev === '' ? item.name : prev));
    setPadType(typeInference(item.duration, 1));
  }

  const filteredBrowse = search.trim()
    ? allAudio.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : allAudio;

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onResult({ action: 'cancel' });
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onResult]);

  function buildPad(id: string): Pad {
    const base = {
      id,
      name: padName.trim() || (selectedItem?.name ?? 'New Pad'),
      position,
      volume: 80,
      fadeIn: 0,
      fadeOut: 0,
    };
    switch (padType) {
      case 'single':
        return { ...base, type: 'single', libraryItemRef: selectedItemId ?? undefined };
      case 'loop':
        return { ...base, type: 'loop', libraryItemRef: selectedItemId ?? undefined };
      case 'playlist':
        return { ...base, type: 'playlist', files: selectedItemId ? [selectedItemId] : [] };
      case 'combo':
        return { ...base, type: 'combo', steps: [] };
    }
  }

  function handleCreate() {
    onResult({ action: 'create', pad: buildPad(nanoid()) });
  }

  function handleMoreOptions() {
    onResult({ action: 'open-editor', partialPad: buildPad(nanoid()) });
  }

  const content = (
    <>
      {/* Source tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-soft)',
          flexShrink: 0,
        }}
      >
        {(['RECENT', 'BROWSE'] as SourceTab[]).map((tab) => (
          <button
            key={tab}
            data-testid={`creation-tab-${tab.toLowerCase()}`}
            onClick={() => setSourceTab(tab)}
            style={{
              flex: 1,
              padding: '6px 0',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--fs-sm)',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: sourceTab === tab ? 'var(--gold)' : 'var(--text-mute)',
              borderBottom: sourceTab === tab ? '2px solid var(--gold)' : '2px solid transparent',
              cursor: 'pointer',
              minHeight: 36,
            }}
          >
            {tab}
          </button>
        ))}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--fs-sm)',
            letterSpacing: '.08em',
            color: 'var(--text-mute)',
            opacity: 0.5,
            cursor: 'not-allowed',
            borderBottom: '2px solid transparent',
          }}
          title="Drop Here — Slice 8"
        >
          DROP
        </div>
      </div>

      {/* Source list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          minHeight: 0,
        }}
      >
        {sourceTab === 'RECENT' && (
          <>
            {recentAudio.length === 0 ? (
              <EmptyHint text="No audio in library yet." />
            ) : (
              recentAudio.map((item) => (
                <SourceItem
                  key={item.id}
                  item={item}
                  selected={selectedItemId === item.id}
                  onSelect={() => selectItem(item)}
                />
              ))
            )}
          </>
        )}

        {sourceTab === 'BROWSE' && (
          <>
            <div
              style={{
                padding: '4px 6px',
                borderBottom: '1px solid var(--border-soft)',
                flexShrink: 0,
              }}
            >
              <input
                type="text"
                placeholder={`Search ${allAudio.length} files…`}
                value={search}
                onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
                autoFocus
              />
            </div>
            {filteredBrowse.length === 0 ? (
              <EmptyHint text="No matches." />
            ) : (
              filteredBrowse
                .slice(0, 30)
                .map((item) => (
                  <SourceItem
                    key={item.id}
                    item={item}
                    selected={selectedItemId === item.id}
                    onSelect={() => selectItem(item)}
                  />
                ))
            )}
          </>
        )}
      </div>

      {/* Name + type row */}
      <div
        style={{
          padding: '8px',
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          data-testid="creation-pad-name-input"
          value={padName}
          placeholder={selectedItem?.name ?? 'Pad name…'}
          onInput={(e) => setPadName((e.target as HTMLInputElement).value)}
          style={{
            width: '100%',
            background: 'var(--sunk)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--fs-md)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            padding: '5px 8px',
            outline: 'none',
          }}
        />
        <div class="sb-row-sm">
          {PAD_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setPadType(t)}
              style={{
                flex: 1,
                padding: '2px 0',
                background:
                  padType === t
                    ? `color-mix(in srgb, ${padTypeColor(t)}, transparent 80%)`
                    : 'var(--sunk)',
                border: `1px solid ${padType === t ? padTypeColor(t) : 'var(--border-soft)'}`,
                color: padType === t ? padTypeColor(t) : 'var(--text-mute)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                minHeight: 28,
              }}
            >
              {padTypeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: '6px 8px',
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          style={{ fontSize: '11px', color: 'var(--text-mute)', minHeight: 32 }}
          onClick={handleMoreOptions}
        >
          More options →
        </button>
        <div class="sb-flex-1" />
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          data-testid="creation-cancel"
          onClick={() => onResult({ action: 'cancel' })}
          style={{ minHeight: 36 }}
        >
          CANCEL
        </button>
        <button
          class="sb-btn sb-btn-sm sb-btn-primary"
          data-testid="creation-add-pad"
          onClick={handleCreate}
          disabled={!selectedItemId}
          style={{
            minHeight: 36,
            opacity: selectedItemId ? 1 : 0.4,
            cursor: selectedItemId ? 'pointer' : 'default',
          }}
        >
          ADD PAD
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div class="sb-creation-sheet-backdrop" onClick={() => onResult({ action: 'cancel' })} />
        <div
          class="sb-creation-sheet"
          data-testid="pad-creation-popover"
          style={{
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '80dvh',
          }}
        >
          <div
            style={{
              padding: '12px 16px 8px',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--fs-md)',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--text)',
              borderBottom: '1px solid var(--border-soft)',
              flexShrink: 0,
            }}
          >
            Add Pad — {String.fromCharCode(64 + (position.row * 4 + position.col + 1))}
            {position.row * 4 + position.col + 1}
          </div>
          {content}
        </div>
      </>
    );
  }

  // Desktop positioning — flip above if < 240px below
  const spaceBelow = window.innerHeight - cellRect.bottom;
  const popoverHeight = 380;
  const top = spaceBelow >= popoverHeight ? cellRect.bottom + 4 : cellRect.top - popoverHeight - 4;
  const left = Math.min(Math.max(4, cellRect.left), window.innerWidth - 304);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 399,
        }}
        onClick={() => onResult({ action: 'cancel' })}
        aria-hidden="true"
      />
      <div
        class="sb-creation-popover"
        data-testid="pad-creation-popover"
        style={{
          top,
          left,
          height: popoverHeight,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </>
  );
}

// ── SourceItem ────────────────────────────────────────────────────────────────

function SourceItem({
  item,
  selected,
  onSelect,
}: {
  item: LibraryItemMeta;
  selected: boolean;
  onSelect: () => void;
}): JSX.Element {
  function fmt(s: number): string {
    if (s < 60) return `${s.toFixed(1)}s`;
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }

  return (
    <div
      data-testid={`creation-source-item-${item.id}`}
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '5px 8px',
        borderBottom: '1px solid var(--border-soft)',
        cursor: 'pointer',
        background: selected ? 'var(--raised)' : 'none',
        gap: 2,
      }}
    >
      <div class="sb-row">
        {selected ? (
          <PixelIcon name="play" size={10} color="var(--gold)" />
        ) : (
          <PixelIcon name="play" size={10} color="var(--text-mute)" />
        )}
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: selected ? 'var(--gold)' : 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-mute)',
          }}
        >
          {item.duration > 0 ? fmt(item.duration) : ''}
        </span>
      </div>
      {selected && item.peaks.length > 0 && <Waveform peaks={item.peaks} height={18} />}
    </div>
  );
}

function EmptyHint({ text }: { text: string }): JSX.Element {
  return (
    <div
      style={{
        padding: '20px 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--text-mute)',
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  );
}
