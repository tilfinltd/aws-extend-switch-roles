function needsInvertForeColorByBack(color) {
  let r, g, b;
  const md = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (md) {
    r = parseInt(md[1], 10);
    g = parseInt(md[2], 10);
    b = parseInt(md[3], 10);
  } else {
    r = parseInt(color.substr(0, 2), 16);
    g = parseInt(color.substr(2, 2), 16);
    b = parseInt(color.substr(4, 2), 16);
  }
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

function adjustDisplayNameColor() {
  let menuBtn = document.querySelector('span[data-testid="account-menu-button__background"]');
  if (!menuBtn) {
    menuBtn = document.querySelector('#nav-usernameMenu .awsc-switched-role-username-wrapper');
  }
  if (menuBtn) {
    const bgColor = menuBtn.style.backgroundColor;
    if (bgColor && needsInvertForeColorByBack(bgColor)) {
      menuBtn.parentElement.style = 'color: #f9f9f9';
    }
  }
}

function appendAESR() {
  const form = document.createElement('form');
  form.id = 'AESR_form';
  form.method = 'POST';
  form.target = '_top';
  form.innerHTML = '<input type="hidden" name="mfaNeeded" value="0"><input type="hidden" name="action" value="switchFromBasis"><input type="hidden" name="src" value="nav"><input type="hidden" name="csrf"><input type="hidden" name="roleName"><input type="hidden" name="account"><input type="hidden" name="color"><input type="hidden" name="redirect_uri"><input type="hidden" name="displayName">';
  document.body.appendChild(form)

  const divInfo = document.createElement('div');
  divInfo.id = 'AESR_info';
  divInfo.style.display = 'none';
  divInfo.style.visibility = 'hidden';
  document.body.appendChild(divInfo);

  const divResult = document.createElement('div');
  divResult.id = 'AESR_result';
  divResult.style.display = 'none';
  divResult.style.visibility = 'hidden';
  document.body.appendChild(divResult);
}

function getSessionData() {
  const metaASD = document.querySelector('meta[name="awsc-session-data"]');
  let sessData = null;
  if (metaASD) {
    try {
      sessData = JSON.parse(metaASD.getAttribute('content'));
    } catch (e) {}
  }
  return sessData;
}

let prismModeEnabled = false;
let accountInfo = null;
function loadInfo(cb) {
  if (accountInfo) {
    cb(accountInfo);
    return false;
  }

  const sessData = getSessionData();
  if (sessData.prismModeEnabled) {
    prismModeEnabled = true;
  }

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('/js/war/attach_target.js');
  script.onload = function() {
    const json = document.getElementById('AESR_info').dataset.content;
    accountInfo = JSON.parse(json);
    if (prismModeEnabled) {
      if (!accountInfo.loginDisplayNameAccount) {
        accountInfo.loginDisplayNameAccount = accountInfo.roleDisplayNameAccount;
        accountInfo.loginDisplayNameUser = accountInfo.roleDisplayNameUser;
      }
    }
    accountInfo.prismMode = prismModeEnabled;
    cb(accountInfo);
    this.remove();
  };
  document.body.appendChild(script);
  return true;
}

function getPrismSwitchUrl(cb) {
  const NONE = 'NONE';
  document.getElementById('AESR_result').dataset.content = NONE;
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('/js/war/prism_switch_dest.js');
  script.onload = function() {
    const checkResult = () => {
      const url = document.getElementById('AESR_result').dataset.content;
      if (url !== NONE) {
        cb(url === 'null' ? null : url);
        this.remove();
        return;
      }
      setTimeout(checkResult, 150);
    };
    setTimeout(checkResult, 150);
  };
  document.body.appendChild(script);
  return true;
}

function setupMessageListener(metaASE) {
  (chrome || browser).runtime.onMessage.addListener(function(msg, sender, cb) {
    const { data, action } = msg;
    if (action === 'loadInfo') {
      return loadInfo(cb);
    } else if (action === 'switch') {
      let actionHost = metaASE.getAttribute('content');
      const { actionSubdomain } = data;
      if (actionSubdomain && actionHost === 'signin.aws.amazon.com') {
        actionHost = actionSubdomain + '.' + actionHost;
      }
      const form = document.getElementById('AESR_form');
      form.setAttribute('action', `https://${actionHost}/switchrole`);
      form.account.value = data.account;
      form.color.value = data.color;
      form.roleName.value = data.rolename;
      form.displayName.value = data.displayname;
      form.redirect_uri.value = data.redirecturi;

      if (prismModeEnabled) {
        return getPrismSwitchUrl(cb);
      } else {
        cb(null);
        form.submit();
        return false;
      }
    }
  })
}

if (document.body) {
  const metaASE = document.getElementById('awsc-signin-endpoint');
  if (metaASE) {
    appendAESR();
    setupMessageListener(metaASE);
    setTimeout(() => {
      adjustDisplayNameColor();
    }, 1000);
  }
}
