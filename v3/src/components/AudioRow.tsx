// ─────────────────────────────────────────────────────────────────────────────
// AudioRow — single row in the Library audio list
//
// Shows: type icon | name (renameable) + filename | waveform | duration | size | delete
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useEffect } from 'preact/hooks';
import { PixelIcon } from './PixelIcon';
import { Waveform } from './Waveform';
import { formatBytes, formatDuration } from '../lib/upload';
import type { LibraryItemMeta } from '../types';

interface AudioRowProps {
  meta: LibraryItemMeta;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}

// ---------------------------------------------------------------------------
// RenameField — inline <input> toggle (no contentEditable — iOS Safari issues)
// ---------------------------------------------------------------------------

interface RenameFieldProps {
  name: string;
  onCommit: (newName: string) => void;
}

function RenameField({ name, onCommit }: RenameFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft if name changes externally (e.g. from another session's signal update)
  useEffect(() => {
    if (!editing) setDraft(name);
  }, [name, editing]);

  // Auto-focus on edit entry
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) {
      onCommit(trimmed);
    }
    setEditing(false);
  }

  function cancel() {
    setDraft(name);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '14px',
          color: 'var(--text)',
          background: 'var(--sunk)',
          border: '1px solid var(--border-strong)',
          padding: '2px 6px',
          width: '100%',
          outline: 'none',
          minHeight: '28px',
        }}
        onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
          }
        }}
      />
    );
  }

  return (
    <span
      title="Click to rename"
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '14px',
        color: 'var(--text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'text',
        display: 'block',
      }}
    >
      {name}
    </span>
  );
}

// ---------------------------------------------------------------------------
// AudioRow
// ---------------------------------------------------------------------------

export function AudioRow({ meta, selected, onSelect, onDelete, onRename }: AudioRowProps) {
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm'>('idle');

  function handleDeleteClick(e: MouseEvent) {
    e.stopPropagation();
    if (deleteStep === 'idle') {
      setDeleteStep('confirm');
    } else {
      onDelete();
    }
  }

  function resetDelete() {
    setDeleteStep('idle');
  }

  return (
    <div
      onClick={onSelect}
      onMouseLeave={resetDelete}
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr 70px 90px 44px',
        gap: '12px',
        alignItems: 'center',
        padding: '8px 12px',
        minHeight: '44px',
        background: selected ? 'var(--top)' : 'var(--raised)',
        borderLeft: selected ? '2px solid var(--gold)' : '2px solid transparent',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Col 1: type icon + name + filename */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <div style={{ flexShrink: 0, color: 'var(--gold)' }}>
          <PixelIcon name="play" size={14} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <RenameField name={meta.name} onCommit={onRename} />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-mute)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meta.id.slice(0, 8)}…
          </div>
        </div>
      </div>

      {/* Col 2: waveform thumbnail */}
      <Waveform peaks={meta.peaks} height={28} dim={!selected} />

      {/* Col 3: duration */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-dim)',
          textAlign: 'center',
        }}
      >
        {formatDuration(meta.duration)}
      </span>

      {/* Col 4: file size */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-dim)',
        }}
      >
        {formatBytes(meta.size)}
      </span>

      {/* Col 5: delete (2-tap confirm) */}
      <button
        title={deleteStep === 'idle' ? 'Delete' : 'Confirm delete'}
        onClick={handleDeleteClick}
        onBlur={resetDelete}
        style={{
          background: 'none',
          border: deleteStep === 'confirm' ? '1px solid var(--blood)' : 'none',
          color: deleteStep === 'confirm' ? 'var(--blood-bright)' : 'var(--text-mute)',
          cursor: 'pointer',
          padding: '6px',
          minHeight: '44px',
          minWidth: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PixelIcon name="skull" size={12} />
      </button>
    </div>
  );
}
