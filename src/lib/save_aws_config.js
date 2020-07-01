function saveAwsConfig(data, callback) {
  const rawstr = data;

  try {
    const profiles = loadAwsConfig(rawstr);

    chrome.storage.sync.get(['configSenderId', 'profileLocalStorage'], function(settings) {

      var profileLocalStorage = settings.profileLocalStorage ? true : false;

      if (!profileLocalStorage && profiles.length > 200) {
        callback({
          result: 'failure',
          error: {
            message: 'The number of profiles exceeded maximum 200.'
          }
        });
        return;
      }
      var dps;
      if (profileLocalStorage) {
        dps = new DataProfilesSplitter(100000);
      }
      else {
        dps = new DataProfilesSplitter();
      }
      const dataSet = dps.profilesToDataSet(profiles);
      dataSet.lztext = LZString.compressToUTF16(rawstr);
      const storageType = profileLocalStorage ? 'local' : 'sync'
      chrome.storage[storageType].set(dataSet, function() {
        const { lastError } = chrome.runtime || browser.runtime;
        if (lastError) {
          callback({
            result: 'failure',
            error: {
              message: lastError.message
            }
          });
        }
        else {
          callback({
            result: 'success',
            message: 'Configuration has been updated!'
          });
        }
      });
    });
  } catch (e) {
    callback({
      result: 'failure',
      error: {
        message: `Failed to save: ${e.message}`
      }
    });
  }
}
