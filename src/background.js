import { DataProfilesSplitter } from './lib/data_profiles_splitter.js'
import { loadAwsConfig } from './lib/load_aws_config.js'
import { LZString } from './lib/lz-string.min.js'
import { LocalStorageRepository, SyncStorageRepository } from './lib/storage_repository.js'

const syncStorageRepo = new SyncStorageRepository(chrome || browser)

function saveAwsConfig(data, callback, storageRepo) {
  const rawstr = data;

  try {
    const profiles = loadAwsConfig(rawstr);
    if (profiles.length > 2000) {
      callback({
        result: 'failure',
        error: {
          message: 'The number of profiles exceeded maximum 2000.'
        }
      });
      return;
    }

    const dps = new DataProfilesSplitter(400);
    const dataSet = dps.profilesToDataSet(profiles);
    dataSet.lztext = LZString.compressToUTF16(rawstr);

    storageRepo.set(dataSet)
    .then(() => {
      callback({ result: 'success' });
    });
  } catch (e) {
    callback({
      result: 'failure',
      error: {
        message: e.message
      }
    });
  }
}

function initScript() {
  localStorage.setItem('switchCount', 0);

  syncStorageRepo.get(['goldenKeyExpire'])
  .then(data => {
    const { goldenKeyExpire } = data;
    if ((new Date().getTime() / 1000) < Number(goldenKeyExpire)) {
      localStorage.setItem('hasGoldenKey', 't');
      chrome.browserAction.setIcon({ path: 'icons/Icon_48x48_g.png' }, () => {});
    }
  })
}

chrome.runtime.onStartup.addListener(function () { initScript() })

chrome.runtime.onInstalled.addListener(function (details) {
  const { reason } = details;
  let page = null;
  if (reason === 'install' || reason === 'update') {
    page = 'updated.html'
  }
  if (page) {
    const url = chrome.extension.getURL(page)
    chrome.tabs.create({ url }, function(){});
  }

  initScript();
})

chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
  const { action, dataType, data } = message || {};
  if (!action || !dataType || !data) return;

  if (action !== 'updateConfig') {
    sendResponse({
      result: 'failure',
      error: { message: 'Invalid action' }
    });
    return;
  }

  if (dataType !== 'ini') {
    sendResponse({
      result: 'failure',
      error: { message: 'Invalid dataType' }
    });
    return;
  }

  syncStorageRepo.get(['configSenderId', 'configStorageArea'])
  .then(settings => {
    const configStorageArea = settings.configStorageArea || 'sync';
    const configSenderIds = (settings.configSenderId || '').split(',');

    if (configSenderIds.includes(sender.id)) {
      if (configStorageArea === 'sync') {
        // forcibly change
        syncStorageRepo.set({ configStorageArea: 'local' }).then(() => {})
      }
      saveAwsConfig(data, sendResponse, new LocalStorageRepository(chrome || browser));
    } else {
      setTimeout(() => {
        sendResponse({
          result: 'failure',
          error: { message: 'Invalid sender ID' }
        });
      }, 1000); // delay to prevent to try scanning id
    }
  })
})
