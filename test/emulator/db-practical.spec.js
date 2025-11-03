/**
 * Practical example test demonstrating database fixture usage
 * 
 * This test file shows real-world examples of testing database operations
 * using the fixture utilities.
 */

import { test } from './fixtures.js';
import {
  setupDatabase,
  setupStorage,
  cleanupTestFixture,
  getProfilesFromDatabase,
  queryProfiles
} from './db-fixtures.js';

test.describe('Database and Storage fixture examples', () => {
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

  /**
   * Example 1: Testing with pre-populated database
   * This demonstrates how to set up test data and verify it's correctly stored
   */
  test('should correctly store and retrieve profile data', async ({ expect }) => {
    // Setup: Pre-populate database with test profiles
    await setupDatabase(worker, [
      {
        profilePath: '[COMPLEX];000001',
        name: 'base-company',
        aws_account_id: '111122223333',
        target_region: 'us-west-2'
      },
      {
        profilePath: 'base-company;000002',
        name: 'dev-environment',
        aws_account_id: '444455556666',
        role_name: 'developer',
        color: 'ff0000'
      },
      {
        profilePath: '[SINGLE];000003',
        name: 'standalone-account',
        aws_account_id: '999988887777',
        role_name: 'admin'
      }
    ]);

    // Test: Verify all profiles are stored
    const allProfiles = await getProfilesFromDatabase(worker);
    expect(allProfiles).toHaveLength(3);

    // Test: Verify complex profiles
    const complexProfiles = await queryProfiles(worker, '[COMPLEX];');
    expect(complexProfiles).toHaveLength(1);
    expect(complexProfiles[0].name).toBe('base-company');
    expect(complexProfiles[0].target_region).toBe('us-west-2');

    // Test: Verify target roles for base account
    const targetRoles = await queryProfiles(worker, 'base-company;');
    expect(targetRoles).toHaveLength(1);
    expect(targetRoles[0].name).toBe('dev-environment');
    expect(targetRoles[0].color).toBe('ff0000');

    // Test: Verify single profiles
    const singleProfiles = await queryProfiles(worker, '[SINGLE];');
    expect(singleProfiles).toHaveLength(1);
    expect(singleProfiles[0].name).toBe('standalone-account');
  });

  /**
   * Example 2: Testing storage configuration behavior
   * This shows how to test different storage configurations
   */
  test('should handle sync storage configuration correctly', async ({ expect }) => {
    // Setup: Configure sync storage
    await setupStorage(worker, 
      {
        configStorageArea: 'sync',
        lztext: 'test-compressed-data',
        profilesLastUpdated: 5000
      },
      {
        profilesTableUpdated: 5000
      }
    );

    // Test: Verify sync storage contains expected data
    const result = await worker.evaluate(async () => {
      const syncData = await chrome.storage.sync.get([
        'configStorageArea',
        'lztext',
        'profilesLastUpdated'
      ]);
      const localData = await chrome.storage.local.get(['profilesTableUpdated']);
      return { sync: syncData, local: localData };
    });

    expect(result.sync.configStorageArea).toBe('sync');
    expect(result.sync.lztext).toBe('test-compressed-data');
    expect(result.sync.profilesLastUpdated).toBe(5000);
    expect(result.local.profilesTableUpdated).toBe(5000);
  });

  /**
   * Example 3: Testing with multiple base accounts
   * This demonstrates testing scenarios with complex organizational structures
   */
  test('should handle multiple base accounts with different target roles', async ({ expect }) => {
    // Setup: Create multiple organizations with different structures
    await setupDatabase(worker, [
      // Organization A
      {
        profilePath: '[COMPLEX];000001',
        name: 'org-a',
        aws_account_id: '111111111111',
        target_role_name: 'developer'
      },
      {
        profilePath: 'org-a;000002',
        name: 'org-a-dev',
        aws_account_id: '111111111112'
        // Will inherit role_name from target_role_name
      },
      {
        profilePath: 'org-a;000003',
        name: 'org-a-prod',
        aws_account_id: '111111111113',
        role_name: 'admin'  // Explicit role_name
      },
      
      // Organization B
      {
        profilePath: '[COMPLEX];000004',
        name: 'org-b',
        aws_account_id: '222222222222'
      },
      {
        profilePath: 'org-b;000005',
        name: 'org-b-staging',
        aws_account_id: '222222222223',
        role_name: 'tester'
      }
    ]);

    // Test: Verify org-a structure
    const orgATargets = await queryProfiles(worker, 'org-a;');
    expect(orgATargets).toHaveLength(2);
    expect(orgATargets.map(p => p.name)).toContain('org-a-dev');
    expect(orgATargets.map(p => p.name)).toContain('org-a-prod');

    // Test: Verify org-b structure
    const orgBTargets = await queryProfiles(worker, 'org-b;');
    expect(orgBTargets).toHaveLength(1);
    expect(orgBTargets[0].name).toBe('org-b-staging');
    expect(orgBTargets[0].role_name).toBe('tester');

    // Test: Verify total count
    const allProfiles = await getProfilesFromDatabase(worker);
    expect(allProfiles).toHaveLength(5);
  });

  /**
   * Example 4: Testing with optional profile attributes
   * This shows testing with various optional attributes like color, image, region
   */
  test('should preserve optional profile attributes', async ({ expect }) => {
    // Setup: Profiles with various optional attributes
    await setupDatabase(worker, [
      {
        profilePath: '[SINGLE];000001',
        name: 'profile-with-color',
        aws_account_id: '111111111111',
        role_name: 'role1',
        color: 'ff0000'
      },
      {
        profilePath: '[SINGLE];000002',
        name: 'profile-with-image',
        aws_account_id: '222222222222',
        role_name: 'role2',
        image: 'https://example.com/logo.png'
      },
      {
        profilePath: '[SINGLE];000003',
        name: 'profile-with-region',
        aws_account_id: '333333333333',
        role_name: 'role3',
        region: 'ap-northeast-1'
      },
      {
        profilePath: '[SINGLE];000004',
        name: 'profile-with-all',
        aws_account_id: '444444444444',
        role_name: 'role4',
        color: '00ff00',
        image: 'https://example.com/icon.png',
        region: 'us-east-1'
      }
    ]);

    const profiles = await getProfilesFromDatabase(worker);
    expect(profiles).toHaveLength(4);

    // Test: Verify profile with color
    const colorProfile = profiles.find(p => p.name === 'profile-with-color');
    expect(colorProfile.color).toBe('ff0000');
    expect(colorProfile.image).toBeUndefined();
    expect(colorProfile.region).toBeUndefined();

    // Test: Verify profile with image
    const imageProfile = profiles.find(p => p.name === 'profile-with-image');
    expect(imageProfile.image).toBe('https://example.com/logo.png');
    expect(imageProfile.color).toBeUndefined();

    // Test: Verify profile with region
    const regionProfile = profiles.find(p => p.name === 'profile-with-region');
    expect(regionProfile.region).toBe('ap-northeast-1');

    // Test: Verify profile with all attributes
    const fullProfile = profiles.find(p => p.name === 'profile-with-all');
    expect(fullProfile.color).toBe('00ff00');
    expect(fullProfile.image).toBe('https://example.com/icon.png');
    expect(fullProfile.region).toBe('us-east-1');
  });

  /**
   * Example 5: Testing empty database scenario
   * This demonstrates testing behavior with no data
   */
  test('should handle empty database gracefully', async ({ expect }) => {
    // No setup - testing with empty database
    
    // Test: Verify database is empty
    const allProfiles = await getProfilesFromDatabase(worker);
    expect(allProfiles).toHaveLength(0);

    // Test: Verify queries return empty arrays
    const complexProfiles = await queryProfiles(worker, '[COMPLEX];');
    expect(complexProfiles).toHaveLength(0);

    const singleProfiles = await queryProfiles(worker, '[SINGLE];');
    expect(singleProfiles).toHaveLength(0);
  });
});
