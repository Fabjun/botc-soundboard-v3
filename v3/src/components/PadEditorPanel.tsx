// ─────────────────────────────────────────────────────────────────────────────
// PadEditorPanel — right-inspector panel for pad editing (SETUP mode)
//
// Used for:
//   Path C (ADD PAD): full editor from scratch
//   Pad tap in SETUP mode: edit existing pad
//   "More options" handoff from Path A Popover
//
// Save strategy: Auto-Save with 500ms debounce (no explicit Save button).
// Matches V1 workflow, prevents forgotten saves.
//
// Fields in Slice 3:
//   - Name (required)
//   - Type (with PadTypeConfirmDialog on change)
//   - Library source (search + pick from libraryItems)
//   - Waveform preview (if source set)
//   - Volume slider (0-100)
//   - Fade In / Fade Out sliders (0-10s)
//   - Hotkey display (read-only; Key-Capture = Slice 8)
//   - Delete button (2-tap confirm)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import type { Board, Pad, PadType, Scene } from '../types';
import { PixelIcon } from './PixelIcon';
import { Waveform } from './Waveform';
import { PadTypeConfirmDialog } from './PadTypeConfirmDialog';
import { padTypeColor, padTypeLabel, applyTypeChange, padMigrationMatrix } from '../lib/padUtils';
import { libraryItems } from '../state/store';
import { boardPut } from '../db/idb';
import { upsertBoard } from '../state/store';

interface PadEditorPanelProps {
  pad: Pad;
  scene: Scene;
  board: Board;
  onClose: () => void;
  onDelete: (padId: string) => void;
}

const PAD_TYPES: PadType[] = ['single', 'loop', 'playlist', 'combo'];

export function PadEditorPanel({
  pad,
  scene,
  board,
  onClose,
  onDelete,
}: PadEditorPanelProps): JSX.Element {
  // Local state mirrors the pad; auto-saved on change
  const [name, setName] = useState(pad.name);
  const [type, setType] = useState<PadType>(pad.type);
  const [libraryRef, setLibraryRef] = useState<string | undefined>(pad.libraryItemRef);
  const [volume, setVolume] = useState(pad.volume);
  const [fadeIn, setFadeIn] = useState(pad.fadeIn);
  const [fadeOut, setFadeOut] = useState(pad.fadeOut);
  const [pendingType, setPendingType] = useState<PadType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [libSearch, setLibSearch] = useState('');
  const [libPickerOpen, setLibPickerOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from prop changes (when pad changes externally)
  useEffect(() => {
    setName(pad.name);
    setType(pad.type);
    setLibraryRef(pad.libraryItemRef);
    setVolume(pad.volume);
    setFadeIn(pad.fadeIn);
    setFadeOut(pad.fadeOut);
  }, [pad.id]);

  // ── Auto-save with 500ms debounce ────────────────────────────────────────

  function scheduleAutoSave(updatedPad: Pad) {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const updatedScene: Scene = {
        ...scene,
        pads: scene.pads.map(p => p.id === updatedPad.id ? updatedPad : p),
      };
      const updatedBoard: Board = {
        ...board,
        scenes: board.scenes.map(s => s.id === updatedScene.id ? updatedScene : s),
      };
      try {
        await boardPut(updatedBoard);
        upsertBoard(updatedBoard);
      } catch (e) {
        console.error('Pad auto-save failed:', e);
      }
    }, 500);
  }

  function buildCurrentPad(): Pad {
    return { ...pad, name, type, libraryItemRef: libraryRef, volume, fadeIn, fadeOut };
  }

  function handleNameChange(newName: string) {
    setName(newName);
    scheduleAutoSave({ ...buildCurrentPad(), name: newName });
  }

  function handleVolumeChange(v: number) {
    setVolume(v);
    scheduleAutoSave({ ...buildCurrentPad(), volume: v });
  }

  function handleFadeInChange(v: number) {
    setFadeIn(v);
    scheduleAutoSave({ ...buildCurrentPad(), fadeIn: v });
  }

  function handleFadeOutChange(v: number) {
    setFadeOut(v);
    scheduleAutoSave({ ...buildCurrentPad(), fadeOut: v });
  }

  function handleLibrarySelect(id: string) {
    setLibraryRef(id);
    setLibPickerOpen(false);
    scheduleAutoSave({ ...buildCurrentPad(), libraryItemRef: id });
  }

  // ── Type change ──────────────────────────────────────────────────────────

  function requestTypeChange(newType: PadType) {
    if (newType === type) return;
    // No dialog for brand-new pad (no name or library ref = fresh)
    const isFresh = !pad.libraryItemRef && pad.name === '';
    const { verdict } = padMigrationMatrix(type, newType);
    if (isFresh || verdict === 'add') {
      applyTypeSwitch(newType);
    } else {
      setPendingType(newType);
    }
  }

  function applyTypeSwitch(newType: PadType) {
    const migrated = applyTypeChange({ ...buildCurrentPad(), type }, newType);
    setType(migrated.type);
    setLibraryRef(migrated.libraryItemRef);
    scheduleAutoSave(migrated);
    setPendingType(null);
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  function handleDelete() {
    if (deleteConfirm) {
      onDelete(pad.id);
    } else {
      setDeleteConfirm(true);
    }
  }

  // ── Library picker ───────────────────────────────────────────────────────

  const allAudio = libraryItems.value.filter(m => m.type === 'audio');
  const filteredAudio = libSearch.trim()
    ? allAudio.filter(m => m.name.toLowerCase().includes(libSearch.toLowerCase()))
    : allAudio;
  const selectedItem = allAudio.find(m => m.id === libraryRef);

  // ── Render ───────────────────────────────────────────────────────────────

  const typeColor = padTypeColor(type);

  return (
    <div class="sb-pad-editor" data-testid="pad-editor">
      {/* Header */}
      <div
        class="sb-panel-header is-active"
        style={{ borderBottom: `2px solid ${typeColor}` }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            background: typeColor,
            flexShrink: 0,
          }}
        />
        <span style={{ flex: 1, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          Pad Editor
        </span>
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          style={{ minWidth: 28, minHeight: 28, padding: '0 4px', marginLeft: 'auto' }}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* Name */}
      <div class="sb-inspector-section">
        <label
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-mute)',
            letterSpacing: '.08em',
            display: 'block',
            marginBottom: 4,
          }}
        >
          NAME
        </label>
        <input
          type="text"
          data-testid="editor-name-input"
          value={name}
          placeholder="Pad name…"
          onInput={e => handleNameChange((e.target as HTMLInputElement).value)}
          style={{
            width: '100%',
            background: 'var(--sunk)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--fs-md)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            padding: '6px 8px',
            outline: 'none',
          }}
        />
      </div>

      {/* Type selector */}
      <div class="sb-inspector-section">
        <label
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-mute)',
            letterSpacing: '.08em',
            display: 'block',
            marginBottom: 6,
          }}
        >
          TYPE
        </label>
        <div style={{ display: 'flex', gap: 4 }}>
          {PAD_TYPES.map(t => (
            <button
              key={t}
              class={`sb-btn sb-btn-sm ${type === t ? 'sb-btn-primary' : 'sb-btn-ghost'}`}
              data-testid={`editor-type-${t}`}
              style={{
                flex: 1,
                padding: '3px 4px',
                fontSize: 'var(--fs-xs)',
                letterSpacing: '.04em',
                color: type === t ? padTypeColor(t) : 'var(--text-mute)',
                borderColor: type === t ? padTypeColor(t) : undefined,
              }}
              onClick={() => requestTypeChange(t)}
            >
              {padTypeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Library source */}
      <div class="sb-inspector-section">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-mute)',
              letterSpacing: '.08em',
            }}
          >
            AUDIO SOURCE
          </label>
          <button
            class="sb-btn sb-btn-sm sb-btn-ghost"
            style={{ padding: '1px 6px', fontSize: 'var(--fs-xs)' }}
            onClick={() => setLibPickerOpen(o => !o)}
          >
            {libPickerOpen ? 'CLOSE' : 'BROWSE'}
          </button>
        </div>

        {/* Current source */}
        {selectedItem ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '6px 8px',
              background: 'var(--sunk)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedItem.name}
            </div>
            {selectedItem.peaks.length > 0 && (
              <Waveform peaks={selectedItem.peaks} height={24} />
            )}
          </div>
        ) : (
          <div
            style={{
              padding: '10px 8px',
              background: 'var(--sunk)',
              border: '1px dashed var(--border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-mute)',
              textAlign: 'center',
            }}
          >
            No source selected
          </div>
        )}

        {/* Inline library picker */}
        {libPickerOpen && (
          <div
            style={{
              marginTop: 6,
              border: '1px solid var(--border)',
              background: 'var(--sunk)',
              maxHeight: 160,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              style={{
                padding: '4px 6px',
                borderBottom: '1px solid var(--border-soft)',
              }}
            >
              <input
                type="text"
                placeholder="Search…"
                value={libSearch}
                onInput={e => setLibSearch((e.target as HTMLInputElement).value)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text)',
                }}
                autoFocus
              />
            </div>
            {filteredAudio.slice(0, 50).map(item => (
              <div
                key={item.id}
                onClick={() => handleLibrarySelect(item.id)}
                style={{
                  padding: '5px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: libraryRef === item.id ? 'var(--gold)' : 'var(--text-dim)',
                  background: libraryRef === item.id ? 'var(--raised)' : 'none',
                  borderBottom: '1px solid var(--border-soft)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </div>
            ))}
            {filteredAudio.length === 0 && (
              <div
                style={{
                  padding: '12px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-mute)',
                  textAlign: 'center',
                }}
              >
                No files found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Volume */}
      <div class="sb-inspector-section">
        <SliderRow
          label="VOLUME"
          value={volume}
          min={0}
          max={100}
          step={1}
          format={v => `${v}%`}
          onChange={handleVolumeChange}
          testid="editor-volume-slider"
        />
      </div>

      {/* Fade In */}
      <div class="sb-inspector-section">
        <SliderRow
          label="FADE IN"
          value={fadeIn}
          min={0}
          max={10}
          step={0.1}
          format={v => `${v.toFixed(1)}s`}
          onChange={handleFadeInChange}
          testid="editor-fade-in-slider"
        />
      </div>

      {/* Fade Out */}
      <div class="sb-inspector-section">
        <SliderRow
          label="FADE OUT"
          value={fadeOut}
          min={0}
          max={10}
          step={0.1}
          format={v => `${v.toFixed(1)}s`}
          onChange={handleFadeOutChange}
          testid="editor-fade-out-slider"
        />
      </div>

      {/* Hotkey (read-only; Key-Capture = Slice 8) */}
      <div class="sb-inspector-section">
        <label
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-mute)',
            letterSpacing: '.08em',
            display: 'block',
            marginBottom: 4,
          }}
        >
          HOTKEY
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 8px',
            background: 'var(--sunk)',
            border: '1px solid var(--border)',
          }}
        >
          <PixelIcon name="keyboard" size={11} color="var(--text-mute)" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: pad.hotkey ? 'var(--text)' : 'var(--text-mute)',
            }}
          >
            {pad.hotkey ?? '— not assigned —'}
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-mute)',
            }}
          >
            Slice 8
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Delete */}
      <div class="sb-inspector-section">
        <button
          class={`sb-btn sb-btn-danger`}
          data-testid="editor-delete-button"
          style={{ width: '100%', justifyContent: 'center', minHeight: 44 }}
          onClick={handleDelete}
          onBlur={() => setDeleteConfirm(false)}
        >
          <PixelIcon name="skull" size={12} />
          {deleteConfirm ? 'CONFIRM DELETE' : 'DELETE PAD'}
        </button>
      </div>

      {/* Type change confirm dialog */}
      {pendingType !== null && (
        <PadTypeConfirmDialog
          fromType={type}
          toType={pendingType}
          onConfirm={() => applyTypeSwitch(pendingType)}
          onCancel={() => setPendingType(null)}
        />
      )}
    </div>
  );
}

// ── SliderRow ────────────────────────────────────────────────────────────────

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  testid,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  testid?: string;
}): JSX.Element {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
        }}
      >
        <label
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-mute)',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--gold)',
          }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        data-testid={testid}
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={e => onChange(parseFloat((e.target as HTMLInputElement).value))}
        style={{
          width: '100%',
          accentColor: 'var(--gold)',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
