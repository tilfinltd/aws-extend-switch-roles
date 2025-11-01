import { createRoleListItem } from './lib/create_role_list_item.js';
import { CurrentContext } from './lib/current_context.js';
import { findTargetProfiles } from './lib/target_profiles.js';
import { SessionMemory, SyncStorageRepository } from './lib/storage_repository.js';
import { remoteCallback } from './handlers/remote_connect.js';
import { writeProfileSetToTable } from './lib/profile_db.js';

const brw = chrome || browser;

const sessionMemory = new SessionMemory(brw);

function openOptions() {
  brw.runtime.openOptionsPage().catch(err => {
    console.error(`Error: ${err}`);
  });
}

function openPage(pageUrl) {
  const url = brw.runtime.getURL(pageUrl);
  return brw.tabs.create({ url }).catch(err => {
    console.error(`Error: ${err}`);
  });
}

async function getCurrentTab() {
  const [tab] = await brw.tabs.query({ currentWindow:true, active:true });
  return tab;
}

async function moveTabToOption(tabId) {
  const url = await brw.runtime.getURL('options.html');
  await brw.tabs.update(tabId, { url });
}

async function executeAction(tabId, action, data) {
  return brw.tabs.sendMessage(tabId, { action, data });
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

  const storageRepo = new SyncStorageRepository(brw);
  storageRepo.get(['visualMode', 'autoTabGrouping']).then(({ visualMode, autoTabGrouping }) => {
    const mode = visualMode || 'default';
    if (mode === 'dark' || (mode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('darkMode');
    }

    if (autoTabGrouping) {
      brw.runtime.sendMessage({ action: 'listenTabGroupsRemove' });
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
  const storageRepo = new SyncStorageRepository(brw);
  const data = await storageRepo.get(['hidesAccountId', 'showOnlyMatchingRoles', 'autoTabGrouping', 'signinEndpointInHere']);
  const { hidesAccountId = false, showOnlyMatchingRoles = false, autoTabGrouping = false, signinEndpointInHere = false } = data;

  const curCtx = new CurrentContext(userInfo, { showOnlyMatchingRoles });
  const profiles = await findTargetProfiles(curCtx);
  renderRoleList(profiles, tabId, curURL, userInfo.prism, { hidesAccountId, autoTabGrouping, signinEndpointInHere });
  setupRoleFilter();
}

function renderRoleList(profiles, tabId, curURL, isPrism, options) {
  const { url, region, isLocal } = getCurrentUrlandRegion(curURL)
  const listItemOnSelect = function(sender, data) {
    // disable link for loading
    sender.style.fontWeight = 'bold';
    sender.onclick = null;

    if (options.signinEndpointInHere && isLocal) data.actionSubdomain = region;
    if (isPrism) {
      if (options.autoTabGrouping) {
        data.tabGroup = { title: data.profile, color: data.color };
      }
      data.displayname = data.displayname.replace(/\s\s\|\s\s\d{12}$/, '');
    }
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

  let AWSR_selectedAnchor = null;
  let AWSR_currentSelectedIndex = -1; // Track current selection index among visible items
  
  // Get currently visible (filtered) role list items
  function getVisibleRoles() {
    return Array.from(document.querySelectorAll('#roleList > li')).filter(li => li.style.display !== 'none');
  }
  
  // Update visual selection and scroll into view
  function updateSelection(visibleRoles, newIndex) {
    // Clear previous selection
    visibleRoles.forEach(li => li.classList.remove('selected'));
    AWSR_selectedAnchor = null;
    
    // Set new selection if valid index
    if (newIndex >= 0 && newIndex < visibleRoles.length) {
      const selectedLi = visibleRoles[newIndex];
      selectedLi.classList.add('selected');
      AWSR_selectedAnchor = selectedLi.querySelector('a');
      AWSR_currentSelectedIndex = newIndex;
      
      // Scroll into view if needed
      selectedLi.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      AWSR_currentSelectedIndex = -1;
    }
  }
  
  // Handle arrow keys, Enter, and Escape
  roleFilter.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault(); // Prevent default behavior
      
      const visibleRoles = getVisibleRoles();
      
      if (e.key === 'ArrowDown') {
        const newIndex = AWSR_currentSelectedIndex < visibleRoles.length - 1 ? AWSR_currentSelectedIndex + 1 : AWSR_currentSelectedIndex;
        updateSelection(visibleRoles, newIndex);
      } else if (e.key === 'ArrowUp') {
        const newIndex = AWSR_currentSelectedIndex > 0 ? AWSR_currentSelectedIndex - 1 : 0;
        updateSelection(visibleRoles, newIndex);
      } else if (e.key === 'Enter') {
        if (AWSR_selectedAnchor) {
          AWSR_selectedAnchor.click();
        }
      } else if (e.key === 'Escape') {
        // Clear filter and close popup
        this.value = '';
        // Trigger filtering to show all roles
        this.dispatchEvent(new Event('keyup'));
        window.close();
      }
    }
  });
  
  // Handle text filtering (enhanced from existing logic)
  roleFilter.addEventListener('keyup', function(e) {
    // Skip if this was an arrow key or Enter (handled by keydown)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
      return;
    }
    
    const words = this.value.toLowerCase().split(' ');
    const lis = Array.from(document.querySelectorAll('#roleList > li'));
    let firstHitLi = null;
    
    lis.forEach(li => {
      const anchor = li.querySelector('a');
      const profileName = anchor.dataset.search;
      const hit = words.every(it => profileName.includes(it));
      li.style.display = hit ? 'block' : 'none';
      li.classList.remove('selected');
      if (hit && firstHitLi === null) firstHitLi = li;
    });
    
    // Reset selection and auto-select first visible item
    AWSR_currentSelectedIndex = -1;
    if (firstHitLi) {
      firstHitLi.classList.add('selected');
      AWSR_selectedAnchor = firstHitLi.querySelector('a');
      AWSR_currentSelectedIndex = 0;
    } else {
      AWSR_selectedAnchor = null;
    }
  });

  roleFilter.focus()
}

async function sendSwitchRole(tabId, data) {
  const { prism, url, signinHost } = await executeAction(tabId, 'switch', data);
  if (prism && !url) {
    showMessage("Switch failed: this session doesn't have permission to switch to target profile.", 'error');
    return;
  }

  const { switchCount } = await sessionMemory.get(['switchCount']);
  await sessionMemory.set({ switchCount: (switchCount || 0) + 1 });

  if (prism) {
    await brw.runtime.sendMessage({
      action: 'openTab',
      url,
      signinHost,
      tabGroup: data.tabGroup,
    });
  }

  window.close();
}

function getCurrentUrlandRegion(aURL) {
  const url = aURL.href;
  let region = '';
  const md = aURL.search.match(/region=([a-z\-1-9]+)/);
  if (md) region = md[1];

  let isLocal = false;
  const mdsd = aURL.host.match(/(([a-z]{2}\-[a-z-]+\-[1-9])\.)?console\.(aws|amazonaws)/);
  if (mdsd) {
    const [,, cr = 'us-east-1'] = mdsd;
    if (cr === region) isLocal = true;
  }

  return { url, region, isLocal }
}
