// ─────────────────────────────────────────────────────────────────────────────
// PadGrid — 4×4 CSS grid of PadGridCells
//
// Orchestrates:
//   - Rendering 16 cells (occupied + empty)
//   - SETUP mode: DnD via padDnd.ts (pointer events)
//   - SETUP mode: Cell-tap → Path A (PadCreationPopover)
//   - SETUP mode: Pad-tap → PadEditorPanel
//   - Path B: library drag-and-drop (dragover / drop events from LibraryPanel)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type { AppMode, Board, Pad, PadPosition, Scene } from '../types';
import { PadGridCell } from './PadGridCell';
import { PadCreationPopover, type CreationResult } from './PadCreationPopover';
import {
  startDrag,
  setPadsRef,
  registerCellRef,
  configureDnd,
  applySwap,
  applyInsert,
  type DndDropResult,
} from '../lib/padDnd';
import { nextFreeSlot, typeInference } from '../lib/padUtils';
import { libraryItems, upsertBoard } from '../state/store';
import { boardPut } from '../db/idb';
import { nanoid } from '../lib/nanoid';

interface PadGridProps {
  scene: Scene;
  board: Board;
  mode: AppMode;
  selectedPadId: string | null;
  onPadSelect: (pad: Pad) => void;
  onRequestNewPad: (pad: Pad) => void; // Path C / "More options" → opens PadEditorPanel
}

export function PadGrid({
  scene,
  board,
  mode,
  selectedPadId,
  onPadSelect,
  onRequestNewPad,
}: PadGridProps): JSX.Element {
  const cols = scene.gridConfig.cols;
  const rows = scene.gridConfig.rows;
  const isSetup = mode === 'edit';

  // Path A popover state
  const [popoverPos, setPopoverPos] = useState<PadPosition | null>(null);
  const [popoverCellRect, setPopoverCellRect] = useState<DOMRect | null>(null);

  // Build lookup map: "col,row" → Pad
  const padMap = new Map<string, Pad>();
  for (const pad of scene.pads) {
    if (pad.position) {
      padMap.set(`${pad.position.col},${pad.position.row}`, pad);
    }
  }

  // ── DnD setup ─────────────────────────────────────────────────────────────

  useEffect(() => {
    configureDnd(cols, rows);
  }, [cols, rows]);

  useEffect(() => {
    setPadsRef(scene.pads);
  });

  async function handleDrop(result: DndDropResult) {
    if (result.kind === 'cancel') return;

    let updatedPads: Pad[];
    if (result.kind === 'swap') {
      updatedPads = applySwap(scene.pads, result.srcId, result.tgtPos);
    } else {
      updatedPads = applyInsert(scene.pads, result.srcId, result.toIndex, cols, rows);
    }

    const updatedScene: Scene = { ...scene, pads: updatedPads };
    const updatedBoard: Board = {
      ...board,
      scenes: board.scenes.map(s => s.id === scene.id ? updatedScene : s),
    };
    try {
      await boardPut(updatedBoard);
      upsertBoard(updatedBoard);
    } catch (e) {
      console.error('Pad DnD save failed:', e);
    }
  }

  function handlePadPointerDown(e: PointerEvent, pad: Pad) {
    if (!isSetup) return;
    const cellEl = (e.currentTarget as HTMLElement).closest('.sb-pad-grid-cell') as HTMLElement;
    if (!cellEl) return;
    startDrag(e, pad.id, cellEl, handleDrop);
  }

  // ── Library drop (Path B) ──────────────────────────────────────────────────

  const [isDragOverGrid, setIsDragOverGrid] = useState(false);
  const [dragOverPos, setDragOverPos] = useState<PadPosition | null>(null);

  function handleGridDragOver(e: DragEvent) {
    if (!isSetup) return;
    const hasLib = e.dataTransfer?.types.includes('text/plain');
    if (!hasLib) return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
    setIsDragOverGrid(true);

    // Find target cell
    const target = e.target as HTMLElement;
    const cell = target.closest('[data-pos]') as HTMLElement | null;
    if (cell) {
      const [col, row] = (cell.dataset.pos ?? '').split(',').map(Number);
      if (!isNaN(col) && !isNaN(row)) {
        setDragOverPos({ col, row });
      }
    }
  }

  function handleGridDragLeave(e: DragEvent) {
    const related = e.relatedTarget as Node | null;
    const grid = e.currentTarget as HTMLElement;
    if (!grid.contains(related)) {
      setIsDragOverGrid(false);
      setDragOverPos(null);
    }
  }

  async function handleGridDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOverGrid(false);
    const itemId = e.dataTransfer?.getData('text/plain');
    if (!itemId || !isSetup) { setDragOverPos(null); return; }

    // Find drop position
    let targetPos: PadPosition | null = dragOverPos;
    if (!targetPos) {
      targetPos = nextFreeSlot(scene.pads, cols, rows);
    }
    if (!targetPos) { setDragOverPos(null); return; }

    // If slot is occupied, use next free
    const occupied = scene.pads.find(
      p => p.position?.col === targetPos!.col && p.position?.row === targetPos!.row
    );
    const finalPos = occupied ? nextFreeSlot(scene.pads, cols, rows) : targetPos;
    if (!finalPos) { setDragOverPos(null); return; }

    const item = libraryItems.value.find(m => m.id === itemId);
    if (!item) { setDragOverPos(null); return; }

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

    await savePadToScene(newPad);
    setDragOverPos(null);
  }

  // ── Pad CRUD ───────────────────────────────────────────────────────────────

  async function savePadToScene(newPad: Pad) {
    const updatedScene: Scene = { ...scene, pads: [...scene.pads, newPad] };
    const updatedBoard: Board = {
      ...board,
      scenes: board.scenes.map(s => s.id === scene.id ? updatedScene : s),
    };
    try {
      await boardPut(updatedBoard);
      upsertBoard(updatedBoard);
    } catch (e) {
      console.error('Pad create failed:', e);
    }
  }

  async function handleCreationResult(result: CreationResult) {
    setPopoverPos(null);
    setPopoverCellRect(null);

    if (result.action === 'cancel') return;

    if (result.action === 'create') {
      await savePadToScene(result.pad);
    } else if (result.action === 'open-editor') {
      // Build a partial pad and open the editor (sets selectedPad)
      const partial = result.partialPad as Pad;
      await savePadToScene(partial);
      onRequestNewPad(partial);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        class={'sb-pad-grid' + (isSetup ? ' sb-grid-bg' : '')}
        style={{
          '--grid-cols': String(cols),
          '--grid-rows': String(rows),
          '--grid-gap': `${scene.gridConfig.gap}px`,
          outline: isDragOverGrid ? '2px solid var(--mode-setup)' : '2px solid transparent',
          outlineOffset: '-2px',
        } as Record<string, string>}
        onDragOver={handleGridDragOver}
        onDragLeave={handleGridDragLeave}
        onDrop={handleGridDrop}
      >
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const key = `${col},${row}`;
            const pad = padMap.get(key) ?? null;
            return (
              <PadGridCell
                key={key}
                pad={pad}
                mode={mode}
                col={col}
                row={row}
                selected={!!pad && pad.id === selectedPadId}
                cellRef={el => registerCellRef(key, el)}
                onEmpty={(rect) => {
                  if (!isSetup) return;
                  setPopoverPos({ col, row });
                  setPopoverCellRect(rect);
                }}
                onPadSelect={onPadSelect}
                onPadPointerDown={isSetup ? handlePadPointerDown : undefined}
              />
            );
          })
        )}

      </div>

      {/* Path A Popover */}
      {popoverPos && popoverCellRect && (
        <PadCreationPopover
          position={popoverPos}
          cellRect={popoverCellRect}
          onResult={handleCreationResult}
        />
      )}
    </>
  );
}
