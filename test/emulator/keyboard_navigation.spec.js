/**
 * Test keyboard navigation functionality in the popup
 */
import { testInPopup, sleep } from './fixtures.js';

testInPopup(
  'keyboard navigation in role filter',
  async () => {
    await self.loadProfileSet({
      singles: [
        {
          name: 'dev',
          aws_account_id: '123456789012',
          role_name: 'DeveloperRole',
          color: 'ff5722'
        },
        {
          name: 'prod',
          aws_account_id: '123456789013',
          role_name: 'ProductionRole',
          color: '4caf50'
        }
      ]
    });
  },
  // pageFunc - test the keyboard navigation
  async function({ page, expect }) {
    // Wait for the popup to load and roles to be rendered
    await page.waitForSelector('#roleList li', { timeout: 1000 });
    
    // Get the role filter input
    const roleFilter = page.locator('#roleFilter');

    // Type a filter to narrow down results
    await roleFilter.fill('dev');
    await page.waitForTimeout(100);

    // Check that first visible role is selected
    const selectedRoles = page.locator('#roleList li.selected');
    await expect(selectedRoles).toHaveCount(1);
    
    // Test Arrow Down navigation
    await page.keyboard.press('ArrowDown');
    
    // Test Enter key selection (this should trigger the click)
    // Note: In a real test environment, this would switch roles
    // Here we just verify the key event is handled
    await page.keyboard.press('Enter').catch(() => {});
    await sleep(100);
    if (!page.isClosed()) throw new Error('Popup should be closed after Enter key');
  },
);

testInPopup(
  'keyboard navigation with Escape key',
  async () => {
    await self.loadProfileSet({
      singles: [
        {
          name: 'dev',
          aws_account_id: '123456789012',
          role_name: 'DeveloperRole',
          color: 'ff5722'
        },
        {
          name: 'prod',
          aws_account_id: '123456789013',
          role_name: 'ProductionRole',
          color: '4caf50'
        }
      ]
    });
  },
  // pageFunc - test the keyboard navigation
  async function({ page, expect }) {
    // Wait for the popup to load and roles to be rendered
    await page.waitForSelector('#roleList li', { timeout: 1000 });
    
    // Get the role filter input
    const roleFilter = page.locator('#roleFilter');

    // Type a filter to narrow down results
    await roleFilter.fill('dev');
    await page.waitForTimeout(100);

    await page.keyboard.press('Escape').catch(() => {});
    await sleep(100);
    if (!page.isClosed()) throw new Error('Popup should be closed after Escape key');
  },
);

testInPopup(
  'arrow key navigation between multiple filtered roles',
  async () => {
    await self.loadProfileSet({
      singles: [
        {
          name: 'dev1',
          aws_account_id: '111111111111',
          role_name: 'DevRole1',
          color: 'ff5722'
        },
        {
          name: 'dev2',
          aws_account_id: '222222222222',
          role_name: 'DevRole2',
          color: '2196f3'
        },
        {
          name: 'prod',
          aws_account_id: '333333333333',
          role_name: 'ProdRole',
          color: '4caf50'
        }
      ]
    });
  },
  // pageFunc - test navigation between multiple filtered roles
  async function({ page, expect }) {
    // Wait for roles to be rendered
    await page.waitForSelector('#roleList li', { timeout: 1000 });
    
    const roleFilter = page.locator('#roleFilter');
    
    // Filter to show only dev roles (should show 2 results)
    await roleFilter.fill('dev');
    await page.waitForTimeout(100);

    // Check that we have visible dev roles
    const visibleRoles = page.locator('#roleList li[style*="block"], #roleList li:not([style*="none"])');
    const visibleCount = await visibleRoles.count();
    
    // Should have at least 2 dev roles visible
    expect(visibleCount).toBeGreaterThanOrEqual(2);
    
    // Test Arrow Down navigation through visible roles
    await page.keyboard.press('ArrowDown');
    
    // Test Arrow Up navigation
    await page.keyboard.press('ArrowUp');
    
    // Verify selection class is applied correctly
    const selectedRoles = page.locator('#roleList li.selected');
    await expect(selectedRoles).toHaveCount(1);
  },
);
