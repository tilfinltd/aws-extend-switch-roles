import { testInSupporters } from './fixtures.js';

testInSupporters("input invalid key code", async ({ page, expect }) => {
  await expect(page.locator('#keyCodeInvalid')).toBeHidden();
  await page.locator('#textareaKeyCode').fill(`Invalid key code`);
  await expect(page.locator('#keyCodeInvalid')).toBeVisible();
});
