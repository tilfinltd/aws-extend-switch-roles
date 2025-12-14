/**
 * Test edge cases for keyboard navigation functionality
 */
import { testInPopup } from './fixtures.js';

testInPopup(
  'keyboard navigation with empty filter results',
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
  // pageFunc - test keyboard navigation with no results
  async function({ page, expect }) {
    await page.waitForSelector('#roleList li', { timeout: 1000 });

    const roleFilter = page.locator('#roleFilter');

    // Type a filter that matches no roles
    await roleFilter.fill('nonexistent');
    await page.waitForTimeout(100);
    
    // Verify no roles are visible
    const visibleRoles = page.locator('#roleList li[style*="block"], #roleList li:not([style*="none"])');
    const visibleCount = await visibleRoles.count();
    expect(visibleCount).toBe(0);
    
    // Test arrow keys when no roles are visible
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    
    // Verify no selection is made
    const selectedRoles = page.locator('#roleList li.selected');
    await expect(selectedRoles).toHaveCount(0);
    
    // Test Enter key with no selection (should not cause errors)
    await page.keyboard.press('Enter');
  },
);

testInPopup(
  'keyboard navigation with single role',
  async () => {
    await self.loadProfileSet({
      singles: [
        {
          name: 'single',
          aws_account_id: '123456789012',
          role_name: 'SingleRole',
          color: 'ff5722'
        }
      ]
    });
  },
  // pageFunc - test navigation with only one role
  async function({ page, expect }) {
    await page.waitForSelector('#roleList li', { timeout: 1000 });
    
    const roleFilter = page.locator('#roleFilter');
    
    // Filter shows single role
    await roleFilter.fill('single');
    await page.waitForTimeout(100);
    
    // Should have exactly one visible role
    const visibleRoles = page.locator('#roleList li[style*="block"], #roleList li:not([style*="none"])');
    const visibleCount = await visibleRoles.count();
    expect(visibleCount).toBe(1);
    
    // Test arrow navigation bounds (should stay on same role)
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown'); // Should not move beyond last role
    
    let selectedRoles = page.locator('#roleList li.selected');
    await expect(selectedRoles).toHaveCount(1);
    
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp'); // Should not move beyond first role
    
    selectedRoles = page.locator('#roleList li.selected');
    await expect(selectedRoles).toHaveCount(1);
  },
);

testInPopup(
  'keyboard navigation mixed with typing',
  async () => {
    await self.loadProfileSet({
      singles: [
        {
          name: 'alpha',
          aws_account_id: '111111111111',
          role_name: 'AlphaRole',
          color: 'ff5722'
        },
        {
          name: 'beta',
          aws_account_id: '222222222222',
          role_name: 'BetaRole',
          color: '2196f3'
        },
        {
          name: 'gamma',
          aws_account_id: '333333333333',
          role_name: 'GammaRole',
          color: '4caf50'
        }
      ]
    });
  },
  // pageFunc - test typing after navigation
  async function({ page, expect }) {
    await page.waitForSelector('#roleList li', { timeout: 1000 });
    
    const roleFilter = page.locator('#roleFilter');
    
    // Start with broad filter
    await roleFilter.fill('a');
    await page.waitForTimeout(100);
    
    // Navigate down
    await page.keyboard.press('ArrowDown');
    
    // Now type more characters (should reset selection to first match)
    await roleFilter.fill('alpha');
    await page.waitForTimeout(100);
    
    // Should auto-select first (and only) matching role
    const selectedRoles = page.locator('#roleList li.selected');
    await expect(selectedRoles).toHaveCount(1);
    
    // Further navigation should work normally
    await page.keyboard.press('ArrowDown');
  },
);
