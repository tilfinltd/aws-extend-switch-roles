import { nowEpochSeconds } from "../lib/util.js";
import { StorageProvider } from "../lib/storage_repository.js";
import { refreshDB } from "../lib/profile_db.js";
import { saveConfigIni } from "../lib/config_ini.js";

export async function externalConfigReceived(action, dataType, data, senderId) {
  if (action !== 'updateConfig') throw new Error('Invalid action');
  if (dataType !== 'ini') throw new Error('Invalid dataType');

  const syncRepo = StorageProvider.getSyncRepository();
  const settings = await syncRepo.get(['configSenderId', 'configStorageArea']);
  const configStorageArea = settings.configStorageArea || 'sync';
  const configSenderIds = (settings.configSenderId || '').split(',');

  if (!configSenderIds.includes(senderId)) throw new Error('Invalid sender ID');

  if (configStorageArea === 'sync') {
    // forcibly change
    await syncRepo.set({ configStorageArea: 'local' });
  }

  await updateProfilesFromConfigIni(data);
}

async function updateProfilesFromConfigIni(text) {
  const localRepo = StorageProvider.getLocalRepository();
  await saveConfigIni(localRepo, text);
  await refreshDB(localRepo);
  await localRepo.set({ profilesTableUpdated: nowEpochSeconds() });
}
