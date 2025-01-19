import { createRoleListItem } from './lib/create_role_list_item.js';
import { CurrentContext } from './lib/current_context.js';
import { findTargetProfiles } from './lib/target_profiles.js';
import { SessionMemory, SyncStorageRepository } from './lib/storage_repository.js';
import { remoteCallback } from './handlers/remote_connect.js';
import { writeProfileSetToTable } from './lib/profile_db.js';

const sessionMemory = new SessionMemory(chrome || browser);

function openOptions() {
  (chrome || browser).runtime.openOptionsPage().catch(err => {
    console.error(`Error: ${err}`);
  });
}

function createTab(url) {
  return (chrome || browser).tabs.create({ url }).catch(err => {
    console.error(`Error: ${err}`);
  });
}

function openPage(pageUrl) {
  const url = (chrome || browser).runtime.getURL(pageUrl);
  return createTab(url);
}

async function getCurrentTab() {
  const brw = chrome || browser;
  const [tab] = await brw.tabs.query({ currentWindow:true, active:true });
  return tab;
}

async function moveTabToOption(tabId) {
  const brw = chrome || browser;
  const url = await brw.runtime.getURL('options.html');
  await brw.tabs.update(tabId, { url });
}

async function executeAction(tabId, action, data) {
  return (chrome || browser).tabs.sendMessage(tabId, { action, data });
}

let mainEl, noMainEl;

function showMessage(msg, level = 'info') {
  const p = noMainEl.querySelector('p');
  p.textContent = msg;
  if (level === 'error') p.style.color = '#d11';
  noMainEl.style.display = 'block';
  mainEl.style.display = 'none';
}

window.onload = function() {
  mainEl = document.getElementById('main');
  noMainEl = document.getElementById('noMain');

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
  storageRepo.get(['visualMode', 'autoTabGrouping']).then(({ visualMode, autoTabGrouping }) => {
    const mode = visualMode || 'default';
    if (mode === 'dark' || (mode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('darkMode');
    }

    if (autoTabGrouping) {
      chrome.runtime.sendMessage({ action: 'listenTabGroupsRemove' });
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
            mainEl.style.display = 'block';
            return loadFormList(url, userInfo, tab.id);
          } else {
            showMessage('Failed to fetch user info from the AWS Management Console page', 'error');
          }
        })
      } else if (url.host.endsWith('.aesr.dev') && url.pathname.startsWith('/callback')) {
        remoteCallback(url)
        .then(userCfg => {
          showMessage("Successfully connected to AESR Config Hub!");
          return writeProfileSetToTable(userCfg.profile);
        })
        .then(() => moveTabToOption(tab.id))
        .catch(err => {
          showMessage(`Failed to connect to AESR Config Hub because.\n${err.message}`, 'error');
        });
      } else {
        showMessage("You'll see the role list here when the current tab is AWS Management Console page.");
      }
    })
}

async function loadFormList(curURL, userInfo, tabId) {
  const storageRepo = new SyncStorageRepository(chrome || browser);
  const data = await storageRepo.get(['hidesAccountId', 'showOnlyMatchingRoles', 'autoTabGrouping', 'signinEndpointInHere']);
  const { hidesAccountId = false, showOnlyMatchingRoles = false, autoTabGrouping = false, signinEndpointInHere = false } = data;

  const curCtx = new CurrentContext(userInfo, { showOnlyMatchingRoles });
  const profiles = await findTargetProfiles(curCtx);
  renderRoleList(profiles, tabId, curURL, userInfo.prismMode, { hidesAccountId, autoTabGrouping, signinEndpointInHere });
  setupRoleFilter();
}

function renderRoleList(profiles, tabId, curURL, prismMode, options) {
  const { url, region, isLocal } = getCurrentUrlandRegion(curURL)
  const listItemOnSelect = function(sender, data) {
    // disable link for loading
    sender.style.fontWeight = 'bold';
    sender.onclick = null;

    if (options.signinEndpointInHere && isLocal) data.actionSubdomain = region;
    if (prismMode) {
      if (options.autoTabGrouping) {
        data.tabGroup = { title: data.profile, color: data.color };
      }
      data.displayname = data.displayname.replace(/\s\s\|\s\s\d{12}$/, '');
    }
    sendSwitchRole(tabId, data).catch(err => {
      console.error(`Error: ${err}`);
    })
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

async function sendSwitchRole(tabId, data) {
  const url = await executeAction(tabId, 'switch', data);
  if (!url) {
    showMessage("Switch failed: this session doesn't have permission to switch to target profile.", 'error');
    return;
  }

  const tab = await createTab(url);
  if (data.tabGroup && chrome.tabGroups) {
    const { title, color } = data.tabGroup;
    const groups = await chrome.tabGroups.query({ title });
    if (groups.length) {
      await chrome.tabs.group({ groupId: groups[0].id, tabIds: tab.id });
    } else {
      const uRL = new URL(url);
      const params = new URLSearchParams(uRL.search);
      const newGroupId = await chrome.tabs.group({ tabIds: tab.id });

      await chrome.runtime.sendMessage({
        action: 'registerTabGroup',
        endpoint: 'https://' + params.get('region') + '.signin.aws.amazon.com',
        sessionId: params.get('login_hint'),
        tabGroupId: newGroupId,
        title,
        color,
      });
    }
  }

  const { switchCount } = await sessionMemory.get(['switchCount']);
  let swcnt = switchCount || 0;
  await sessionMemory.set({ switchCount: ++swcnt });
  window.close();
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
