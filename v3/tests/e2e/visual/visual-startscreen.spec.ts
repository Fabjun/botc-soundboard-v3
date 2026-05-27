import { test, expect } from '@playwright/test';
import { stableScreenshot } from './visual-setup';

test('StartScreen — flame logo, TAP TO UNLOCK', async ({ page }) => {
  await page.goto('/botc-soundboard-v3/');
  await stableScreenshot(page);
  await expect(page).toHaveScreenshot('startscreen.png', { fullPage: false });
});
