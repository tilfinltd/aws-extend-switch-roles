import { nowEpochSeconds } from "../lib/util.js";
import { DataProfilesSplitter } from "../lib/data_profiles_splitter.js";
import { writeProfileSetToTable, writeProfileItemsToTable, refreshDB } from "../lib/profile_db.js";
import { StorageProvider } from "../lib/storage_repository.js";
import { saveConfigIni } from "../lib/config_ini.js";
import { OAuthClient } from "../remote/oauth-client.js";
import { deleteRefreshTokenFromRemoteConnectInfo } from "./remote_connect.js";

export async function updateProfilesTable() {
  const syncRepo = StorageProvider.getSyncRepository();
  const localRepo = StorageProvider.getLocalRepository();

  const { configStorageArea = 'sync', profilesLastUpdated = 0 } = await syncRepo.get(['configStorageArea', 'profilesLastUpdated']);
  const { profilesTableUpdated = 0, remoteConnectInfo = null } = await localRepo.get(['profilesTableUpdated', 'remoteConnectInfo']);

  if (remoteConnectInfo) {
    const oaClient = new OAuthClient(remoteConnectInfo.subdomain, remoteConnectInfo.clientId);
    try {
      const idToken = await oaClient.getIdTokenByRefresh(remoteConnectInfo.refreshToken);
      const { profile } = await oaClient.getUserConfig(idToken);
      await writeProfileSetToTable(profile);
      console.log('Updated profile from Config Hub');
    } catch {
      await deleteRefreshTokenFromRemoteConnectInfo();
      console.warn('Failed to profile from Config Hub, so the refresh token was deleted.');
    }
    return;
  }

  const now = nowEpochSeconds();
  if (profilesTableUpdated === 0) {
    if (configStorageArea === 'sync' && profilesLastUpdated === 0) {
      // first migration
      await migrateFromStorageToDB(syncRepo);
      await copyLztextFromSyncToLocal(syncRepo, localRepo);
      await syncRepo.set({ profilesLastUpdated: now });
    } else if (configStorageArea === 'local') {
      await migrateFromStorageToDB(localRepo);
    }
  } else if (configStorageArea === 'sync' && profilesTableUpdated < profilesLastUpdated) {
    // Profiles are updated in sync storage
    const cfgText = await refreshDB(syncRepo);
    await saveConfigIni(localRepo, cfgText);
  } else {
    return;
  }
  await localRepo.set({ profilesTableUpdated: now });
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

async function copyLztextFromSyncToLocal(syncRepo, localRepo) {
  const { lztext } = await syncRepo.get(['lztext']);
  await localRepo.set({ lztext });
}
