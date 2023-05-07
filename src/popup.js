import { createRoleListItem } from './lib/create_role_list_item.js'
import { createProfileSet } from './lib/profile_set.js'
import { DataProfilesSplitter } from './lib/data_profiles_splitter.js'
import { StorageRepository, SyncStorageRepository } from './lib/storage_repository.js'

function openOptions() {
  if (window.chrome) {
    chrome.runtime.openOptionsPage(err => {
      if (err) console.error(`Error: ${err}`);
    });
  } else if (window.browser) {
    window.browser.runtime.openOptionsPage().catch(err => {
      if (err) console.error(`Error: ${err}`);
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

  const storageRepo = new SyncStorageRepository(chrome || browser);
  storageRepo.get(["darkMode"]).then((data) => {
    if (data.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  });
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

function loadFormList(curURL, userInfo, tabId) {
  const storageRepo = new SyncStorageRepository(chrome || browser)
  storageRepo.get(['hidesAccountId', 'showOnlyMatchingRoles', 'configStorageArea', 'signinEndpointInHere'])
  .then(data => {
    const hidesAccountId = data.hidesAccountId || false;
    const showOnlyMatchingRoles = data.showOnlyMatchingRoles || false;
    const configStorageArea = data.configStorageArea || 'sync';
    const signinEndpointInHere = data.signinEndpointInHere || false;

    new StorageRepository(chrome || browser, configStorageArea).get(['profiles', 'profiles_1', 'profiles_2', 'profiles_3', 'profiles_4'])
    .then(data => {
      if (data.profiles) {
        const dps = new DataProfilesSplitter();
        const profiles = dps.profilesFromDataSet(data);
        const profileSet = createProfileSet(profiles, userInfo, { showOnlyMatchingRoles });
        renderRoleList(profileSet.destProfiles, tabId, curURL, { hidesAccountId, signinEndpointInHere });
        setupRoleFilter();
      }
    })
  });
}

function renderRoleList(profiles, tabId, curURL, options) {
  const { url, region, isLocal } = getCurrentUrlandRegion(curURL)
  const listItemOnSelect = function(data) {
    if (options.signinEndpointInHere && isLocal) data.actionSubdomain = region;
    sendSwitchRole(tabId, data);
  }
  const list = document.getElementById('roleList');
  profiles.forEach(item => {
    const li = createRoleListItem(document, item, url, region, options, listItemOnSelect)
    list.appendChild(li);
  });
}

function setupRoleFilter() {
  const roleFilter = document.getElementById('roleFilter');

  let AWSR_firstAnchor = null;
  roleFilter.onkeyup = function(e) {
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

  roleFilter.focus()
}

function sendSwitchRole(tabId, data) {
  executeAction(tabId, 'switch', data).then(() => {
    let swcnt = localStorage.getItem('switchCount') || 0;
    localStorage.setItem('switchCount', ++swcnt);
    window.close()
  });
}

function getCurrentUrlandRegion(aURL) {
  const url = aURL.href;
  let region = '';
  const md = aURL.search.match(/region=([a-z\-1-9]+)/);
  if (md) region = md[1];

  let isLocal = false;
  const mdsd = aURL.host.match(/^(([a-z]{2}\-[a-z]+\-[1-9])\.)?console\.aws/);
  if (mdsd) {
    const [,, cr = 'us-east-1'] = mdsd;
    if (cr === region) isLocal = true;
  }

  return { url, region, isLocal }
}
