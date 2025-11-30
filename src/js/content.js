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

function adjustPrismDisplayNameColor() {
  try {
    const navUM = document.getElementById("nav-usernameMenu");
    const spanEl = Array.from(navUM.querySelectorAll("div > span")).at(-1);
    const frColor = window.getComputedStyle(spanEl).color;
    if (frColor && needsInvertForeColorByBack(frColor)) {
      spanEl.style.backgroundColor = "#bbbbbb";
    }
  } catch {}
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

  const inputResult = document.createElement('input');
  inputResult.type = 'hidden';
  inputResult.id = 'AESR_result';
  inputResult.style.display = 'none';
  inputResult.style.visibility = 'hidden';
  document.body.appendChild(inputResult);
}

function getMetaData() {
  const result = { prismModeEnabled: false };

  const asd = document.querySelector('meta[name="awsc-session-data"]');
  if (asd) {
    try {
      const json = asd.getAttribute('content');
      Object.assign(result, JSON.parse(json));
    } catch (e) {}
  }

  if (!result.signInEndpoint) {
    result.signInEndpoint = (() => {
      const ase = document.getElementById('awsc-signin-endpoint');
      if (ase) return ase.getAttribute("content");

      const ir = result.infrastructureRegion;
      if (ir) {
        if (ir.startsWith("us-gov-")) return "signin.amazonaws-us-gov.com";
        else if (ir.startsWith("cn-"))  return "signin.amazonaws.cn";
      }

      return "signin.aws.amazon.com";
    })();
  }

  return result;
}

const brw = (chrome || browser);
let session = null;
let accountInfo = null;

function loadInfo(cb) {
  if (accountInfo) {
    cb(accountInfo);
    return false;
  }

  const script = document.createElement('script');
  script.src = brw.runtime.getURL('/js/war/attach_target.js');
  script.onload = function() {
    try {
      const json = document.getElementById('AESR_info').dataset.content;
      accountInfo = JSON.parse(json);
      accountInfo.prism = session.prismModeEnabled;
    } catch {}
    cb(accountInfo);
    this.remove();
  };
  document.body.appendChild(script);
  return true;
}

function getPrismSwitchUrl(cb) {
  const script = document.createElement('script');
  script.src = brw.runtime.getURL('/js/war/prism_switch_dest.js');

  const aesrResult = document.getElementById('AESR_result');
  function aesrResultOnChange() {
    aesrResult.removeEventListener('change', aesrResultOnChange);
    script.remove();
    const url = this.value;
    this.value = '';
    cb(url);
  }
  aesrResult.addEventListener('change', aesrResultOnChange);

  document.body.appendChild(script);
  return true;
}

function doSwitch(data, cb) {
  const formActionUrl = (() => {
    if (session.prismModeEnabled) {
      return `https://${session.signInEndpoint}/sessions/${session.sessionDifferentiator}/v1/switchrole`;
    } else {
      let actionHost = session.signInEndpoint;
      const { actionSubdomain } = data;
      if (actionSubdomain) {
        if (
          actionHost === "signin.aws.amazon.com" ||
          actionHost === "signin.amazonaws-us-gov.com" ||
          actionHost === "signin.amazonaws.cn"
        ) {
          actionHost = actionSubdomain + "." + actionHost;
        } else if (
          actionHost.endsWith(".signin.aws.amazon.com") ||
          actionHost.endsWith(".signin.amazonaws-us-gov.com") ||
          actionHost.endsWith(".signin.amazonaws.cn")
        ) {
          actionHost = actionHost.replace(/^[^\.]+/, actionSubdomain);
        }
      }
      return `https://${actionHost}/switchrole`;
    }
  })();

  const form = document.getElementById('AESR_form');
  form.setAttribute('action', formActionUrl);
  form.account.value = data.account;
  form.color.value = data.color;
  form.roleName.value = data.rolename;
  form.displayName.value = data.displayname;

  if (session.prismModeEnabled) {
    form.redirect_uri.value = data.redirecturi.replace(`${session.sessionDifferentiator}.`, "")
    getPrismSwitchUrl(url => {
      cb({ prism: true, url, signinHost: session.signInEndpoint });
    });
    return true;
  } else {
    form.redirect_uri.value = data.redirecturi;
    cb({ prism: false });
    form.submit();
    return false;
  }
}

function setupMessageListener() {
  brw.runtime.onMessage.addListener(function(msg, sender, cb) {
    const { data, action } = msg;
    if (action === 'loadInfo') {
      return loadInfo(cb);
    } else if (action === 'switch') {
      return doSwitch(data, cb);
    }
  })
}

function isMainFrame(body) {
  if (!body) return false;
  return Array.from(body.children).some(el => el.localName !== 'script');
}

if (isMainFrame(document.body)) {
  session = getMetaData();
  appendAESR();
  setupMessageListener();

  setTimeout(() => {
    session.prismModeEnabled ? adjustPrismDisplayNameColor() : adjustDisplayNameColor();
  }, 1000);
}
