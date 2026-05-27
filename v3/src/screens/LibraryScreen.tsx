// ─────────────────────────────────────────────────────────────────────────────
// LibraryScreen — asset management (Slice 2)
//
// Layout: 2-column CSS grid (220px filter rail | 1fr audio list)
// Source reference: SoS_DESIGN_25052026/v2-screens.jsx LibraryV2
//
// Slice 2 scope:
//   - AUDIO tab: fully functional (upload, rename, delete, waveform, search)
//   - ICONS / PADS / BOARDS tabs: placeholder (empty state)
//   - No inspector panel (Slice 8+)
//   - Tags: read-only display only (editing is a later slice)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'preact/hooks';
import type { JSX } from 'preact';
import { TopBarV2 } from '../chrome/TopBarV2';
import { StatusBarV2 } from '../chrome/StatusBarV2';
import { PixelIcon } from '../components/PixelIcon';
import { AudioRow } from '../components/AudioRow';
import {
  currentScreen,
  libraryItems,
  uploadStatus,
  removeLibraryItemMeta,
  renameLibraryItemMeta,
} from '../state/store';
import { processFilesSerial, formatBytes, totalLibraryBytes } from '../lib/upload';
import { libDelete, libRename } from '../db/idb';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type LibTab = 'AUDIO' | 'ICONS' | 'PADS' | 'BOARDS';
const TABS: LibTab[] = ['AUDIO', 'ICONS', 'PADS', 'BOARDS'];

// ---------------------------------------------------------------------------
// EmptyState — generic empty placeholder
// ---------------------------------------------------------------------------

function EmptyState({ label }: { label: string }): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '40px 24px',
        color: 'var(--text-mute)',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <PixelIcon name="scroll" size={32} color="var(--border)" />
      {label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// UploadStatusBar — one-liner feedback after batch upload
// ---------------------------------------------------------------------------

function UploadStatusBar(): JSX.Element | null {
  const status = uploadStatus.value;
  if (!status) return null;

  const parts: string[] = [];
  if (status.imported > 0) parts.push(`${status.imported} imported`);
  if (status.skipped > 0) parts.push(`${status.skipped} already in library`);
  if (status.errors.length > 0) parts.push(`${status.errors.length} failed`);

  return (
    <div
      style={{
        padding: '6px 12px',
        background: 'var(--raised)',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: status.errors.length > 0 ? 'var(--blood-bright)' : 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
      }}
    >
      <PixelIcon name={status.errors.length > 0 ? 'skull' : 'save'} size={11} />
      {parts.join(' · ')}
      {status.errors.length > 0 && (
        <span
          title={status.errors.join('\n')}
          style={{ color: 'var(--blood)', cursor: 'help', marginLeft: '4px' }}
        >
          [details]
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LibraryScreen
// ---------------------------------------------------------------------------

export function LibraryScreen(): JSX.Element {
  const [activeTab, setActiveTab] = useState<LibTab>('AUDIO');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived: filtered list for current search
  const items = libraryItems.value;
  const filtered = search.trim()
    ? items.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const totalSize = totalLibraryBytes(items);

  // Breadcrumb: "124 audio files · 38.2 MB"
  const breadcrumb =
    items.length === 0
      ? 'Library'
      : `${items.length} audio file${items.length !== 1 ? 's' : ''} · ${formatBytes(totalSize)}`;

  // ── Upload handlers ────────────────────────────────────────────────────────

  function handleFileInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      processFilesSerial(Array.from(input.files)).catch(console.error);
      input.value = ''; // allow re-upload of same file
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.stopPropagation();
    // Only clear if leaving the entire screen (not a child element)
    const target = e.relatedTarget as Node | null;
    const container = e.currentTarget as HTMLElement;
    if (!container.contains(target)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const audioFiles = Array.from(files).filter((f) => f.type.startsWith('audio/'));
      if (audioFiles.length > 0) {
        processFilesSerial(audioFiles).catch(console.error);
      }
    }
  }

  // ── Row action handlers ────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    try {
      await libDelete(id);
      removeLibraryItemMeta(id);
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      console.error('Library delete failed:', e);
    }
  }

  async function handleRename(id: string, newName: string) {
    try {
      await libRename(id, newName);
      renameLibraryItemMeta(id, newName);
    } catch (e) {
      console.error('Library rename failed:', e);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: 'var(--surface)',
        position: 'relative',
        // Drop zone visual feedback: subtle border when dragging
        outline: isDragOver ? '2px solid var(--gold)' : '2px solid transparent',
        outlineOffset: '-2px',
      }}
    >
      {/* Hidden file input — triggered by IMPORT button */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Top bar */}
      <TopBarV2
        title="Library"
        breadcrumb={breadcrumb}
        right={
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              class="sb-btn sb-btn-sm sb-btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <PixelIcon name="download" size={11} />
              IMPORT
            </button>
            <button
              class="sb-btn sb-btn-sm sb-btn-ghost"
              onClick={() => {
                currentScreen.value = 'start';
              }}
            >
              <PixelIcon name="play" size={11} />
              BACK
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div
        style={{
          padding: '0 16px',
          background: 'var(--deep)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div class="sb-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              class={'sb-tab' + (activeTab === tab ? ' is-active' : '')}
              onClick={() => setActiveTab(tab)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {tab}
              <span
                style={{
                  marginLeft: '6px',
                  color: 'var(--text-mute)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                }}
              >
                {tab === 'AUDIO' ? items.length : 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      {activeTab !== 'AUDIO' ? (
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmptyState label="No items yet" />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Left rail — filter */}
          <aside
            style={{
              background: 'var(--deep)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'none',
            }}
          >
            {/* Category: only "All" in Slice 2 */}
            <div
              style={{
                padding: '10px 8px',
                borderBottom: '1px solid var(--border-soft)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  color: 'var(--text-mute)',
                  letterSpacing: '.1em',
                  padding: '4px 10px 8px',
                }}
              >
                CATEGORY
              </div>
              <div
                style={{
                  padding: '6px 10px',
                  borderLeft: '2px solid var(--gold)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  color: 'var(--gold)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  letterSpacing: '.04em',
                }}
              >
                <span>All</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-mute)',
                  }}
                >
                  {items.length}
                </span>
              </div>
            </div>

            {/* Tags — read-only, shown if any item has tags */}
            {items.some((m) => m.tags.length > 0) && (
              <div style={{ padding: '10px 8px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    color: 'var(--text-mute)',
                    letterSpacing: '.1em',
                    padding: '4px 10px 8px',
                  }}
                >
                  TAGS
                </div>
                <div
                  style={{
                    padding: '0 8px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                  }}
                >
                  {[...new globalThis.Set(items.flatMap((m) => m.tags))].map((tag) => (
                    <span key={tag} class="sb-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Drop zone hint — shown when no files or when dragging */}
            {(items.length === 0 || isDragOver) && (
              <div
                style={{
                  margin: '12px 8px',
                  padding: '16px 12px',
                  border: `2px dashed ${isDragOver ? 'var(--gold)' : 'var(--border)'}`,
                  color: isDragOver ? 'var(--gold)' : 'var(--text-mute)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  transition: 'color .15s, border-color .15s',
                }}
              >
                {isDragOver ? 'DROP FILES' : 'Drop audio files\nanywhere on screen'}
              </div>
            )}
          </aside>

          {/* Center — list */}
          <main
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {/* Search bar */}
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--deep)',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  background: 'var(--sunk)',
                  border: '1px solid var(--border)',
                }}
              >
                <PixelIcon name="search" size={12} color="var(--text-mute)" />
                <input
                  type="text"
                  placeholder={`Search ${items.length} files…`}
                  value={search}
                  onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
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
                      padding: '2px 4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Audio list */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'none',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {filtered.length === 0 ? (
                items.length === 0 ? (
                  <EmptyState
                    label={
                      isDragOver
                        ? 'Drop files to import'
                        : 'No audio files yet.\nDrop files anywhere or click IMPORT.'
                    }
                  />
                ) : (
                  <EmptyState label={`No files matching "${search}"`} />
                )
              ) : (
                filtered.map((meta) => (
                  <AudioRow
                    key={meta.id}
                    meta={meta}
                    selected={selectedId === meta.id}
                    onSelect={() => setSelectedId(meta.id)}
                    onDelete={() => handleDelete(meta.id)}
                    onRename={(newName) => handleRename(meta.id, newName)}
                  />
                ))
              )}
            </div>

            {/* Upload status bar */}
            <UploadStatusBar />
          </main>
        </div>
      )}

      {/* Status bar */}
      <StatusBarV2
        mode="edit"
        boardName="Library"
        infoText={
          items.length === 0
            ? 'No files'
            : `${items.length} file${items.length !== 1 ? 's' : ''} · ${formatBytes(totalSize)}` +
              (selectedId ? ' · 1 selected' : '')
        }
      />
    </div>
  );
}
