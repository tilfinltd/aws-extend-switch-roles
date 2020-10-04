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

function extractBackURL() {
  let swLink = document.querySelector('#menu--account *[data-testid="awsc-switch-roles"]');
  if (swLink) return new URL(swLink.href);

  swLink = document.getElementById('awsc-exit-role-form');
  if (swLink) return new URL(swLink.getAttribute('action'));

  swLink = document.getElementById('awsc-switch-role');
  if (swLink) return new URL(swLink.href);

  return null;
}

function appendAESR() {
  const form = document.createElement('form');
  form.id = 'AESR_form';
  form.method = 'POST';
  form.innerHTML = '<input type="hidden" name="mfaNeeded" value="0"><input type="hidden" name="action" value="switchFromBasis"><input type="hidden" name="src" value="nav"><input type="hidden" name="csrf"><input type="hidden" name="roleName"><input type="hidden" name="account"><input type="hidden" name="color"><input type="hidden" name="redirect_uri"><input type="hidden" name="displayName">';
  document.body.appendChild(form)

  const divInfo = document.createElement('div');
  divInfo.id = 'AESR_info';
  divInfo.style.display = 'none';
  divInfo.style.visibility = 'hidden';
  document.body.appendChild(divInfo);
}

if (document.body) {
  adjustDisplayNameColor();
  appendAESR();
}

(chrome || browser).runtime.onMessage.addListener(function(msg, sender, cb) {
  const { data, action } = msg;
  if (action === 'loadInfo') {
    if (!window.AESR_script) {
      window.AESR_script = document.createElement('script');
      AESR_script.src = chrome.extension.getURL('/js/attach_target.js');
      document.body.appendChild(AESR_script);
      setTimeout(() => {
        const infoJson = document.getElementById('AESR_info').dataset.content;
        cb(JSON.parse(infoJson));
      }, 50);
      return true;
    } else {
      const infoJson = document.getElementById('AESR_info').dataset.content;
      cb(JSON.parse(infoJson));
      return false;
    }
  } else if (action === 'switch') {
    const actionHost = extractBackURL().host;
    const form = document.getElementById('AESR_form');
    form.setAttribute('action', `https://${actionHost}/switchrole`);
    form.account.value = data.account;
    form.color.value = data.color;
    form.roleName.value = data.rolename;
    form.displayName.value = data.displayname;
    form.redirect_uri.value = data.redirecturi;
    form.submit();
    return false;
  }
});
