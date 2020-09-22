function saveAwsConfig(data, callback) {
  const rawstr = data;

  try {
    const profiles = loadAwsConfig(rawstr);
    if (profiles.length > 200) {
      callback({
        result: 'failure',
        error: {
          message: 'The number of profiles exceeded maximum 200.'
        }
      });
      return;
    }

    const dps = new DataProfilesSplitter();
    const dataSet = dps.profilesToDataSet(profiles);
    dataSet.lztext = LZString.compressToUTF16(rawstr);

    chrome.storage.sync.set(dataSet,
      function() {
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

  chrome.storage.sync.get(['configSenderId'], function(settings) {
    const configSenderIds = (settings.configSenderId || '').split(',');
    if (configSenderIds.includes(sender.id)) {
      saveAwsConfig(data, sendResponse)
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
