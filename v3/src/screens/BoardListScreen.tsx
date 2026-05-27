// ─────────────────────────────────────────────────────────────────────────────
// BoardListScreen — list all boards, create / rename / delete
//
// Pattern mirrors LibraryScreen: TopBarV2 + list rows + StatusBarV2.
// Each board row follows the AudioRow pattern (inline rename, 2-tap delete).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { TopBarV2 } from '../chrome/TopBarV2';
import { StatusBarV2 } from '../chrome/StatusBarV2';
import { PixelIcon } from '../components/PixelIcon';
import { currentScreen, currentBoardId, currentSceneId, boards, upsertBoard, removeBoardFromStore } from '../state/store';
import { boardPut, boardDelete } from '../db/idb';
import type { Board } from '../types';
import { nanoid } from '../lib/nanoid';

export function BoardListScreen(): JSX.Element {
  const allBoards = boards.value;

  async function handleCreate() {
    const name = `Board ${allBoards.length + 1}`;
    const newBoard: Board = {
      id: nanoid(),
      name,
      themeId: 'hearth',
      settings: { quickAccessLayout: 'hidden', quickAccessSetCount: 1 },
      scenes: [],
      sets: [],
    };
    try {
      await boardPut(newBoard);
      upsertBoard(newBoard);
    } catch (e) {
      console.error('Board create failed:', e);
    }
  }

  function openBoard(board: Board) {
    currentBoardId.value = board.id;
    currentSceneId.value = board.scenes.length > 0
      ? [...board.scenes].sort((a, b) => a.order - b.order)[0].id
      : null;
    currentScreen.value = 'board';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: 'var(--surface)',
      }}
    >
      <TopBarV2
        title="Boards"
        breadcrumb={`${allBoards.length} board${allBoards.length !== 1 ? 's' : ''}`}
        right={
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              class="sb-btn sb-btn-sm sb-btn-primary"
              onClick={handleCreate}
            >
              <PixelIcon name="sparkle" size={11} />
              NEW BOARD
            </button>
            <button
              class="sb-btn sb-btn-sm sb-btn-ghost"
              onClick={() => { currentScreen.value = 'start'; }}
            >
              <PixelIcon name="flame" size={11} />
              BACK
            </button>
          </div>
        }
      />

      {/* Board list */}
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
        {allBoards.length === 0 ? (
          <EmptyBoardsState onCreate={handleCreate} />
        ) : (
          allBoards.map(board => (
            <BoardRow
              key={board.id}
              board={board}
              onOpen={() => openBoard(board)}
            />
          ))
        )}
      </div>

      <StatusBarV2
        mode="edit"
        boardName="Board List"
        infoText={`${allBoards.length} board${allBoards.length !== 1 ? 's' : ''}`}
      />
    </div>
  );
}

// ── BoardRow ──────────────────────────────────────────────────────────────────

function BoardRow({
  board,
  onOpen,
}: {
  board: Board;
  onOpen: () => void;
}): JSX.Element {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(board.name);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const totalPads = board.scenes.reduce((sum, s) => sum + s.pads.length, 0);
  const scenesCount = board.scenes.length;

  async function commitRename() {
    const newName = editValue.trim();
    if (!newName) { setEditing(false); return; }
    const updated: Board = { ...board, name: newName };
    try {
      await boardPut(updated);
      upsertBoard(updated);
    } catch (e) {
      console.error('Board rename failed:', e);
    }
    setEditing(false);
  }

  async function handleDelete() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    try {
      await boardDelete(board.id);
      removeBoardFromStore(board.id);
    } catch (e) {
      console.error('Board delete failed:', e);
    }
  }

  return (
    <div
      class="sb-menu-row"
      style={{
        '--pix-bg': 'var(--raised)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        minHeight: '56px',
      } as Record<string, string>}
      onClick={() => { if (!editing) onOpen(); }}
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, color: 'var(--gold)' }}>
        <PixelIcon name="scroll" size={18} />
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input
            type="text"
            value={editValue}
            onInput={e => setEditValue((e.target as HTMLInputElement).value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
              if (e.key === 'Escape') { e.preventDefault(); setEditing(false); }
            }}
            onBlur={commitRename}
            onClick={e => e.stopPropagation()}
            autoFocus
            style={{
              background: 'var(--sunk)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--fs-lg)',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              outline: 'none',
              width: '100%',
            }}
          />
        ) : (
          <div
            class="sb-row-title"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {board.name}
          </div>
        )}
        {!editing && (
          <div class="sb-row-sub">
            {scenesCount} scene{scenesCount !== 1 ? 's' : ''} · {totalPads} pad{totalPads !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <div
          style={{ display: 'flex', gap: 4, flexShrink: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            class="sb-btn sb-btn-sm sb-btn-ghost"
            style={{ minWidth: 36, padding: '0 6px' }}
            title="Rename board"
            onClick={() => { setEditValue(board.name); setEditing(true); }}
          >
            <PixelIcon name="edit" size={11} />
          </button>
          <button
            class={`sb-btn sb-btn-sm ${deleteConfirm ? 'sb-btn-danger' : 'sb-btn-ghost'}`}
            style={{ minWidth: 36, padding: '0 6px' }}
            title={deleteConfirm ? 'Click again to confirm' : 'Delete board'}
            onClick={handleDelete}
            onBlur={() => setDeleteConfirm(false)}
          >
            {deleteConfirm ? '!!' : '×'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── EmptyBoardsState ──────────────────────────────────────────────────────────

function EmptyBoardsState({ onCreate }: { onCreate: () => void }): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '60px 24px',
        gap: 16,
      }}
    >
      <PixelIcon name="scroll" size={48} color="var(--border)" />
      <div
        class="sb-display-vt"
        style={{ fontSize: 22, textAlign: 'center' }}
      >
        No Boards Yet
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--text-mute)',
          textAlign: 'center',
          maxWidth: 300,
          lineHeight: 1.6,
        }}
      >
        A Board holds your Scenes and Pads
        for one game session or campaign.
      </div>
      <button
        class="sb-btn sb-btn-primary"
        style={{ minWidth: 220, minHeight: 44, gap: 8 }}
        onClick={onCreate}
      >
        <PixelIcon name="sparkle" size={14} />
        + CREATE FIRST BOARD
      </button>
    </div>
  );
}
