export class StorageRepository {
  constructor(browser, storageArea) {
    this.runtime = browser.runtime
    this.storageArea = browser.storage[storageArea]
  }

  get(keys) {
    return new Promise(resolve => {
      this.storageArea.get(keys, resolve)
    })
  }

  set(items) {
    return new Promise((resolve, reject) => {
      this.storageArea.set(items, () => {
        const { lastError } = this.runtime;
        if (lastError) return reject(lastError)
        resolve()
      })
    })
  }

  delete(keys) {
    this.storageArea.remove(keys, () => {})
  }
}

export class SyncStorageRepository extends StorageRepository {
  constructor(browser) {
    super(browser, 'sync')
  }
}

export class LocalStorageRepository extends StorageRepository {
  constructor(browser) {
    super(browser, 'local')
  }
}
