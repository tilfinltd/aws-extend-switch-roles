# Playwrightテストでのデータベースデータ事前登録・モック方法

## 概要

このドキュメントでは、Playwrightテストにおいて、IndexedDBデータベースおよびChrome Storageのデータを事前登録またはモックして、データ内容に応じた正しい結果が得られるかをテストする方法を説明します。

## アプローチ

このリポジトリでは、以下の2つの主要なアプローチを提供しています：

### 1. beforeフックでのデータ事前登録
テストの前にデータベースとストレージを事前に設定し、各テストが一貫したデータ状態で開始されるようにします。

### 2. テスト内でのインライン設定
各テストが独自のデータセットを必要とする場合に、テスト内で直接データを設定します。

## 使用可能なユーティリティ

`test/emulator/db-fixtures.js` には、以下のヘルパー関数が用意されています：

### データベース操作

#### `setupDatabase(worker, profiles)`
データベースに事前定義されたプロファイルデータを設定します。

```javascript
await setupDatabase(worker, [
  { 
    profilePath: '[COMPLEX];000001', 
    name: 'base-account', 
    aws_account_id: '111122223333' 
  },
  { 
    profilePath: 'base-account;000002', 
    name: 'target-role', 
    aws_account_id: '444455556666', 
    role_name: 'developer' 
  }
]);
```

#### `clearDatabase(worker)`
データベースの全データをクリアします。テストの独立性を保証するために、`afterEach`フックで使用します。

```javascript
test.afterEach(async () => {
  await clearDatabase(worker);
});
```

#### `getProfilesFromDatabase(worker)`
データベースから全プロファイルを取得します。アサーションに便利です。

```javascript
const profiles = await getProfilesFromDatabase(worker);
expect(profiles).toHaveLength(5);
```

#### `queryProfiles(worker, prefix)`
プレフィックスでプロファイルをクエリします。

```javascript
// 単一プロファイルを取得
const singleProfiles = await queryProfiles(worker, '[SINGLE];');

// 特定のベースアカウントのターゲットロールを取得
const targetRoles = await queryProfiles(worker, 'MyCompany;');
```

### ストレージ操作

#### `setupStorage(worker, syncData, localData)`
Chrome Storageにデータを設定します。

```javascript
await setupStorage(worker, 
  { configStorageArea: 'sync', lztext: '<config-data>' },
  { profilesTableUpdated: 1000 }
);
```

#### `clearStorage(worker)`
全ストレージデータをクリアします。

```javascript
await clearStorage(worker);
```

### 統合ユーティリティ

#### `setupTestFixture(worker, options)`
データベースとストレージの両方を一度に設定します。

```javascript
await setupTestFixture(worker, {
  profiles: [
    { profilePath: '[COMPLEX];000001', name: 'MyCompany', aws_account_id: '111122223333' }
  ],
  syncData: { configStorageArea: 'sync' },
  localData: { profilesTableUpdated: 1000 }
});
```

#### `cleanupTestFixture(worker)`
データベースとストレージの両方をクリーンアップします。

```javascript
test.afterEach(async () => {
  await cleanupTestFixture(worker);
});
```

## 使用例

### 例1: beforeフックでの共通データセットアップ

複数のテストで共通のデータを使用する場合：

```javascript
import { test } from './fixtures.js';
import { setupTestFixture, cleanupTestFixture, getProfilesFromDatabase } from './db-fixtures.js';

test.describe('Role management tests', () => {
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
          name: 'test-company',
          aws_account_id: '111122223333'
        },
        {
          profilePath: 'test-company;000002',
          name: 'dev-role',
          aws_account_id: '444455556666',
          role_name: 'developer',
          color: 'ff0000'
        }
      ],
      syncData: { configStorageArea: 'sync' },
      localData: { profilesTableUpdated: 2000 }
    });
  });

  test.afterEach(async () => {
    await cleanupTestFixture(worker);
  });

  test('should display pre-populated roles', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    // ロールが正しく表示されることを確認
  });

  test('should verify database state', async ({ expect }) => {
    const profiles = await getProfilesFromDatabase(worker);
    expect(profiles).toHaveLength(2);
  });
});
```

### 例2: テストごとに異なるデータのインライン設定

各テストが異なるデータシナリオを必要とする場合：

```javascript
import { test } from './fixtures.js';
import { setupDatabase, cleanupTestFixture, queryProfiles } from './db-fixtures.js';

test.describe('Filtering tests', () => {
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

  test('should filter by company A', async ({ expect }) => {
    await setupDatabase(worker, [
      { profilePath: '[COMPLEX];000001', name: 'company-a', aws_account_id: '111111111111' },
      { profilePath: 'company-a;000002', name: 'a-dev', aws_account_id: '222222222222', role_name: 'developer' },
      { profilePath: '[COMPLEX];000003', name: 'company-b', aws_account_id: '333333333333' },
      { profilePath: 'company-b;000004', name: 'b-dev', aws_account_id: '444444444444', role_name: 'developer' }
    ]);

    const companyATargets = await queryProfiles(worker, 'company-a;');
    expect(companyATargets).toHaveLength(1);
    expect(companyATargets[0].name).toBe('a-dev');
  });

  test('should handle empty database', async ({ expect }) => {
    // データベースは空の状態でテスト
    const profiles = await getProfilesFromDatabase(worker);
    expect(profiles).toHaveLength(0);
  });
});
```

### 例3: ストレージ設定のテスト

異なるストレージ設定での動作をテストする場合：

```javascript
import { test } from './fixtures.js';
import { setupStorage, cleanupTestFixture } from './db-fixtures.js';

test.describe('Storage configuration', () => {
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

  test('should work with sync storage', async ({ expect }) => {
    await setupStorage(worker,
      { configStorageArea: 'sync', lztext: '<data>' },
      { profilesTableUpdated: 5000 }
    );

    const result = await worker.evaluate(async () => {
      const data = await chrome.storage.sync.get(['configStorageArea']);
      return data;
    });

    expect(result.configStorageArea).toBe('sync');
  });

  test('should work with local storage', async ({ expect }) => {
    await setupStorage(worker,
      { configStorageArea: 'local' },
      { lztext: '<local-data>', profilesTableUpdated: 3000 }
    );

    const result = await worker.evaluate(async () => {
      const data = await chrome.storage.local.get(['lztext']);
      return data;
    });

    expect(result.lztext).toBe('<local-data>');
  });
});
```

## ベストプラクティス

### 1. テストの独立性を確保する
`afterEach`フックで必ずデータをクリーンアップしましょう：

```javascript
test.afterEach(async () => {
  await cleanupTestFixture(worker);
});
```

### 2. 意味のあるテストデータを使用する
テストの意図が明確になるように、分かりやすいプロファイル名とアカウントIDを使用しましょう：

```javascript
await setupDatabase(worker, [
  { profilePath: '[COMPLEX];000001', name: 'production-account', aws_account_id: '111111111111' },
  { profilePath: 'production-account;000002', name: 'admin-role', role_name: 'admin' }
]);
```

### 3. 必要最小限のデータでテストする
各テストに必要なデータだけを設定し、テストを高速かつ焦点を絞ったものにしましょう。

### 4. データ構造を理解する
- `profilePath`の形式：
  - 単一プロファイル: `[SINGLE];000001`
  - ベースアカウント: `[COMPLEX];000001`
  - ターゲットロール: `{base-account-name};000002`

### 5. アサーションを具体的にする
期待される正確なデータ構造を確認しましょう：

```javascript
const profiles = await getProfilesFromDatabase(worker);
expect(profiles).toHaveLength(3);
expect(profiles[0].name).toBe('expected-name');
expect(profiles[0].aws_account_id).toBe('123456789012');
```

## テストの実行

```bash
# 全てのPlaywrightテストを実行
npm run test_emulator

# 特定のテストファイルを実行
npx playwright test test/emulator/db-fixtures.example.spec.js
```

## トラブルシューティング

### データベースが更新されない
- `setupDatabase`の前に必ず`clearDatabase`を呼び出しているか確認してください
- service workerが正しく初期化されているか確認してください

### テストが互いに影響し合う
- `afterEach`フックで`cleanupTestFixture`を呼び出しているか確認してください
- 各テストが独立したデータセットを使用しているか確認してください

### ストレージデータが永続化されない
- `setupStorage`に正しいパラメータを渡しているか確認してください
- `chrome.storage.sync`と`chrome.storage.local`の違いを理解しているか確認してください

## 参考資料

- 既存のテスト例: `test/emulator/options.spec.js`
- データベース実装: `src/js/lib/db.js`
- プロファイルDB: `src/js/lib/profile_db.js`
- フィクスチャ: `test/emulator/fixtures.js`
