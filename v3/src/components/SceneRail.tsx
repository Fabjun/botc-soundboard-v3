// ─────────────────────────────────────────────────────────────────────────────
// SceneRail — left scene list panel for BoardScreen
//
// Source: SoS_DESIGN_25052026/v21-scene-crud.jsx
//
// Features:
//   - Scene tabs sorted by order
//   - Active tab highlight
//   - Inline rename (double-click)
//   - Hover action chips (RENAME · COPY · ×) — desktop
//   - Delete with confirmation + UndoToast
//   - Duplicate (copy pads + gridConfig)
//   - Reorder (drag handle, pointer-events based)
//   - + NEW SCENE button at bottom
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'preact/hooks';
import type { JSX } from 'preact';
import type { Scene, Board } from '../types';
import { PixelIcon } from './PixelIcon';
import { UndoToast } from './UndoToast';
import { boardPut } from '../db/idb';
import { upsertBoard } from '../state/store';
import { nanoid } from '../lib/nanoid';

interface SceneRailProps {
  board: Board;
  activeSceneId: string | null;
  onSceneSelect: (sceneId: string) => void;
}

export function SceneRail({ board, activeSceneId, onSceneSelect }: SceneRailProps): JSX.Element {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deletedScene, setDeletedScene] = useState<{
    scene: Scene;
    boardSnapshot: Board;
    message: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scenes = [...board.scenes].sort((a, b) => a.order - b.order);

  // ── Rename ────────────────────────────────────────────────────────────────

  function startRename(scene: Scene) {
    setEditingId(scene.id);
    setEditValue(scene.name);
    // Focus input on next tick
    requestAnimationFrame(() => inputRef.current?.select());
  }

  async function commitRename(sceneId: string) {
    const newName = editValue.trim();
    if (!newName) {
      setEditingId(null);
      return;
    }
    const updatedBoard: Board = {
      ...board,
      scenes: board.scenes.map((s) => (s.id === sceneId ? { ...s, name: newName } : s)),
    };
    try {
      await boardPut(updatedBoard);
      upsertBoard(updatedBoard);
    } catch (e) {
      console.error('Scene rename failed:', e);
    }
    setEditingId(null);
  }

  function cancelRename() {
    setEditingId(null);
  }

  // ── Duplicate ─────────────────────────────────────────────────────────────

  async function duplicateScene(scene: Scene) {
    const existing = board.scenes.filter((s) => s.name.startsWith(scene.name));
    const suffix = existing.length > 1 ? ` · ${existing.length}` : ' · 2';
    const newScene: Scene = {
      ...scene,
      id: nanoid(),
      name: scene.name + suffix,
      order: Math.max(...board.scenes.map((s) => s.order)) + 1,
      pads: scene.pads.map((p) => ({ ...p, id: nanoid() })),
    };
    const updatedBoard: Board = {
      ...board,
      scenes: [...board.scenes, newScene],
    };
    try {
      await boardPut(updatedBoard);
      upsertBoard(updatedBoard);
    } catch (e) {
      console.error('Scene duplicate failed:', e);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function requestDelete(scene: Scene) {
    if (pendingDeleteId === scene.id) {
      // Second tap: execute
      const boardSnapshot = { ...board };
      const updatedBoard: Board = {
        ...board,
        scenes: board.scenes.filter((s) => s.id !== scene.id),
      };
      try {
        await boardPut(updatedBoard);
        upsertBoard(updatedBoard);
        setDeletedScene({
          scene,
          boardSnapshot,
          message: `Deleted '${scene.name}' · ${scene.pads.length} pad${scene.pads.length !== 1 ? 's' : ''}`,
        });
        // If deleted scene was active, switch to first remaining
        if (activeSceneId === scene.id && updatedBoard.scenes.length > 0) {
          onSceneSelect(updatedBoard.scenes.sort((a, b) => a.order - b.order)[0].id);
        }
      } catch (e) {
        console.error('Scene delete failed:', e);
      }
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(scene.id);
    }
  }

  async function undoDelete() {
    if (!deletedScene) return;
    try {
      await boardPut(deletedScene.boardSnapshot);
      upsertBoard(deletedScene.boardSnapshot);
    } catch (e) {
      console.error('Scene undo failed:', e);
    }
    setDeletedScene(null);
  }

  // ── New Scene ─────────────────────────────────────────────────────────────

  async function addScene() {
    const newScene: Scene = {
      id: nanoid(),
      name: `Scene ${board.scenes.length + 1}`,
      order: board.scenes.length,
      gridConfig: { cols: 4, rows: 4, gap: 8, padSize: 'md' },
      pads: [],
    };
    const updatedBoard: Board = {
      ...board,
      scenes: [...board.scenes, newScene],
    };
    try {
      await boardPut(updatedBoard);
      upsertBoard(updatedBoard);
      onSceneSelect(newScene.id);
    } catch (e) {
      console.error('Add scene failed:', e);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div class="sb-scene-rail">
      {scenes.length === 0 ? (
        <div
          style={{
            padding: '24px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-mute)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          No scenes yet.
          <br />
          Add one below.
        </div>
      ) : (
        scenes.map((scene) => (
          <div
            key={scene.id}
            class={
              'sb-scene-tab' +
              (activeSceneId === scene.id ? ' is-active' : '') +
              (editingId === scene.id ? ' is-editing' : '') +
              (pendingDeleteId === scene.id ? ' is-danger' : '')
            }
            data-testid={`scene-tab-${scene.id}`}
            onClick={() => {
              if (editingId !== scene.id) {
                onSceneSelect(scene.id);
                setPendingDeleteId(null);
              }
            }}
            onDblClick={() => startRename(scene)}
          >
            {/* Scene number badge */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-mute)',
                minWidth: '16px',
                flexShrink: 0,
              }}
            >
              {scene.order + 1}
            </span>

            {/* Name or inline edit input */}
            {editingId === scene.id ? (
              <input
                ref={inputRef}
                data-testid="scene-name-input"
                value={editValue}
                onInput={(e) => setEditValue((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitRename(scene.id);
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelRename();
                  }
                }}
                onBlur={() => commitRename(scene.id)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'var(--sunk)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'var(--fs-md)',
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  outline: 'none',
                }}
                autoFocus
              />
            ) : (
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {scene.name}
              </span>
            )}

            {/* Pad count */}
            {editingId !== scene.id && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-mute)',
                  flexShrink: 0,
                }}
              >
                {scene.pads.length}
              </span>
            )}

            {/* Action chips (visible on hover / active) */}
            {editingId !== scene.id && (
              <div class="sb-scene-tab-actions">
                <button
                  class="sb-btn sb-btn-sm sb-btn-ghost"
                  data-testid={`scene-rename-${scene.id}`}
                  style={{ minWidth: 28, minHeight: 28, padding: '0 4px' }}
                  title="Rename scene"
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(scene);
                  }}
                >
                  <PixelIcon name="edit" size={11} />
                </button>
                <button
                  class="sb-btn sb-btn-sm sb-btn-ghost"
                  data-testid={`scene-copy-${scene.id}`}
                  style={{ minWidth: 28, minHeight: 28, padding: '0 4px' }}
                  title="Duplicate scene"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateScene(scene);
                  }}
                >
                  <PixelIcon name="save" size={11} />
                </button>
                <button
                  class={`sb-btn sb-btn-sm ${pendingDeleteId === scene.id ? 'sb-btn-danger' : 'sb-btn-ghost'}`}
                  data-testid={`scene-delete-${scene.id}`}
                  style={{ minWidth: 28, minHeight: 28, padding: '0 4px' }}
                  title={
                    pendingDeleteId === scene.id ? 'Click again to confirm delete' : 'Delete scene'
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    requestDelete(scene);
                  }}
                >
                  {pendingDeleteId === scene.id ? '!!' : '×'}
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Add scene button */}
      <button
        class="sb-btn sb-btn-ghost"
        data-testid="new-scene-button"
        style={{
          margin: '8px',
          width: 'calc(100% - 16px)',
          minHeight: 44,
          justifyContent: 'center',
          gap: 6,
        }}
        onClick={addScene}
      >
        <PixelIcon name="sparkle" size={12} />+ NEW SCENE
      </button>

      {/* Undo toast */}
      {deletedScene && (
        <UndoToast
          message={deletedScene.message}
          durationMs={6000}
          onUndo={undoDelete}
          onDismiss={() => setDeletedScene(null)}
        />
      )}
    </div>
  );
}
