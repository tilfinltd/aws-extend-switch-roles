/**
 * Example test demonstrating database fixture usage in Playwright tests
 * 
 * This file shows two approaches:
 * 1. Using before hooks to pre-populate database data
 * 2. Using inline setup within tests for specific scenarios
 */

import { test } from './fixtures.js';
import {
  setupDatabase,
  clearDatabase,
  setupStorage,
  clearStorage,
  setupTestFixture,
  cleanupTestFixture,
  getProfilesFromDatabase,
  queryProfiles
} from './db-fixtures.js';

/**
 * Example 1: Using before/after hooks for database setup
 * This approach is useful when you have common test data that is shared across multiple tests
 */
test.describe('Database fixtures with before/after hooks', () => {
  let worker;

  // Setup common test data before each test
  test.beforeEach(async ({ context }) => {
    [worker] = context.serviceWorkers();
    if (!worker) {
      worker = await context.waitForEvent('serviceworker');
    }

    // Pre-populate the database with test data
    await setupTestFixture(worker, {
      profiles: [
        // Base account
        {
          profilePath: '[COMPLEX];000001',
          name: 'test-company',
          aws_account_id: '111122223333',
          target_region: 'ap-northeast-1'
        },
        // Target roles for the base account
        {
          profilePath: 'test-company;000002',
          name: 'dev-role',
          aws_account_id: '444455556666',
          role_name: 'developer',
          color: 'ff0000'
        },
        {
          profilePath: 'test-company;000003',
          name: 'prod-role',
          aws_account_id: '777788889999',
          role_name: 'admin',
          color: '00ff00'
        },
        // Single profiles
        {
          profilePath: '[SINGLE];000004',
          name: 'standalone',
          aws_account_id: '123456789012',
          role_name: 'single-role'
        }
      ],
      syncData: {
        configStorageArea: 'sync',
        profilesLastUpdated: 2000
      },
      localData: {
        profilesTableUpdated: 2000
      }
    });
  });

  // Clean up after each test to ensure test isolation
  test.afterEach(async () => {
    await cleanupTestFixture(worker);
  });

  test('should display roles from pre-populated database', async ({ page, extensionId, expect }) => {
    // Navigate to the extension popup
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Wait for the page to load and render the roles
    await page.waitForSelector('.role-item, .empty-state', { timeout: 5000 });

    // The test can now verify that the roles are displayed correctly
    // This is a placeholder - actual assertions would depend on your UI structure
    const roleItems = await page.locator('.role-item').count();
    expect(roleItems).toBeGreaterThan(0);
  });

  test('should verify database contains expected profiles', async ({ expect }) => {
    // Verify that the database was populated correctly
    const allProfiles = await getProfilesFromDatabase(worker);
    expect(allProfiles).toHaveLength(4);

    // Query specific profile types
    const complexProfiles = await queryProfiles(worker, '[COMPLEX];');
    expect(complexProfiles).toHaveLength(1);
    expect(complexProfiles[0].name).toBe('test-company');

    const targetRoles = await queryProfiles(worker, 'test-company;');
    expect(targetRoles).toHaveLength(2);
    
    const singleProfiles = await queryProfiles(worker, '[SINGLE];');
    expect(singleProfiles).toHaveLength(1);
    expect(singleProfiles[0].name).toBe('standalone');
  });
});

/**
 * Example 2: Inline database setup for specific test scenarios
 * This approach is useful when each test needs different data
 */
test.describe('Database fixtures with inline setup', () => {
  let worker;

  test.beforeEach(async ({ context }) => {
    [worker] = context.serviceWorkers();
    if (!worker) {
      worker = await context.waitForEvent('serviceworker');
    }
    // Clear database before each test, but don't populate yet
    await cleanupTestFixture(worker);
  });

  test.afterEach(async () => {
    await cleanupTestFixture(worker);
  });

  test('should handle empty database gracefully', async ({ page, extensionId }) => {
    // No database setup - testing with empty database
    const profiles = await getProfilesFromDatabase(worker);
    expect(profiles).toHaveLength(0);

    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    // Verify that the UI shows appropriate empty state
  });

  test('should filter roles based on base account', async ({ expect }) => {
    // Setup specific data for this test
    await setupDatabase(worker, [
      // Base account A
      { profilePath: '[COMPLEX];000001', name: 'company-a', aws_account_id: '111111111111' },
      { profilePath: 'company-a;000002', name: 'a-dev', aws_account_id: '222222222222', role_name: 'developer' },
      { profilePath: 'company-a;000003', name: 'a-prod', aws_account_id: '333333333333', role_name: 'admin' },
      
      // Base account B
      { profilePath: '[COMPLEX];000004', name: 'company-b', aws_account_id: '444444444444' },
      { profilePath: 'company-b;000005', name: 'b-dev', aws_account_id: '555555555555', role_name: 'developer' },
    ]);

    // Test logic: verify that when filtering by company-a, only company-a roles are returned
    const companyATargets = await queryProfiles(worker, 'company-a;');
    expect(companyATargets).toHaveLength(2);
    expect(companyATargets[0].name).toBe('a-dev');
    expect(companyATargets[1].name).toBe('a-prod');

    const companyBTargets = await queryProfiles(worker, 'company-b;');
    expect(companyBTargets).toHaveLength(1);
    expect(companyBTargets[0].name).toBe('b-dev');
  });

  test('should handle role color attributes correctly', async ({ expect }) => {
    // Setup data with different color configurations
    await setupDatabase(worker, [
      { profilePath: '[SINGLE];000001', name: 'red-role', aws_account_id: '111111111111', role_name: 'role1', color: 'ff0000' },
      { profilePath: '[SINGLE];000002', name: 'blue-role', aws_account_id: '222222222222', role_name: 'role2', color: '0000ff' },
      { profilePath: '[SINGLE];000003', name: 'no-color-role', aws_account_id: '333333333333', role_name: 'role3' },
    ]);

    const allProfiles = await getProfilesFromDatabase(worker);
    expect(allProfiles).toHaveLength(3);

    // Verify color attributes
    const redRole = allProfiles.find(p => p.name === 'red-role');
    expect(redRole.color).toBe('ff0000');

    const blueRole = allProfiles.find(p => p.name === 'blue-role');
    expect(blueRole.color).toBe('0000ff');

    const noColorRole = allProfiles.find(p => p.name === 'no-color-role');
    expect(noColorRole.color).toBeUndefined();
  });
});

/**
 * Example 3: Testing with storage data
 * Demonstrates how to test behavior based on different storage configurations
 */
test.describe('Storage configuration tests', () => {
  let worker;

  test.beforeEach(async ({ context }) => {
    [worker] = context.serviceWorkers();
    if (!worker) {
      worker = await context.waitForEvent('serviceworker');
    }
    await cleanupTestFixture(worker);
  });

  test.afterEach(async () => {
    await cleanupTestFixture(worker);
  });

  test('should use sync storage when configured', async ({ expect }) => {
    // Setup storage with sync configuration
    await setupStorage(worker, 
      { configStorageArea: 'sync', lztext: '<test-data>', profilesLastUpdated: 5000 },
      { profilesTableUpdated: 5000 }
    );

    // Verify storage was set correctly
    const result = await worker.evaluate(async () => {
      const syncData = await chrome.storage.sync.get(['configStorageArea', 'lztext', 'profilesLastUpdated']);
      const localData = await chrome.storage.local.get(['profilesTableUpdated']);
      return { sync: syncData, local: localData };
    });

    expect(result.sync.configStorageArea).toBe('sync');
    expect(result.sync.lztext).toBe('<test-data>');
    expect(result.sync.profilesLastUpdated).toBe(5000);
    expect(result.local.profilesTableUpdated).toBe(5000);
  });

  test('should use local storage when configured', async ({ expect }) => {
    // Setup storage with local configuration
    await setupStorage(worker,
      { configStorageArea: 'local' },
      { lztext: '<local-test-data>', profilesTableUpdated: 3000 }
    );

    // Verify storage was set correctly
    const result = await worker.evaluate(async () => {
      const syncData = await chrome.storage.sync.get(['configStorageArea']);
      const localData = await chrome.storage.local.get(['lztext', 'profilesTableUpdated']);
      return { sync: syncData, local: localData };
    });

    expect(result.sync.configStorageArea).toBe('local');
    expect(result.local.lztext).toBe('<local-test-data>');
    expect(result.local.profilesTableUpdated).toBe(3000);
  });
});
