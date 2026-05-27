import { test, expect } from '@playwright/test';
import { stableScreenshot } from './visual-setup';
import { goToBoardList } from '../helpers';

test('BoardListScreen — with one board', async ({ page }) => {
  await page.goto('/botc-soundboard-v3/');
  await goToBoardList(page);
  await page.getByTestId('new-board-button').click();
  await page.locator('[data-testid^="board-row-"]').first().waitFor();
  await stableScreenshot(page);
  await expect(page).toHaveScreenshot('boardlist-with-board.png', {
    fullPage: false,
  });
});
