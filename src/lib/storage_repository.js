export class StorageRepository {
  constructor(browser, storageArea) {
    this.runtime = browser.runtime
    this.storageArea = browser.storage[storageArea]
  }

  async get(keys) {
    return new Promise(resolve => {
      this.storageArea.get(keys, resolve)
    })
  }

  async set(items) {
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

export class SessionStorageRepository extends StorageRepository {
  constructor(browser) {
    super(browser, 'session')
  }

  get disabled() {
    return !this.storageArea
  }
}

export class SessionMemory {
  constructor(browser) {
    const { manifest_version } = browser.runtime.getManifest();
    if (manifest_version >= 3) {
      this.storageRepo = new SessionStorageRepository(browser);
      if (this.storageRepo.disabled) {
        this.storageRepo = new LocalStorageRepository(browser);
      }
    } else {
      this.storageRepo = null;
    }
  }

  async get(keys) {
    if (this.storageRepo) {
      return this.storageRepo.get(keys)
    } else {
      return keys.reduce((result, key) => Object.assign(result, { [key]: localStorage.getItem(key) }), {})
    }
  }

  async set(items) {
    if (this.storageRepo) {
      return this.storageRepo.set(items)
    } else {
      for (let key in items) {
        localStorage.setItem(key, items[key])
      }
    }
  }

  delete(keys) {
    if (this.storageRepo) {
      this.storageRepo.delete(keys)
    } else {
      keys.forEach(key => { localStorage.removeItem(key) });
    }
  }
}
