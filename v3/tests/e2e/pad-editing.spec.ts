// ─────────────────────────────────────────────────────────────────────────────
// Full E2E — Pad Editing (Slice-3 verification points 16–19)
//
// 16. Tap pad in SETUP → PadEditorPanel opens
// 17. Change pad name → auto-saved (persists after reload)
// 18. Trivial type change (single→loop) → no dialog, type updates
// 19. Lossy type change (playlist→single) → PadTypeConfirmDialog appears
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  goToLibrary,
  uploadTestAudio,
  goToBoardList,
  createBoardAndNavigate,
  createScene,
  enterSetupMode,
  createPadAtCell00,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/botc-soundboard-v3/');
  await goToLibrary(page);
  await uploadTestAudio(page);
  await page.goto('/botc-soundboard-v3/');
  await goToBoardList(page);
  await createBoardAndNavigate(page);
  await createScene(page);
  await enterSetupMode(page);
  await createPadAtCell00(page);
});

// ── Test 16: Tap pad in SETUP → PadEditorPanel opens ─────────────────────────

test('16 — tap pad in SETUP mode → PadEditorPanel opens', async ({ page }) => {
  const padCell = page
    .locator('[data-testid^="pad-cell-"]:not([data-testid^="pad-cell-empty-"])')
    .first();
  await padCell.click();
  await expect(page.getByTestId('pad-editor')).toBeVisible();
});

// ── Test 17: Change pad name → auto-saved ────────────────────────────────────

test('17 — change pad name in editor → persists after page reload', async ({
  page,
}) => {
  // Open editor
  const padCell = page
    .locator('[data-testid^="pad-cell-"]:not([data-testid^="pad-cell-empty-"])')
    .first();
  await padCell.click();
  await page.getByTestId('pad-editor').waitFor();

  // Change the name
  const nameInput = page.getByTestId('editor-name-input');
  await nameInput.fill('Renamed Pad');
  // Wait for auto-save debounce (500ms) + some buffer
  await page.waitForTimeout(800);

  // Reload page and navigate back to the board
  await page.reload();
  await page.getByRole('button', { name: 'BOARD' }).click();
  // Board should still exist
  const boardRow = page.locator('[data-testid^="board-row-"]').first();
  await boardRow.waitFor();
  await boardRow.locator('[data-testid^="board-row-title-"]').click();
  await page.getByTestId('mode-toggle').waitFor();
  // Re-enter setup mode
  await enterSetupMode(page);

  // The pad cell should show the new name (DOM text; textTransform is CSS-visual only)
  await expect(
    page
      .locator('[data-testid^="pad-cell-"]:not([data-testid^="pad-cell-empty-"])')
      .first(),
  ).toContainText('Renamed Pad');
});

// ── Test 18: Trivial type change → no dialog ─────────────────────────────────

test('18 — trivial type change (single→loop) → no confirmation dialog', async ({
  page,
}) => {
  // Open editor
  const padCell = page
    .locator('[data-testid^="pad-cell-"]:not([data-testid^="pad-cell-empty-"])')
    .first();
  await padCell.click();
  await page.getByTestId('pad-editor').waitFor();

  // Click LOOP type button (trivial from single)
  await page.getByTestId('editor-type-loop').click();

  // No dialog should appear
  await expect(page.getByTestId('type-confirm-dialog')).not.toBeVisible({
    timeout: 1000,
  });
  // Type button should appear active (loop selected)
  await expect(page.getByTestId('editor-type-loop')).toHaveClass(/sb-btn-primary/);
});

// ── Test 19: Lossy type change → PadTypeConfirmDialog appears ────────────────

test('19 — lossy type change → PadTypeConfirmDialog appears', async ({
  page,
}) => {
  // First set the pad type to playlist (requires: open editor, click playlist)
  const padCell = page
    .locator('[data-testid^="pad-cell-"]:not([data-testid^="pad-cell-empty-"])')
    .first();
  await padCell.click();
  await page.getByTestId('pad-editor').waitFor();

  // Switch to PLAYLIST type (from SINGLE: this may trigger a dialog)
  // playlist→single is lossy; single→playlist may be an add (no dialog)
  // So first go single→playlist (no dialog expected), then playlist→single (lossy)
  await page.getByTestId('editor-type-playlist').click();
  // If a dialog appears, dismiss it first (single→playlist might be lossy too)
  const maybeDialog = page.getByTestId('type-confirm-dialog');
  const dialogVisible = await maybeDialog.isVisible();
  if (dialogVisible) {
    await page.getByTestId('type-confirm-switch').click();
    await expect(maybeDialog).not.toBeVisible({ timeout: 2000 });
  }
  // Now switch back: playlist→single (lossy: drops playlist sources)
  await page.getByTestId('editor-type-single').click();
  // Confirmation dialog should appear
  await expect(page.getByTestId('type-confirm-dialog')).toBeVisible();
  // Cancel: type should NOT change
  await page.getByTestId('type-confirm-cancel').click();
  await expect(page.getByTestId('type-confirm-dialog')).not.toBeVisible({
    timeout: 2000,
  });
});
