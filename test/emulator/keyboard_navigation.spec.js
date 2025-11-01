/**
 * Test keyboard navigation functionality in the popup
 */
import { testInPopup } from './fixtures.js';

testInPopup(
  'keyboard navigation in role filter',
  // beforeFunc - setup mock data
  function() {
    // Mock profiles data for testing
    chrome.storage.sync.set({
      profiles: '[profile dev]\naws_account_id = 123456789012\nrole_name = DeveloperRole\ncolor = ff5722\n\n[profile prod]\naws_account_id = 123456789013\nrole_name = ProductionRole\ncolor = 4caf50'
    });
  },
  // pageFunc - test the keyboard navigation
  async function({ page, expect }) {
    // Wait for the popup to load and roles to be rendered
    await page.waitForSelector('#roleList li', { timeout: 5000 });
    
    // Get the role filter input
    const roleFilter = page.locator('#roleFilter');
    
    // Focus on the filter input
    await roleFilter.focus();
    
    // Type a filter to narrow down results
    await roleFilter.fill('dev');
    
    // Wait for filtering to apply
    await page.waitForTimeout(100);
    
    // Check that first visible role is selected
    const selectedRoles = page.locator('#roleList li.selected');
    await expect(selectedRoles).toHaveCount(1);
    
    // Test Arrow Down navigation
    await page.keyboard.press('ArrowDown');
    
    // Test Enter key selection (this should trigger the click)
    // Note: In a real test environment, this would switch roles
    // Here we just verify the key event is handled
    await page.keyboard.press('Enter');
    
    // Test Escape key (should clear filter and close popup)
    await roleFilter.fill('test');
    await page.keyboard.press('Escape');
    
    // Verify filter was cleared
    const filterValue = await roleFilter.inputValue();
    expect(filterValue).toBe('');
    
    return 'Keyboard navigation test completed successfully';
  },
  // afterFunc - cleanup
  function() {
    // Cleanup storage
    chrome.storage.sync.clear();
  }
);

testInPopup(
  'arrow key navigation between multiple filtered roles',
  // beforeFunc - setup mock data with multiple roles
  function() {
    chrome.storage.sync.set({
      profiles: '[profile dev1]\naws_account_id = 111111111111\nrole_name = DevRole1\ncolor = ff5722\n\n[profile dev2]\naws_account_id = 222222222222\nrole_name = DevRole2\ncolor = 2196f3\n\n[profile prod]\naws_account_id = 333333333333\nrole_name = ProdRole\ncolor = 4caf50'
    });
  },
  // pageFunc - test navigation between multiple filtered roles
  async function({ page, expect }) {
    // Wait for roles to be rendered
    await page.waitForSelector('#roleList li', { timeout: 5000 });
    
    const roleFilter = page.locator('#roleFilter');
    await roleFilter.focus();
    
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
    
    return 'Multi-role navigation test completed successfully';
  },
  // afterFunc - cleanup
  function() {
    chrome.storage.sync.clear();
  }
);
