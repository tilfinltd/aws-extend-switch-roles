import { DataProfilesSplitter } from "./data_profiles_splitter.js";
import { DBManager } from "./db.js";
import { loadAwsConfig } from "./load_aws_config.js";
import { LocalStorageRepository, SyncStorageRepository } from "./storage_repository.js";

export async function updateProfilesTable(brw) {
  const syncRepo = new SyncStorageRepository(brw);
  const localRepo = new LocalStorageRepository(brw);

  const { configStorageArea = 'sync', profilesLastUpdated = 0 } = await syncRepo.get(['configStorageArea', 'profilesLastUpdated']);
  const { profilesTableUpdated = 0 } = await localRepo.get(['profilesTableUpdated']);

  if (profilesTableUpdated === 0) {
    await migrateFromStorageToDB(configStorageArea === 'sync' ? syncRepo : localRepo);
  } else if (configStorageArea === 'sync' && profilesTableUpdated < profilesLastUpdated) {
    // Profiles are updated in sync storage
    await refreshDB(syncRepo);
  } else {
    return;
  }
  await localRepo.set({ profilesTableUpdated: getEpochSeconds().toString() });
}

export async function updateProfilesTableForConfigSender(brw) {
  const localRepo = new LocalStorageRepository(brw);
  await refreshDB(localRepo);
  await localRepo.set({ profilesTableUpdated: getEpochSeconds().toString() });
}

async function migrateFromStorageToDB(storageRepo) {
  const data = await storageRepo.get(['profiles', 'profiles_1', 'profiles_2', 'profiles_3', 'profiles_4'])
  if (data.profiles) {
    const dps = new DataProfilesSplitter();
    const items = dps.profilesFromDataSet(data);

    const dbManager = new DBManager('aesr');
    await dbManager.open();
    await dbManager.transaction('profiles', async dbTable => {
      for (const item of items) {
        const { profile, source_profile, ...props } = item;
        const profilePath = source_profile ? `${source_profile};${profile}` : `[ROOT];${profile}`;
        const record = {
          profilePath,
          name: profile,
          ...props,
        };
        await dbTable.insert(record);
      }
    });
    await dbManager.close();

    const delKeys = Object.entries(data).filter((_key, val) => Boolean(val)).map((key, _val) => key);
    storageRepo.delete(delKeys);
  }
}

async function refreshDB(storageRepo) {
  const data = await storageRepo.get(['lztext', 'lztext_1', 'lztext_2', 'lztext_3', 'lztext_4'])
  if (data.lztext) {
    const rawstr = LZString.decompressFromUTF16(data.lztext);
    const items = loadAwsConfig(rawstr);

    const dbManager = new DBManager('aesr');
    await dbManager.open();
    await dbManager.transaction('profiles', async dbTable => {
      await dbTable.clear();

      for (const item of items) {
        const { profile, source_profile, ...props } = item;
        const profilePath = source_profile ? `${source_profile};${profile}` : `[ROOT];${profile}`;
        const record = {
          profilePath,
          name: profile,
          ...props,
        };
        await dbTable.insert(record);
      }
    });
    await dbManager.close();
  }
}

function getEpochSeconds() {
  return Math.floor(new Date().getTime() / 1000);
}
