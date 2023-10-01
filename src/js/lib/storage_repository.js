export class StorageRepository {
  constructor(browser, storageArea) {
    this.kind = storageArea;
    this.runtime = browser.runtime;
    this.storageArea = browser.storage[storageArea];
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
    this.storageRepo = new SessionStorageRepository(browser);
    if (this.storageRepo.disabled) {
      this.storageRepo = new LocalStorageRepository(browser);
    }
  }

  async get(keys) {
    return this.storageRepo.get(keys)
  }

  async set(items) {
    return this.storageRepo.set(items)
  }

  delete(keys) {
    this.storageRepo.delete(keys)
  }
}

export class StorageProvider {
  static _local = null;
  static _sync = null;

  static getLocalRepository() {
    if (!this._local) {
      this._local = new LocalStorageRepository(chrome || browser);
    }
    return this._local;
  }

  static getSyncRepository() {
    if (!this._sync) {
      this._sync = new SyncStorageRepository(chrome || browser);
    }
    return this._sync;
  }

  static getRepositoryByKind(kind) {
    if (kind === 'local') return this.getLocalRepository();
    if (kind === 'sync') return this.getSyncRepository();
  }
}
