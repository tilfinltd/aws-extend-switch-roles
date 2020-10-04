(function () {
  const elById = id => document.getElementById(id);
  const trimTxtCtn = el => el ? el.textContent.trim() : '';

  const info = {};
  const accInfo = ConsoleNavService.AccountInfo;
  if (accInfo) {
    Object.assign(info, accInfo);
    info.isGlobal = document.querySelector('#menu--regions li a') == null;
  } else {
    Object.assign(info, {
      loginDisplayNameAccount: trimTxtCtn(elById('awsc-login-display-name-account')),
      loginDisplayNameUser: trimTxtCtn(elById('awsc-login-display-name-user')),
      roleDisplayNameAccount: trimTxtCtn(elById('awsc-role-display-name-account')),
      roleDisplayNameUser: trimTxtCtn(elById('awsc-role-display-name-user')),
      isGlobal: document.querySelector('#regionMenuContent a') == null,
    })
  }

  elById('AESR_info').dataset.content = JSON.stringify(info);

  elById('AESR_form').csrf.value = AWSC.Auth.getMbtc();
})();
