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
import {
  currentScreen,
  currentSceneId,
  currentMode,
  currentBoard,
  currentScene,
  upsertBoard,
  libraryItems,
} from '../state/store';
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

  // Select first scene if none selected.
  // Dep is board?.id intentionally — we only auto-select on BOARD IDENTITY change,
  // not on every board mutation (which would re-override a user scene selection).
  useEffect(() => {
    if (board && !currentSceneId.value && board.scenes.length > 0) {
      const first = [...board.scenes].sort((a, b) => a.order - b.order)[0];
      currentSceneId.value = first.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?.id]);

  // Close editor panel when mode switches to GAME
  useEffect(() => {
    if (mode === 'play') {
      setRightPanel('empty');
      setSelectedPadId(null);
    }
  }, [mode]);

  // Path C — ADD PAD keyboard shortcut (key 'A' in SETUP mode)
  // Defined here (before early return) to satisfy Rules of Hooks — hooks must
  // always be called unconditionally. handleAddPad guards for !board/!scene.
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
      // libraryItemRef intentionally absent: editor opens to fill it in
    };
    const updatedScene: Scene = { ...scene, pads: [...scene.pads, newPad] };
    const updatedBoard: Board = {
      ...board,
      scenes: board.scenes.map((s) => (s.id === scene.id ? updatedScene : s)),
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
    // handleAddPad intentionally omitted: it's a new function ref every render but
    // captures mode/scene/board via closure — adding it would re-register the
    // listener on every render. The real deps (mode, scene, board) are listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, scene, board]);

  if (!board) {
    return (
      <div class="sb-screen">
        <div class="sb-center-placeholder">
          Board not found.
          <button
            class="sb-btn sb-btn-sm sb-btn-ghost"
            onClick={() => {
              currentScreen.value = 'board-list';
            }}
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
    setRightPanel((prev) => (prev === 'library' ? 'empty' : 'library'));
    setSelectedPadId(null);
    setPlaceMode(null); // cancel any pending place-mode
  }

  // ── Path B — Library drop (Pointer Events via libDnd.ts) ──────────────────

  async function handleLibDrop(result: LibDndDropResult) {
    if (result.kind === 'cancel' || !scene || !board) return;
    const { itemId, targetPos } = result;

    // If the target slot is occupied, fall back to the next free slot
    const occupied = scene.pads.find(
      (p) => p.position?.col === targetPos.col && p.position?.row === targetPos.row,
    );
    const finalPos = occupied
      ? nextFreeSlot(scene.pads, scene.gridConfig.cols, scene.gridConfig.rows)
      : targetPos;
    if (!finalPos) return; // grid full

    const item = libraryItems.value.find((m) => m.id === itemId);
    if (!item) return;

    const inferredType = typeInference(item.duration, 1); // returns 'single' or 'loop' for fileCount=1
    const newPad: Pad =
      inferredType === 'loop'
        ? {
            id: nanoid(),
            type: 'loop',
            name: item.name,
            position: finalPos,
            libraryItemRef: itemId,
            volume: 80,
            fadeIn: 0,
            fadeOut: 0,
          }
        : {
            id: nanoid(),
            type: 'single',
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
      scenes: board.scenes.map((s) => (s.id === scene.id ? updatedScene : s)),
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
      (p) => p.position?.col === pos.col && p.position?.row === pos.row,
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
      pads: scene.pads.filter((p) => p.id !== padId),
    };
    const updatedBoard: Board = {
      ...board,
      scenes: board.scenes.map((s) => (s.id === scene.id ? updatedScene : s)),
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

  // ── Empty Board state ──────────────────────────────────────────────────────

  const hasScenes = board.scenes.length > 0;

  // ── Pad for editor ─────────────────────────────────────────────────────────

  const selectedPad = scene?.pads.find((p) => p.id === selectedPadId) ?? null;

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div class="sb-screen">
      <BoardTopBarV3
        boardName={board.name}
        sceneName={scene?.name}
        mode={mode}
        onModeSwitch={handleModeSwitch}
        libraryOpen={rightPanel === 'library'}
        onLibraryToggle={handleLibraryToggle}
        onBack={() => {
          currentScreen.value = 'board-list';
        }}
      />

      {/* Main content */}
      <div class="sb-board-body">
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
        <main class="sb-board-main">
          {!hasScenes ? (
            <EmptyBoardState
              onAddScene={async () => {
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
              }}
            />
          ) : !scene ? (
            <div class="sb-center-placeholder">Select a scene</div>
          ) : (
            <>
              {/* Path B Mobile — Place-Mode banner */}
              {placeMode && (
                <div class="sb-place-banner">
                  <span class="sb-place-banner-label">
                    Tap a slot to place &quot;
                    {libraryItems.value.find((m) => m.id === placeMode.itemId)?.name ?? '…'}&quot;
                  </span>
                  <button
                    class="sb-btn sb-btn-sm sb-btn-ghost is-on-setup"
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
            <div class="sb-setup-toolbar">
              <button class="sb-btn sb-btn-sm sb-btn-primary" onClick={handleAddPad}>
                <PixelIcon name="sparkle" size={11} />
                ADD PAD
              </button>
              <span class="sb-hint-text">
                or press <kbd class="sb-kbd">A</kbd>
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
            {/* No placeholder when rightPanel === 'empty': the pad grid fills
                the available width on all viewport sizes. On 390px, SceneRail
                (220px) + a 280px placeholder would squeeze the grid to 0px. */}
          </>
        )}
      </div>

      <StatusBarV2
        mode={mode}
        boardName={board.name}
        infoText={
          scene
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
    <div class="sb-screen-empty">
      <PixelIcon name="scroll" size={40} color="var(--border)" />
      <div class="sb-display-vt is-heading">Empty Board</div>
      <div class="sb-empty-body">
        Add a scene to start placing pads. Scenes group pads by narrative moment.
      </div>
      <button class="sb-btn sb-btn-primary sb-btn-cta" onClick={onAddScene}>
        <PixelIcon name="sparkle" size={14} />+ NEW SCENE
      </button>
    </div>
  );
}
