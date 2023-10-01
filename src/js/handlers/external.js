import { nowEpochSeconds } from "../lib/util.js";
import { CompressedTextSplitter } from "../lib/compressed_text_splitter.js";
import { StorageProvider } from "../lib/storage_repository.js";
import { refreshDB } from "../lib/profile_db.js";

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

  const cts = new CompressedTextSplitter('local');
  const dataSet = cts.textToDataSet(text);
  await localRepo.set(dataSet);

  await refreshDB(localRepo);
  await localRepo.set({ profilesTableUpdated: nowEpochSeconds() });
}
