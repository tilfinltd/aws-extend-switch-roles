import { createRoleListItem } from './lib/create_role_list_item.js';
import { CurrentContext } from './lib/current_context.js';
import { findTargetProfiles } from './lib/target_profiles.js';
import { SessionMemory, SyncStorageRepository } from './lib/storage_repository.js';

const sessionMemory = new SessionMemory(chrome || browser);

function openOptions() {
  (chrome || browser).runtime.openOptionsPage().catch(err => {
    console.error(`Error: ${err}`);
  });
}

function openPage(pageUrl) {
  const brw = chrome || browser;
  const url = brw.runtime.getURL(pageUrl);
  brw.tabs.create({ url }).catch(err => {
    console.error(`Error: ${err}`);
  });
}

async function getCurrentTab() {
  const brw = chrome || browser;
  const [tab] = await brw.tabs.query({ currentWindow:true, active:true });
  return tab;
}

async function executeAction(tabId, action, data) {
  return (chrome || browser).tabs.sendMessage(tabId, { action, data });
}

window.onload = function() {
  const MANY_SWITCH_COUNT = 4;

  document.getElementById('openOptionsLink').onclick = function(e) {
    openOptions();
    return false;
  }

  document.getElementById('openUpdateNoticeLink').onclick = function(e) {
    openPage('updated.html');
    return false;
  }

  document.getElementById('openCreditsLink').onclick = function(e) {
    openPage('credits.html');
    return false;
  }

  document.getElementById('openSupportersLink').onclick = document.getElementById('openSupportMe').onclick = function(e) {
    openPage('supporters.html');
    return false;
  }

  const storageRepo = new SyncStorageRepository(chrome || browser);
  storageRepo.get(['visualMode']).then(({ visualMode }) => {
    const mode = visualMode || 'default';
    if (mode === 'dark' || (mode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('darkMode');
    }
  });

  sessionMemory.get(['hasGoldenKey', 'switchCount'])
    .then(({ hasGoldenKey, switchCount }) => {
      if (hasGoldenKey || false) {
        document.getElementById('goldenkey').style.display = 'block';
      } else if ((switchCount || 0) > MANY_SWITCH_COUNT) {
        document.getElementById('supportComment').style.display = 'block';
      }
      main();
    })
}

function main() {
  getCurrentTab()
    .then(tab => {
      if (!tab.url) return;

      const url = new URL(tab.url)
      if (url.host.endsWith('.aws.amazon.com')
       || url.host.endsWith('.amazonaws-us-gov.com')
       || url.host.endsWith('.amazonaws.cn')) {
        executeAction(tab.id, 'loadInfo', {}).then(userInfo => {
          if (userInfo) {
            document.getElementById('main').style.display = 'block';
            return loadFormList(url, userInfo, tab.id);
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
        noMain.style.display = 'block';
      }
    })
}

async function loadFormList(curURL, userInfo, tabId) {
  const storageRepo = new SyncStorageRepository(chrome || browser);
  const data = await storageRepo.get(['hidesAccountId', 'showOnlyMatchingRoles', 'signinEndpointInHere']);
  const { hidesAccountId = false, showOnlyMatchingRoles = false, signinEndpointInHere = false } = data;

  const curCtx = new CurrentContext(userInfo, { showOnlyMatchingRoles });
  const profiles = await findTargetProfiles(curCtx);
  renderRoleList(profiles, tabId, curURL, { hidesAccountId, signinEndpointInHere });
  setupRoleFilter();
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
        li.classList.remove('selected')
        if (hit && firstHitLi === null) firstHitLi = li;
      });

      if (firstHitLi) {
        firstHitLi.classList.add('selected');
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
    sessionMemory.get(['switchCount']).then(({ switchCount }) => {
      let swcnt = switchCount || 0;
      return sessionMemory.set({ switchCount: ++swcnt });
    }).then(() => {
      window.close()
    })
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
