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

function valueFromItem(liTxt) {
  try {
    const r = liTxt.match(/(\d{4})\-(\d{4})\-(\d{4})/);
    if (r) {
      return r[1] + r[2] + r[3];
    } else {
      return liTxt.split(/\s+/).pop()
    }
  } catch (err) {
    return null
  }
}

window.onload = function() {
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
          loadFormList(url, userInfo, tab.id);
          document.querySelector('main').style.display = 'block';
        });
      }
    })
}

function loadFormList(currentUrl, userInfo, tabId) {
  chrome.storage.sync.get([
    'profiles', 'profiles_1', 'profiles_2', 'profiles_3', 'profiles_4',
    'hidesAccountId', 'showOnlyMatchingRoles',
  ], function(data) {
    const hidesAccountId = data.hidesAccountId || false;
    const showOnlyMatchingRoles = data.showOnlyMatchingRoles || false;

    if (data.profiles) {
      const dps = new DataProfilesSplitter();
      const profiles = dps.profilesFromDataSet(data);
      const {
        isSwitched, userName, 
        loginDisplayNameAccount, loginDisplayNameUser,
        roleDisplayNameAccount, roleDisplayNameUser
      } = userInfo;

      const user = parseUserName(userName);

      const opts = {
        list: document.getElementById('roleList'),
        loggedIn: valueFromItem(loginDisplayNameUser),
        baseAccount: valueFromItem(loginDisplayNameAccount),
        targetRole: valueFromItem(roleDisplayNameUser),
        targetAccount: valueFromItem(roleDisplayNameAccount),
        currentUrl,
        roleFederated: user.roleFederated,
      }
      const profileSet = new ProfileSet(profiles, showOnlyMatchingRoles,  opts);
      loadProfiles(profileSet, tabId, opts, hidesAccountId);
    }
  });
}

function loadProfiles(profileSet, tabId, { list, currentUrl }, hidesAccountId) {
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
    anchor.dataset.redirecturi = replaceRedirectURI(currentUrl, item.region);
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

function parseUserName(userName) {
  const parts = userName.split('/', 2);
  let roleFederated = null;
  if (parts.length > 1) {
    roleFederated = parts.shift();
  }

  const [user, account] = parts.shift().split(' @ ')
  return { roleFederated, user, account }
}

function replaceRedirectURI(targetUrl, destRegion) {
  if (!destRegion) return targetUrl;

  let redirectUri = decodeURIComponent(targetUrl);
  const md = redirectUri.match(/region=([a-z\-1-9]+)/);
  if (md) {
    const currentRegion = md[1];
    if (currentRegion !== destRegion) {
      redirectUri = redirectUri.replace(new RegExp(currentRegion, 'g'), destRegion);
      if (currentRegion === 'us-east-1') {
        redirectUri = redirectUri.replace('://', `://${destRegion}.`);
      } else if (destRegion === 'us-east-1') {
        redirectUri = redirectUri.replace(/:\/\/[^.]+\./, '://');
      }
    }
    redirectUri = encodeURIComponent(redirectUri);
  }
  return redirectUri;
}

function sendSwitchRole(tabId, data) {
  executeAction(tabId, 'switch', data).then(() => {
    window.close()
  });
}
