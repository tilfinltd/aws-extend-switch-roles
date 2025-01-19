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
  if (reason === 'install' || reason === 'update') {
    const url = chrome.runtime.getURL('updated.html')
    chrome.tabs.create({ url }, function(){});
  }
  if (reason === 'update') {
    updateProfilesTable().catch(err => {
      console.error(err);
    });
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

let listeningTabGroupsRemove = false;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'listenTabGroupsRemove' && !listeningTabGroupsRemove) {
    chrome.tabGroups.onRemoved.addListener(async function (group) {
      const key = encodeURIComponent(`tabGroup/${group.title}`);
      const result = await sessionMemory.get([key]);
      const { [key]: url } = result;
      if (url) {
        await sessionMemory.delete([key]);
        const tab = await chrome.tabs.create({ url, active: false });
        setTimeout(() => {
          chrome.tabs.remove(tab.id);
        }, 1000);
        console.info('Logout', group.title, url);
      }
    });
    listeningTabGroupsRemove = true;
  } else if (message.action === 'registerTabGroup') {
    const { endpoint, sessionId, tabGroupId, title, color } = message;
    await chrome.tabGroups.update(tabGroupId, { title, color: getTabGroupColor(color) });

    const key = encodeURIComponent(`tabGroup/${title}`);
    await sessionMemory.set({ [key]: `${endpoint}/sessions/${sessionId}/v1/logout` });
  }
  sendResponse({});
});

function getTabGroupColor(hexColor) {
  if (!hexColor) return 'grey';

  const tabGroupColors = {
    grey: [128, 128, 128],
    blue: [0, 0, 255],
    red: [255, 0, 0],
    yellow: [255, 255, 0],
    green: [0, 128, 0],
    pink: [255, 192, 203],
    purple: [128, 0, 128],
    cyan: [0, 255, 255],
    orange: [255, 165, 0],
  };

  const inputRgb = (() => {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  })();

  const calcDistance = (rgb1, rgb2) => {
    if (!rgb1) return Infinity;
    return rgb1.reduce((dis, val, i) => dis + (val - rgb2[i]) ** 2, 0);
  };

  let closestColor = 'grey';
  let minDistance = Infinity;
  for (const tgColor in tabGroupColors) {
    const distance = calcDistance(inputRgb, tabGroupColors[tgColor]);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = tgColor;
    }
  }

  return closestColor;
}
