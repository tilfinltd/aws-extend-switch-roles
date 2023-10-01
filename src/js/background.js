import { SessionMemory, SyncStorageRepository } from './lib/storage_repository.js'
import { setIcon } from './lib/set_icon.js'
import { externalConfigReceived } from './handlers/external.js'
import { updateProfilesTable } from './handlers/update_profiles.js'

const syncStorageRepo = new SyncStorageRepository(chrome || browser)
const sessionMemory = new SessionMemory(chrome || browser)

function initScript() {
  sessionMemory.set({ switchCount: 0 }).then(() => {});

  syncStorageRepo.get(['goldenKeyExpire'])
  .then(data => {
    const { goldenKeyExpire } = data;
    if ((new Date().getTime() / 1000) < Number(goldenKeyExpire)) {
      return sessionMemory.set({ hasGoldenKey: 't' }).then(() => {
        return setIcon('/icons/Icon_48x48_g.png');
      });
    }
  })
}

chrome.runtime.onStartup.addListener(function () {
  updateProfilesTable().catch(err => {
    console.error(err);
  });

  initScript();
})

chrome.runtime.onInstalled.addListener(function (details) {
  const { reason } = details;
  let page = null;
  if (reason === 'install' || reason === 'update') {
    page = 'updated.html'
  }
  if (page) {
    const url = chrome.runtime.getURL(page)
    chrome.tabs.create({ url }, function(){});
  }

  initScript();
})

chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
  const { action, dataType, data } = message || {};
  if (!action || !dataType || !data) return;

  externalConfigReceived(action, dataType, data, sender.id)
  .then(() => {
    sendResponse({ result: 'success' });
  })
  .catch(err => {
    setTimeout(() => {
      sendResponse({
        result: 'failure',
        error: { message: err.message },
      });
    }, 1000); // delay to prevent to try scanning id
  });
});
