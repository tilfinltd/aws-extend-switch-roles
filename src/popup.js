import { createProfileSet } from './lib/profile_set.js'
import { DataProfilesSplitter } from './lib/data_profiles_splitter.js'
import { StorageRepository, SyncStorageRepository } from './lib/storage_repository.js'

function openOptions() {
  if (window.chrome) {
    chrome.runtime.openOptionsPage(err => {
      console.error(`Error: ${err}`);
    });
  } else if (window.browser) {
    window.browser.runtime.openOptionsPage().catch(err => {
      console.error(`Error: ${err}`);
    });
  }
}

function getCurrentTab() {
  if (window.chrome) {
    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow:true, active:true }, tabs => {
        resolve(tabs[0])
      })
    })
  } else if (window.browser) {
    return browser.tabs.query({ currentWindow:true, active:true }).then(tabs => tabs[0])
  }
}

function executeAction(tabId, action, data) {
  if (window.chrome) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action, data }, {}, resolve)
    })
  } else if (window.browser) {
    return browser.tabs.sendMessage(tabId, { action, data })
  }
}

window.onload = function() {
  const MANY_SWITCH_COUNT = 4;

  document.getElementById('openOptionsLink').onclick = function(e) {
    openOptions();
    return false;
  }

  document.getElementById('openUpdateNoticeLink').onclick = function(e) {
    chrome.tabs.create({ url: chrome.extension.getURL('updated.html')}, function(tab){});
    return false;
  }

  document.getElementById('openCreditsLink').onclick = function(e) {
    chrome.tabs.create({ url: chrome.extension.getURL('credits.html')}, function(tab){});
    return false;
  }

  document.getElementById('openSupportersLink').onclick = document.getElementById('openSupportMe').onclick = function(e) {
    chrome.tabs.create({ url: chrome.extension.getURL('supporters.html')}, function(tab){});
    return false;
  }

  const hasGoldenKey = localStorage.getItem('hasGoldenKey');
  const swcnt = localStorage.getItem('switchCount') || 0;
  if (hasGoldenKey) {
    document.getElementById('goldenkey').style.display = 'block';
  } else if (swcnt > MANY_SWITCH_COUNT) {
    document.getElementById('supportComment').style.display = 'block';
  }
  main();
}

function main() {
  getCurrentTab()
    .then(tab => {
      const url = new URL(tab.url)
      if (url.host.endsWith('.aws.amazon.com')
       || url.host.endsWith('.amazonaws-us-gov.com')
       || url.host.endsWith('.amazonaws.cn')) {
        executeAction(tab.id, 'loadInfo', {}).then(userInfo => {
          if (userInfo) {
            loadFormList(url, userInfo, tab.id);
            document.getElementById('main').style.display = 'block';
          } else {
            const noMain = document.getElementById('noMain');
            const p = noMain.querySelector('p');
            p.textContent = 'Failed to fetch user info from the AWS Management Console page';
            p.style.color = '#d11';
            noMain.style.display = 'block';
          }
        })
      } else {
        const p = noMain.querySelector('p');
        p.textContent = "You'll see the role list here when the current tab is AWS Management Console page.";
        p.style.color = '#666';
        noMain.style.display = 'block';
      }
    })
}

function loadFormList(currentUrl, userInfo, tabId) {
  const storageRepo = new SyncStorageRepository(chrome || browser)
  storageRepo.get(['hidesAccountId', 'showOnlyMatchingRoles', 'configStorageArea'])
  .then(data => {
    const hidesAccountId = data.hidesAccountId || false;
    const showOnlyMatchingRoles = data.showOnlyMatchingRoles || false;
    const configStorageArea = data.configStorageArea || 'sync';

    new StorageRepository(chrome || browser, configStorageArea).get(['profiles', 'profiles_1', 'profiles_2', 'profiles_3', 'profiles_4'])
    .then(data => {
      if (data.profiles) {
        const dps = new DataProfilesSplitter();
        const profiles = dps.profilesFromDataSet(data);
        const profileSet = createProfileSet(profiles, userInfo, { showOnlyMatchingRoles });

        const list = document.getElementById('roleList');
        loadProfiles(profileSet, tabId, list, currentUrl, userInfo.isGlobal, hidesAccountId);
      }
    })
  });
}

function loadProfiles(profileSet, tabId, list, currentUrl, isGlobal, hidesAccountId) {
  profileSet.destProfiles.forEach(item => {
    const color = item.color || 'aaaaaa';
    const li = document.createElement('li');
    const headSquare = document.createElement('span');
    headSquare.textContent = ' ';
    headSquare.className = 'headSquare';
    headSquare.style = `background-color: #${color}`
    if (item.image) {
      headSquare.style += `; background-image: url('${item.image.replace(/"/g, '')}');`
    }

    const anchor = document.createElement('a');
    anchor.href = "#";
    anchor.title = item.role_name + '@' + item.aws_account_id;
    anchor.dataset.profile = item.profile;
    anchor.dataset.rolename = item.role_name;
    anchor.dataset.account = item.aws_account_id;
    anchor.dataset.color = color;
    anchor.dataset.redirecturi = createRedirectURI(currentUrl, item.region);
    anchor.dataset.search = item.profile.toLowerCase() + ' ' + item.aws_account_id;

    anchor.appendChild(headSquare);
    anchor.appendChild(document.createTextNode(item.profile));

    if (hidesAccountId) {
      anchor.dataset.displayname = item.profile;
    } else {
      anchor.dataset.displayname = item.profile + '  |  ' + item.aws_account_id;

      const accountIdSpan = document.createElement('span');
      accountIdSpan.className = 'suffixAccountId';
      accountIdSpan.textContent = item.aws_account_id;
      anchor.appendChild(accountIdSpan);
    }

    li.appendChild(anchor);
    list.appendChild(li);
  });

  Array.from(list.querySelectorAll('li a')).forEach(anchor => {
    anchor.onclick = function() {
      const data = { ...this.dataset }; // do not directly refer DOM data in Firefox
      sendSwitchRole(tabId, data);
      return false;
    }
  });

  let AWSR_firstAnchor = null;
  document.getElementById('roleFilter').onkeyup = function(e) {
    const words = this.value.toLowerCase().split(' ');
    if (e.keyCode === 13) {
      if (AWSR_firstAnchor) {
        AWSR_firstAnchor.click()
      }
    } else {
      const lis = Array.from(document.querySelectorAll('#roleList > li'));
      let firstHitLi = null;
      lis.forEach(li => {
        const anchor = li.querySelector('a')
        const profileName = anchor.dataset.search;
        const hit = words.every(it => profileName.includes(it));
        li.style.display = hit ? 'block' : 'none';
        li.style.background = null;
        if (hit && firstHitLi === null) firstHitLi = li;
      });

      if (firstHitLi) {
        firstHitLi.style.background = '#f0f9ff';
        AWSR_firstAnchor = firstHitLi.querySelector('a');
      } else {
        AWSR_firstAnchor = null;
      }
    }
  }

  document.getElementById('roleFilter').focus()
}

function createRedirectURI(currentURL, destRegion) {
  if (!destRegion) return encodeURIComponent(currentURL.href);

  let redirectUri = currentURL.href;
  const md = currentURL.search.match(/region=([a-z\-1-9]+)/);
  if (md) {
    const currentRegion = md[1];
    if (currentRegion !== destRegion) {
      redirectUri = redirectUri.replace('region=' + currentRegion, 'region=' + destRegion);
    }
  }
  return encodeURIComponent(redirectUri);
}

function sendSwitchRole(tabId, data) {
  executeAction(tabId, 'switch', data).then(() => {
    let swcnt = localStorage.getItem('switchCount') || 0;
    localStorage.setItem('switchCount', ++swcnt);
    window.close()
  });
}
