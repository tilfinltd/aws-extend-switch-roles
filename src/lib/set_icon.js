export function setIcon(path) {
  const details = { path };
  const brw = chrome || browser;
  if (brw.action) {
    // Manifest v3
    return brw.action.setIcon(details);
  } else if (browser.browserAction) {
    // Firefox MV2
    return brw.browserAction.setIcon(details);
  } else {
    // Chrome MV2
    return new Promise(resolve => {
      chrome.browserAction.setIcon(details, resolve);
    });
  }
}
