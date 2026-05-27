// ─────────────────────────────────────────────────────────────────────────────
// BoardScreen — main board canvas (Slice 3)
//
// Layout: BoardTopBarV3 | 3-column main area | StatusBarV2
//
// 3-column main area:
//   Left  220px  SceneRail  (scene list + CRUD)
//   Center 1fr   PadGrid    (4×4 grid + Path A/B creation)
//   Right  280px Right panel (toggles: LibraryPanel ↔ PadEditorPanel)
//
// Modes:
//   SETUP (mode='edit'):  full CRUD, DnD, inspector visible
//   GAME  (mode='play'):  no editing, pad clicks → Slice 4 playback stub
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import { currentScreen, currentSceneId, currentMode, currentBoard, currentScene, upsertBoard, libraryItems } from '../state/store';
import { boardPut } from '../db/idb';
import { BoardTopBarV3 } from '../components/BoardTopBarV3';
import { SceneRail } from '../components/SceneRail';
import { PadGrid } from '../components/PadGrid';
import { PadEditorPanel } from '../components/PadEditorPanel';
import { LibraryPanel } from '../components/LibraryPanel';
import { StatusBarV2 } from '../chrome/StatusBarV2';
import { PixelIcon } from '../components/PixelIcon';
import type { AppMode, Board, Pad, PadPosition, Scene } from '../types';
import { nanoid } from '../lib/nanoid';
import { nextFreeSlot, typeInference } from '../lib/padUtils';
import { type LibDndDropResult } from '../lib/libDnd';

type RightPanelMode = 'library' | 'editor' | 'empty';

export function BoardScreen(): JSX.Element {
  const board = currentBoard.value;
  const scene = currentScene.value;
  const mode = currentMode.value;

  const [rightPanel, setRightPanel] = useState<RightPanelMode>('empty');
  const [selectedPadId, setSelectedPadId] = useState<string | null>(null);
  /** Mobile Place-Mode: non-null while user is tapping a slot to place a library item. */
  const [placeMode, setPlaceMode] = useState<{ itemId: string } | null>(null);

  // Select first scene if none selected
  useEffect(() => {
    if (board && !currentSceneId.value && board.scenes.length > 0) {
      const first = [...board.scenes].sort((a, b) => a.order - b.order)[0];
      currentSceneId.value = first.id;
    }
  }, [board?.id]);

  // Close editor panel when mode switches to GAME
  useEffect(() => {
    if (mode === 'play') {
      setRightPanel('empty');
      setSelectedPadId(null);
    }
  }, [mode]);

  if (!board) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          background: 'var(--surface)',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-mute)',
          }}
        >
          Board not found.
          <button
            class="sb-btn sb-btn-sm sb-btn-ghost"
            style={{ marginLeft: 12 }}
            onClick={() => { currentScreen.value = 'board-list'; }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleModeSwitch(newMode: AppMode) {
    currentMode.value = newMode;
  }

  function handlePadSelect(pad: Pad) {
    if (mode !== 'edit') return;
    setSelectedPadId(pad.id);
    setRightPanel('editor');
  }

  function handleEditorClose() {
    setSelectedPadId(null);
    setRightPanel('empty');
  }

  function handleLibraryToggle() {
    setRightPanel(prev => prev === 'library' ? 'empty' : 'library');
    setSelectedPadId(null);
    setPlaceMode(null); // cancel any pending place-mode
  }

  // ── Path B — Library drop (Pointer Events via libDnd.ts) ──────────────────

  async function handleLibDrop(result: LibDndDropResult) {
    if (result.kind === 'cancel' || !scene || !board) return;
    const { itemId, targetPos } = result;

    // If the target slot is occupied, fall back to the next free slot
    const occupied = scene.pads.find(
      p => p.position?.col === targetPos.col && p.position?.row === targetPos.row
    );
    const finalPos = occupied
      ? nextFreeSlot(scene.pads, scene.gridConfig.cols, scene.gridConfig.rows)
      : targetPos;
    if (!finalPos) return; // grid full

    const item = libraryItems.value.find(m => m.id === itemId);
    if (!item) return;

    const newPad: Pad = {
      id: nanoid(),
      type: typeInference(item.duration, 1),
      name: item.name,
      position: finalPos,
      libraryItemRef: itemId,
      volume: 80,
      fadeIn: 0,
      fadeOut: 0,
    };

    const updatedScene: Scene = { ...scene, pads: [...scene.pads, newPad] };
    const updatedBoard: Board = {
      ...board,
      scenes: board.scenes.map(s => s.id === scene.id ? updatedScene : s),
    };
    try {
      await boardPut(updatedBoard);
      upsertBoard(updatedBoard);
    } catch (e) {
      console.error('Lib drop pad create failed:', e);
    }
  }

  // ── Path B Mobile — Place-Mode ─────────────────────────────────────────────

  function handleEnterPlaceMode(itemId: string) {
    setPlaceMode({ itemId });
    setRightPanel('empty'); // close library panel so the grid is fully visible
  }

  async function handlePlaceModeTap(pos: PadPosition) {
    if (!placeMode || !scene || !board) return;
    const { itemId } = placeMode;
    setPlaceMode(null); // clear immediately so double-taps don't create two pads

    // Occupied slot → fall back to next free slot (consistent with handleLibDrop)
    const occupied = scene.pads.find(
      p => p.position?.col === pos.col && p.position?.row === pos.row
    );
    const finalPos = occupied
      ? nextFreeSlot(scene.pads, scene.gridConfig.cols, scene.gridConfig.rows)
      : pos;

    await handleLibDrop({ kind: 'drop', itemId, targetPos: finalPos ?? pos });
  }

  async function handlePadDelete(padId: string) {
    if (!scene || !board) return;
    const updatedScene: Scene = {
      ...scene,
      pads: scene.pads.filter(p => p.id !== padId),
    };
    const updatedBoard: Board = {
      ...board,
      scenes: board.scenes.map(s => s.id === scene.id ? updatedScene : s),
    };
    try {
      await boardPut(updatedBoard);
      upsertBoard(updatedBoard);
      setSelectedPadId(null);
      setRightPanel('empty');
    } catch (e) {
      console.error('Pad delete failed:', e);
    }
  }

  // Path C — ADD PAD keyboard shortcut (key 'A' in SETUP mode)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (mode !== 'edit') return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'a' || e.key === 'A') {
        handleAddPad();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mode, scene, board]);

  async function handleAddPad() {
    if (!scene || !board) return;
    const pos = nextFreeSlot(scene.pads, scene.gridConfig.cols, scene.gridConfig.rows);
    if (!pos) return; // Grid full
    const newPad: Pad = {
      id: nanoid(),
      type: 'single',
      name: '',
      position: pos,
      volume: 80,
      fadeIn: 0,
      fadeOut: 0,
    };
    const updatedScene: Scene = { ...scene, pads: [...scene.pads, newPad] };
    const updatedBoard: Board = {
      ...board,
      scenes: board.scenes.map(s => s.id === scene.id ? updatedScene : s),
    };
    try {
      await boardPut(updatedBoard);
      upsertBoard(updatedBoard);
      setSelectedPadId(newPad.id);
      setRightPanel('editor');
    } catch (e) {
      console.error('Add pad failed:', e);
    }
  }

  // ── Empty Board state ──────────────────────────────────────────────────────

  const hasScenes = board.scenes.length > 0;

  // ── Pad for editor ─────────────────────────────────────────────────────────

  const selectedPad = scene?.pads.find(p => p.id === selectedPadId) ?? null;

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: 'var(--surface)',
        overflow: 'hidden',
      }}
    >
      <BoardTopBarV3
        boardName={board.name}
        sceneName={scene?.name}
        mode={mode}
        onModeSwitch={handleModeSwitch}
        libraryOpen={rightPanel === 'library'}
        onLibraryToggle={handleLibraryToggle}
        onBack={() => { currentScreen.value = 'board-list'; }}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left: Scene rail */}
        <SceneRail
          board={board}
          activeSceneId={currentSceneId.value}
          onSceneSelect={(id) => {
            currentSceneId.value = id;
            setSelectedPadId(null);
          }}
        />

        {/* Center: Pad grid or empty states */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {!hasScenes ? (
            <EmptyBoardState onAddScene={async () => {
              const newScene: Scene = {
                id: nanoid(),
                name: 'Scene 1',
                order: 0,
                gridConfig: { cols: 4, rows: 4, gap: 8, padSize: 'md' },
                pads: [],
              };
              const updatedBoard: Board = { ...board, scenes: [newScene] };
              try {
                await boardPut(updatedBoard);
                upsertBoard(updatedBoard);
                currentSceneId.value = newScene.id;
              } catch (e) {
                console.error('Add scene failed:', e);
              }
            }} />
          ) : !scene ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-mute)',
              }}
            >
              Select a scene
            </div>
          ) : (
            <>
              {/* Path B Mobile — Place-Mode banner */}
              {placeMode && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    background: 'var(--mode-setup)',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--night)',
                    }}
                  >
                    Tap a slot to place &quot;{libraryItems.value.find(m => m.id === placeMode.itemId)?.name ?? '…'}&quot;
                  </span>
                  <button
                    class="sb-btn sb-btn-sm sb-btn-ghost"
                    style={{ color: 'var(--night)', borderColor: 'var(--night)' }}
                    onClick={() => setPlaceMode(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <PadGrid
                scene={scene}
                board={board}
                mode={mode}
                selectedPadId={selectedPadId}
                onPadSelect={handlePadSelect}
                onRequestNewPad={(pad) => {
                  setSelectedPadId(pad.id);
                  setRightPanel('editor');
                }}
                placeMode={placeMode?.itemId ?? null}
                onPlaceModeTap={handlePlaceModeTap}
              />
            </>
          )}

          {/* SETUP toolbar — ADD PAD button */}
          {mode === 'edit' && scene && (
            <div
              style={{
                padding: '6px 12px',
                background: 'var(--deep)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                class="sb-btn sb-btn-sm sb-btn-primary"
                onClick={handleAddPad}
                style={{ gap: 6 }}
              >
                <PixelIcon name="sparkle" size={11} />
                ADD PAD
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-mute)',
                }}
              >
                or press <kbd style={{ background: 'var(--raised)', padding: '0 4px' }}>A</kbd>
              </span>
            </div>
          )}
        </main>

        {/* Right: Inspector panel (SETUP only) */}
        {mode === 'edit' && (
          <>
            {rightPanel === 'library' && (
              <LibraryPanel
                onClose={() => setRightPanel('empty')}
                onLibDrop={handleLibDrop}
                onEnterPlaceMode={handleEnterPlaceMode}
              />
            )}
            {rightPanel === 'editor' && selectedPad && scene && (
              <PadEditorPanel
                pad={selectedPad}
                scene={scene}
                board={board}
                onClose={handleEditorClose}
                onDelete={handlePadDelete}
              />
            )}
            {rightPanel === 'empty' && (
              <div
                style={{
                  width: 280,
                  flexShrink: 0,
                  background: 'var(--surface)',
                  borderLeft: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '24px 16px',
                }}
              >
                <PixelIcon name="eye" size={24} color="var(--border)" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-mute)',
                    textAlign: 'center',
                  }}
                >
                  Select a pad to edit
                  <br />
                  or open the Library
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <StatusBarV2
        mode={mode}
        boardName={board.name}
        infoText={scene
          ? `${scene.name} · ${scene.pads.length} pad${scene.pads.length !== 1 ? 's' : ''}`
          : 'No scene selected'
        }
      />
    </div>
  );
}

// ── EmptyBoardState ────────────────────────────────────────────────────────────

function EmptyBoardState({ onAddScene }: { onAddScene: () => void }): JSX.Element {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '40px 24px',
        background: 'var(--surface)',
      }}
    >
      <PixelIcon name="scroll" size={40} color="var(--border)" />
      <div
        class="sb-display-vt"
        style={{ fontSize: 22, textAlign: 'center' }}
      >
        Empty Board
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--text-mute)',
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.6,
        }}
      >
        Add a scene to start placing pads.
        Scenes group pads by narrative moment.
      </div>
      <button
        class="sb-btn sb-btn-primary"
        style={{ minWidth: 200, minHeight: 44, gap: 8 }}
        onClick={onAddScene}
      >
        <PixelIcon name="sparkle" size={14} />
        + NEW SCENE
      </button>
    </div>
  );
}
