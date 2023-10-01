import { nowEpochSeconds } from "../lib/util.js";
import { DataProfilesSplitter } from "../lib/data_profiles_splitter.js";
import { writeProfileItemsToTable, refreshDB } from "../lib/profile_db.js";
import { StorageProvider } from "../lib/storage_repository.js";

export async function updateProfilesTable() {
  const syncRepo = StorageProvider.getSyncRepository();
  const localRepo = StorageProvider.getLocalRepository();

  const { configStorageArea = 'sync', profilesLastUpdated = 0 } = await syncRepo.get(['configStorageArea', 'profilesLastUpdated']);
  const { profilesTableUpdated = 0 } = await localRepo.get(['profilesTableUpdated']);

  if (profilesTableUpdated === 0) {
    await migrateFromStorageToDB(configStorageArea === 'sync' ? syncRepo : localRepo);
    if (profilesLastUpdated === 0 && configStorageArea === 'sync') {
      // first migration
      await syncRepo.set({ profilesLastUpdated: nowEpochSeconds() });
    }
  } else if (configStorageArea === 'sync' && profilesTableUpdated < profilesLastUpdated) {
    // Profiles are updated in sync storage
    await refreshDB(syncRepo);
  } else {
    return;
  }
  await localRepo.set({ profilesTableUpdated: nowEpochSeconds() });
}

async function migrateFromStorageToDB(storageRepo) {
  const keys = ['profiles', 'profiles_1', 'profiles_2', 'profiles_3', 'profiles_4'];
  const dataSet = await storageRepo.get(keys);
  const dps = new DataProfilesSplitter();
  const items = dps.profilesFromDataSet(dataSet);

  // Set single flag to independent profiles
  const sourceProfileSet = new Set();
  items.forEach(it => {
    if (it.source_profile) sourceProfileSet.add(it.source_profile);
  });
  items.forEach(it => {
    if (!it.source_profile && !sourceProfileSet.has(it.profile)) {
      it.single = true;
    }
  });

  if (items.length > 0) {
    writeProfileItemsToTable(items);
    storageRepo.delete(keys);
  }
}
