# Implementation Summary: Database Testing Utilities for Playwright

## Problem Statement (Original Request in Japanese)
「playwrightのテストにおいて、データベースのデータをbeforeで事前登録するかmockして、データ内容に応じた正しい結果が得られるかtestするための方法を考えて」

Translation: "Think of a method to pre-register database data in before hooks or mock it in Playwright tests, and test if correct results are obtained based on the data content."

## Solution Overview

This implementation provides a comprehensive testing framework for Playwright tests in the AWS Extend Switch Roles browser extension, enabling developers to:

1. Pre-populate IndexedDB database with test data
2. Mock Chrome Storage (sync and local) configurations
3. Verify database state after operations
4. Ensure test isolation with proper cleanup utilities

## Files Created

### 1. Core Utilities
**File**: `test/emulator/db-fixtures.js`
- 8 helper functions for database and storage manipulation
- Full JSDoc documentation with examples
- Support for both individual and combined operations

**Key Functions**:
- `setupDatabase(worker, profiles)` - Pre-populate database
- `clearDatabase(worker)` - Clear database data
- `setupStorage(worker, syncData, localData)` - Set up Chrome Storage
- `clearStorage(worker)` - Clear Chrome Storage
- `getProfilesFromDatabase(worker)` - Retrieve all profiles
- `queryProfiles(worker, prefix)` - Query profiles by prefix
- `setupTestFixture(worker, options)` - Combined setup
- `cleanupTestFixture(worker)` - Complete cleanup

### 2. Test Examples
**File**: `test/emulator/db-practical.spec.js`
- 5 real-world test examples
- Demonstrates both beforeEach and inline setup approaches
- Tests various scenarios: empty database, multiple accounts, optional attributes

**File**: `test/emulator/db-fixtures.example.spec.js`
- Comprehensive examples with detailed documentation
- 3 test suites demonstrating different approaches
- Examples of storage configuration testing

### 3. Documentation
**File**: `test/emulator/DATABASE_TESTING_GUIDE.md` (Japanese)
- Complete guide in Japanese
- Usage examples for all utility functions
- Best practices and troubleshooting

**File**: `test/emulator/README_DATABASE_TESTING.md` (English)
- Full English documentation
- Quick start guide
- Detailed API reference

## Testing Approaches Implemented

### Approach 1: beforeEach/afterEach Hooks
Best for tests that share common data:

```javascript
test.describe('My tests', () => {
  let worker;

  test.beforeEach(async ({ context }) => {
    [worker] = context.serviceWorkers();
    if (!worker) {
      worker = await context.waitForEvent('serviceworker');
    }

    await setupTestFixture(worker, {
      profiles: [/* test data */],
      syncData: {/* storage data */},
      localData: {/* local storage data */}
    });
  });

  test.afterEach(async () => {
    await cleanupTestFixture(worker);
  });

  test('my test', async ({ expect }) => {
    // Test with pre-populated data
  });
});
```

### Approach 2: Inline Setup
Best for tests needing specific data:

```javascript
test('specific scenario', async ({ expect }) => {
  await setupDatabase(worker, [
    // Specific test data for this scenario
  ]);

  // Test logic here
});
```

## Key Features

1. **Test Isolation**: Every test can start with a clean state
2. **Flexibility**: Support for both shared and test-specific data
3. **Complete Coverage**: Handle both IndexedDB and Chrome Storage
4. **Type Safety**: Full JSDoc documentation for IDE support
5. **Easy to Use**: Simple API that follows existing patterns
6. **Well Documented**: Both Japanese and English guides

## Profile Data Structure

The utilities support three types of profiles:

### Base Account (Complex Profile)
```javascript
{
  profilePath: '[COMPLEX];000001',
  name: 'base-account-name',
  aws_account_id: '111122223333',
  // Optional fields...
}
```

### Target Role
```javascript
{
  profilePath: 'base-account-name;000002',
  name: 'target-role-name',
  aws_account_id: '444455556666',
  role_name: 'developer',
  color: 'ff0000',
  // Optional fields...
}
```

### Single Profile
```javascript
{
  profilePath: '[SINGLE];000001',
  name: 'standalone-profile',
  aws_account_id: '999988887777',
  role_name: 'admin',
  // Optional fields...
}
```

## Validation Results

✅ **Syntax Check**: All files pass JavaScript syntax validation
✅ **Unit Tests**: Existing tests continue to pass (31 tests passing)
✅ **Code Review**: Addressed all review comments
✅ **Security Scan**: No security vulnerabilities found (CodeQL)

## Usage Example

```javascript
import { test } from './fixtures.js';
import { setupTestFixture, cleanupTestFixture, queryProfiles } from './db-fixtures.js';

test.describe('Profile filtering', () => {
  let worker;

  test.beforeEach(async ({ context }) => {
    [worker] = context.serviceWorkers();
    if (!worker) {
      worker = await context.waitForEvent('serviceworker');
    }

    await setupTestFixture(worker, {
      profiles: [
        {
          profilePath: '[COMPLEX];000001',
          name: 'my-company',
          aws_account_id: '111122223333'
        },
        {
          profilePath: 'my-company;000002',
          name: 'dev-role',
          aws_account_id: '444455556666',
          role_name: 'developer'
        }
      ]
    });
  });

  test.afterEach(async () => {
    await cleanupTestFixture(worker);
  });

  test('should filter by company', async ({ expect }) => {
    const roles = await queryProfiles(worker, 'my-company;');
    expect(roles).toHaveLength(1);
    expect(roles[0].name).toBe('dev-role');
  });
});
```

## Benefits

1. **Improved Test Quality**: Tests can now verify behavior with realistic data
2. **Test Isolation**: Each test runs independently with clean state
3. **Reduced Boilerplate**: Reusable utilities reduce code duplication
4. **Better Coverage**: Easier to test edge cases and various data scenarios
5. **Developer Experience**: Clear documentation and examples

## Running Tests

```bash
# Run all Playwright tests
npm run test_emulator

# Run specific test file
npx playwright test test/emulator/db-practical.spec.js

# Run with UI for debugging
npx playwright test --ui
```

## Integration with Existing Tests

The new utilities integrate seamlessly with the existing test infrastructure:
- Uses existing `fixtures.js` for base test setup
- Follows patterns from `options.spec.js` and `worker.spec.js`
- Compatible with existing database structure in `src/js/lib/db.js`
- Works with the extension's service worker context

## Next Steps for Users

1. Read the documentation:
   - Japanese users: `DATABASE_TESTING_GUIDE.md`
   - English users: `README_DATABASE_TESTING.md`

2. Review examples:
   - `db-practical.spec.js` for real-world patterns
   - `db-fixtures.example.spec.js` for comprehensive examples

3. Start writing tests:
   - Import utilities from `db-fixtures.js`
   - Set up data in beforeEach or inline
   - Clean up in afterEach

## Conclusion

This implementation provides a complete solution for database testing in Playwright tests, addressing the original problem statement by offering two flexible approaches (beforeEach hooks and inline setup) with comprehensive utilities, documentation, and examples.
