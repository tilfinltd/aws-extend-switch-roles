function openOptions() {
  if (window.chrome) {
    chrome.runtime.openOptionsPage(err => {
      console.log(`Error: ${error}`);
    });
  } else if (window.browser) {
    window.browser.runtime.openOptionsPage().catch(err => {
      console.log(`Error: ${error}`);
    });
  }
}

window.onload = function() {
  document.getElementById('openOptionsLink').onclick = function(e) {
    openOptions();
    return false;
  }

  document.getElementById('openCreditsLink').onclick = function(e) {
    chrome.tabs.create({ url: chrome.extension.getURL('credits.html')}, function(tab){});
    return false;
  }

  document.getElementById('openDonationLink').onclick = function(e) {
    chrome.tabs.create({ url: chrome.extension.getURL('donation.html')}, function(tab){});
    return false;
  }
}
