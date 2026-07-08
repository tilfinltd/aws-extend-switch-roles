/**
 * Database fixtures for Playwright tests
 * 
 * This module provides utilities to pre-populate or mock database data
 * in Playwright tests, allowing you to test with different data scenarios.
 */

/**
 * Setup database with predefined test data
 * This function can be called in beforeEach or within a test to pre-populate the database
 * 
 * @param {Object} worker - The service worker context from Playwright
 * @param {Array} profiles - Array of profile objects to insert into the database
 * @returns {Promise<void>}
 * 
 * @example
 * // In a test's before hook:
 * await setupDatabase(worker, [
 *   { profilePath: '[COMPLEX];000001', name: 'base-account', aws_account_id: '111122223333' },
 *   { profilePath: 'base-account;000002', name: 'target-role', aws_account_id: '444455556666', role_name: 'developer' }
 * ]);
 */
export async function setupDatabase(worker, profiles) {
  await worker.evaluate(async (profileData) => {
    const { DBManager } = await import('./lib/db.js');
    const dbManager = new DBManager('aesr');
    await dbManager.open();
    
    await dbManager.transaction('profiles', async dbTable => {
      await dbTable.truncate();
    });
    
    await dbManager.transaction('profiles', async dbTable => {
      for (const profile of profileData) {
        await dbTable.insert(profile);
      }
    });
    
    await dbManager.close();
  }, profiles);
}

/**
 * Clear all data from the database
 * Useful in afterEach hooks to ensure test isolation
 * 
 * @param {Object} worker - The service worker context from Playwright
 * @returns {Promise<void>}
 * 
 * @example
 * // In a test's after hook:
 * await clearDatabase(worker);
 */
export async function clearDatabase(worker) {
  await worker.evaluate(async () => {
    const { DBManager } = await import('./lib/db.js');
    const dbManager = new DBManager('aesr');
    await dbManager.open();
    
    await dbManager.transaction('profiles', async dbTable => {
      await dbTable.truncate();
    });
    
    await dbManager.close();
  });
}

/**
 * Setup storage data (chrome.storage.sync or chrome.storage.local)
 * This allows you to pre-populate storage with configuration data
 * 
 * @param {Object} worker - The service worker context from Playwright
 * @param {Object} syncData - Data to set in chrome.storage.sync
 * @param {Object} localData - Data to set in chrome.storage.local
 * @returns {Promise<void>}
 * 
 * @example
 * // Pre-populate storage with configuration:
 * await setupStorage(worker, 
 *   { configStorageArea: 'sync', lztext: '<config-data>' },
 *   { profilesTableUpdated: 1000 }
 * );
 */
export async function setupStorage(worker, syncData = {}, localData = {}) {
  await worker.evaluate(async (data) => {
    const { sync, local } = data;
    if (Object.keys(sync).length > 0) {
      await chrome.storage.sync.set(sync);
    }
    if (Object.keys(local).length > 0) {
      await chrome.storage.local.set(local);
    }
  }, { sync: syncData, local: localData });
}

/**
 * Clear all storage data
 * Useful in afterEach hooks to ensure test isolation
 * 
 * @param {Object} worker - The service worker context from Playwright
 * @returns {Promise<void>}
 * 
 * @example
 * // Clean up storage after each test:
 * await clearStorage(worker);
 */
export async function clearStorage(worker) {
  await worker.evaluate(async () => {
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
  });
}

/**
 * Get all profiles from the database
 * Useful for assertions to verify database state after operations
 * 
 * @param {Object} worker - The service worker context from Playwright
 * @returns {Promise<Array>} Array of profile objects from the database
 * 
 * @example
 * // Verify database content after an operation:
 * const profiles = await getProfilesFromDatabase(worker);
 * expect(profiles).toHaveLength(5);
 */
export async function getProfilesFromDatabase(worker) {
  return await worker.evaluate(async () => {
    const { DBManager } = await import('./lib/db.js');
    const dbManager = new DBManager('aesr');
    await dbManager.open();
    
    let items;
    await dbManager.transaction('profiles', async dbTable => {
      items = await dbTable.all();
    }, 'readonly');
    
    await dbManager.close();
    return items;
  });
}

/**
 * Query profiles from the database by prefix
 * Allows you to get specific subsets of profiles
 * 
 * @param {Object} worker - The service worker context from Playwright
 * @param {string} prefix - The prefix to filter profilePath (e.g., '[SINGLE];' or 'base-account;')
 * @returns {Promise<Array>} Array of matching profile objects
 * 
 * @example
 * // Get all single profiles:
 * const singleProfiles = await queryProfiles(worker, '[SINGLE];');
 * 
 * // Get all target roles for a base account:
 * const targetRoles = await queryProfiles(worker, 'MyCompany;');
 */
export async function queryProfiles(worker, prefix) {
  return await worker.evaluate(async (queryPrefix) => {
    const { DBManager } = await import('./lib/db.js');
    const dbManager = new DBManager('aesr');
    await dbManager.open();
    
    let items;
    await dbManager.transaction('profiles', async dbTable => {
      items = await dbTable.query(queryPrefix);
    }, 'readonly');
    
    await dbManager.close();
    return items;
  }, prefix);
}

/**
 * Create a complete test fixture with database and storage setup
 * This is a convenience function that combines database and storage setup
 * 
 * @param {Object} worker - The service worker context from Playwright
 * @param {Object} options - Configuration options
 * @param {Array} options.profiles - Database profiles to insert
 * @param {Object} options.syncData - Data for chrome.storage.sync
 * @param {Object} options.localData - Data for chrome.storage.local
 * @returns {Promise<void>}
 * 
 * @example
 * // Setup complete test fixture:
 * await setupTestFixture(worker, {
 *   profiles: [
 *     { profilePath: '[COMPLEX];000001', name: 'MyCompany', aws_account_id: '111122223333' }
 *   ],
 *   syncData: { configStorageArea: 'sync' },
 *   localData: { profilesTableUpdated: 1000 }
 * });
 */
export async function setupTestFixture(worker, { profiles = [], syncData = {}, localData = {} } = {}) {
  await clearDatabase(worker);
  await clearStorage(worker);
  
  if (profiles.length > 0) {
    await setupDatabase(worker, profiles);
  }
  
  await setupStorage(worker, syncData, localData);
}

/**
 * Clean up all test fixtures
 * Call this in afterEach to ensure test isolation
 * 
 * @param {Object} worker - The service worker context from Playwright
 * @returns {Promise<void>}
 * 
 * @example
 * // Clean up after each test:
 * afterEach(async () => {
 *   await cleanupTestFixture(worker);
 * });
 */
export async function cleanupTestFixture(worker) {
  await clearDatabase(worker);
  await clearStorage(worker);
}
