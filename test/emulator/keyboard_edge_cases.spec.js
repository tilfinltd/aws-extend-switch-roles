/**
 * Test edge cases for keyboard navigation functionality
 */
import { testInPopup } from './fixtures.js';

testInPopup(
  'keyboard navigation with empty filter results',
  // beforeFunc - setup mock data
  function() {
    chrome.storage.sync.set({
      profiles: '[profile dev]\naws_account_id = 123456789012\nrole_name = DeveloperRole\ncolor = ff5722\n\n[profile prod]\naws_account_id = 123456789013\nrole_name = ProductionRole\ncolor = 4caf50'
    });
  },
  // pageFunc - test keyboard navigation with no results
  async function({ page, expect }) {
    await page.waitForSelector('#roleList li', { timeout: 5000 });
    
    const roleFilter = page.locator('#roleFilter');
    await roleFilter.focus();
    
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
    
    return 'Empty filter results test completed successfully';
  },
  // afterFunc - cleanup
  function() {
    chrome.storage.sync.clear();
  }
);

testInPopup(
  'keyboard navigation with single role',
  // beforeFunc - setup mock data with single role
  function() {
    chrome.storage.sync.set({
      profiles: '[profile single]\naws_account_id = 123456789012\nrole_name = SingleRole\ncolor = ff5722'
    });
  },
  // pageFunc - test navigation with only one role
  async function({ page, expect }) {
    await page.waitForSelector('#roleList li', { timeout: 5000 });
    
    const roleFilter = page.locator('#roleFilter');
    await roleFilter.focus();
    
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
    
    return 'Single role navigation test completed successfully';
  },
  // afterFunc - cleanup
  function() {
    chrome.storage.sync.clear();
  }
);

testInPopup(
  'keyboard navigation mixed with typing',
  // beforeFunc - setup mock data
  function() {
    chrome.storage.sync.set({
      profiles: '[profile alpha]\naws_account_id = 111111111111\nrole_name = AlphaRole\ncolor = ff5722\n\n[profile beta]\naws_account_id = 222222222222\nrole_name = BetaRole\ncolor = 2196f3\n\n[profile gamma]\naws_account_id = 333333333333\nrole_name = GammaRole\ncolor = 4caf50'
    });
  },
  // pageFunc - test typing after navigation
  async function({ page, expect }) {
    await page.waitForSelector('#roleList li', { timeout: 5000 });
    
    const roleFilter = page.locator('#roleFilter');
    await roleFilter.focus();
    
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
    
    return 'Mixed typing and navigation test completed successfully';
  },
  // afterFunc - cleanup
  function() {
    chrome.storage.sync.clear();
  }
);
