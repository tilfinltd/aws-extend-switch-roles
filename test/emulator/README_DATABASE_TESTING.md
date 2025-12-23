# Database Testing Utilities for Playwright Tests

[日本語ガイドはこちら](./DATABASE_TESTING_GUIDE.md)

## Overview

This directory contains utilities for testing with pre-populated database data in Playwright tests. These utilities allow you to:

1. **Pre-register data** in IndexedDB before running tests
2. **Mock storage data** in Chrome Storage (sync and local)
3. **Verify database state** after operations
4. **Ensure test isolation** with cleanup utilities

## Quick Start

### 1. Import the utilities

```javascript
import { test } from './fixtures.js';
import {
  setupDatabase,
  setupStorage,
  setupTestFixture,
  cleanupTestFixture,
  getProfilesFromDatabase,
  queryProfiles
} from './db-fixtures.js';
```

### 2. Basic test structure with beforeEach/afterEach

```javascript
test.describe('My test suite', () => {
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

  test('my test', async ({ expect }) => {
    // Your test code here
  });
});
```

### 3. Pre-populate database in beforeEach

```javascript
test.beforeEach(async ({ context }) => {
  [worker] = context.serviceWorkers();
  if (!worker) {
    worker = await context.waitForEvent('serviceworker');
  }
  
  await setupTestFixture(worker, {
    profiles: [
      {
        profilePath: '[COMPLEX];000001',
        name: 'base-account',
        aws_account_id: '111122223333'
      },
      {
        profilePath: 'base-account;000002',
        name: 'dev-role',
        aws_account_id: '444455556666',
        role_name: 'developer'
      }
    ],
    syncData: { configStorageArea: 'sync' },
    localData: { profilesTableUpdated: 2000 }
  });
});
```

## Available Functions

### Database Functions

#### `setupDatabase(worker, profiles)`
Set up the database with an array of profile objects.

**Parameters:**
- `worker` - Service worker context from Playwright
- `profiles` - Array of profile objects to insert

**Example:**
```javascript
await setupDatabase(worker, [
  {
    profilePath: '[SINGLE];000001',
    name: 'my-profile',
    aws_account_id: '123456789012',
    role_name: 'developer',
    color: 'ff0000'
  }
]);
```

#### `clearDatabase(worker)`
Clear all data from the database.

**Example:**
```javascript
await clearDatabase(worker);
```

#### `getProfilesFromDatabase(worker)`
Get all profiles from the database. Returns an array of profile objects.

**Example:**
```javascript
const profiles = await getProfilesFromDatabase(worker);
expect(profiles).toHaveLength(3);
```

#### `queryProfiles(worker, prefix)`
Query profiles by profilePath prefix.

**Parameters:**
- `worker` - Service worker context
- `prefix` - String prefix to filter by

**Common prefixes:**
- `'[SINGLE];'` - Get all single profiles
- `'[COMPLEX];'` - Get all complex (base account) profiles
- `'base-account;'` - Get all target roles for 'base-account'

**Example:**
```javascript
const singleProfiles = await queryProfiles(worker, '[SINGLE];');
const targetRoles = await queryProfiles(worker, 'MyCompany;');
```

### Storage Functions

#### `setupStorage(worker, syncData, localData)`
Set up Chrome Storage with data.

**Parameters:**
- `worker` - Service worker context
- `syncData` - Object to set in chrome.storage.sync (optional)
- `localData` - Object to set in chrome.storage.local (optional)

**Example:**
```javascript
await setupStorage(worker,
  { configStorageArea: 'sync', lztext: '<data>' },
  { profilesTableUpdated: 1000 }
);
```

#### `clearStorage(worker)`
Clear all Chrome Storage data (both sync and local).

**Example:**
```javascript
await clearStorage(worker);
```

### Combined Functions

#### `setupTestFixture(worker, options)`
Set up both database and storage in one call.

**Parameters:**
- `worker` - Service worker context
- `options` - Object with `profiles`, `syncData`, and `localData` properties

**Example:**
```javascript
await setupTestFixture(worker, {
  profiles: [/* profile array */],
  syncData: { configStorageArea: 'sync' },
  localData: { profilesTableUpdated: 1000 }
});
```

#### `cleanupTestFixture(worker)`
Clean up both database and storage.

**Example:**
```javascript
await cleanupTestFixture(worker);
```

## Profile Data Structure

Profiles in the database have the following structure:

### Base Account (Complex Profile)
```javascript
{
  profilePath: '[COMPLEX];000001',
  name: 'base-account-name',
  aws_account_id: '111122223333',
  // Optional:
  aws_account_alias: 'my-alias',
  target_role_name: 'default-role',
  target_region: 'us-west-2',
  role_name: 'login-role'
}
```

### Target Role
```javascript
{
  profilePath: 'base-account-name;000002',
  name: 'target-role-name',
  aws_account_id: '444455556666',
  role_name: 'developer',
  // Optional:
  color: 'ff0000',
  image: 'https://example.com/logo.png',
  region: 'ap-northeast-1'
}
```

### Single Profile
```javascript
{
  profilePath: '[SINGLE];000001',
  name: 'standalone-profile',
  aws_account_id: '999988887777',
  role_name: 'admin',
  // Optional:
  color: '00ff00',
  image: 'https://example.com/icon.png',
  region: 'us-east-1'
}
```

## Best Practices

### 1. Always Clean Up After Tests
Use `afterEach` to ensure tests don't affect each other:

```javascript
test.afterEach(async () => {
  await cleanupTestFixture(worker);
});
```

### 2. Use Descriptive Test Data
Make test intentions clear with meaningful names:

```javascript
await setupDatabase(worker, [
  { profilePath: '[COMPLEX];000001', name: 'production-account', ... },
  { profilePath: 'production-account;000002', name: 'admin-role', ... }
]);
```

### 3. Test with Minimal Data
Only set up the data needed for each specific test.

### 4. Verify Expected State
Always verify that data was set up correctly:

```javascript
const profiles = await getProfilesFromDatabase(worker);
expect(profiles).toHaveLength(expectedCount);
```

### 5. Understand profilePath Format
- Single profiles: `[SINGLE];{number}`
- Base accounts: `[COMPLEX];{number}`
- Target roles: `{base-account-name};{number}`

## Example Tests

### Example 1: Test with beforeEach Setup

```javascript
test.describe('Role filtering', () => {
  let worker;

  test.beforeEach(async ({ context }) => {
    [worker] = context.serviceWorkers();
    if (!worker) {
      worker = await context.waitForEvent('serviceworker');
    }

    await setupTestFixture(worker, {
      profiles: [
        { profilePath: '[COMPLEX];000001', name: 'company-a', aws_account_id: '111111111111' },
        { profilePath: 'company-a;000002', name: 'dev', aws_account_id: '222222222222', role_name: 'developer' }
      ]
    });
  });

  test.afterEach(async () => {
    await cleanupTestFixture(worker);
  });

  test('should query company-a roles', async ({ expect }) => {
    const roles = await queryProfiles(worker, 'company-a;');
    expect(roles).toHaveLength(1);
    expect(roles[0].name).toBe('dev');
  });
});
```

### Example 2: Test with Inline Setup

```javascript
test('should handle specific scenario', async ({ expect }) => {
  await setupDatabase(worker, [
    { profilePath: '[SINGLE];000001', name: 'test-role', aws_account_id: '123456789012', role_name: 'admin' }
  ]);

  const profiles = await getProfilesFromDatabase(worker);
  expect(profiles).toHaveLength(1);
  expect(profiles[0].role_name).toBe('admin');
});
```

### Example 3: Test Storage Configuration

```javascript
test('should work with sync storage', async ({ expect }) => {
  await setupStorage(worker,
    { configStorageArea: 'sync', lztext: 'test-data' },
    { profilesTableUpdated: 5000 }
  );

  const result = await worker.evaluate(async () => {
    return await chrome.storage.sync.get(['configStorageArea', 'lztext']);
  });

  expect(result.configStorageArea).toBe('sync');
  expect(result.lztext).toBe('test-data');
});
```

## Running Tests

```bash
# Run all emulator tests
npm run test_emulator

# Run specific test file
npx playwright test test/emulator/db-practical.spec.js

# Run with UI mode (helpful for debugging)
npx playwright test --ui
```

## Related Files

- **db-fixtures.js** - The fixture utility functions
- **db-practical.spec.js** - Practical examples of using the fixtures
- **db-fixtures.example.spec.js** - Comprehensive examples with documentation
- **DATABASE_TESTING_GUIDE.md** - Japanese language guide
- **fixtures.js** - Base Playwright fixtures for extension testing

## Troubleshooting

### Database not updating
- Ensure you call `clearDatabase` before `setupDatabase`
- Verify the service worker is properly initialized

### Tests affecting each other
- Make sure `afterEach` calls `cleanupTestFixture`
- Verify each test uses independent data

### Storage data not persisting
- Check that you're passing correct parameters to `setupStorage`
- Understand the difference between `chrome.storage.sync` and `chrome.storage.local`

## Further Reading

- [Playwright Test Documentation](https://playwright.dev/docs/test-fixtures)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
