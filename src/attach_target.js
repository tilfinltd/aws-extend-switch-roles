(function () {
  const elById = id => document.getElementById(id);
  const trimTxtCtn = el => el ? el.textContent.trim() : '';

  const info = {};
  const accInfo = ConsoleNavService.AccountInfo;
  if (accInfo) {
    Object.assign(info, accInfo);
  } else {
    Object.assign(info, {
      loginDisplayNameAccount: trimTxtCtn(elById('awsc-login-display-name-account')),
      loginDisplayNameUser: trimTxtCtn(('awsc-login-display-name-user')),
      roleDisplayNameAccount: trimTxtCtn(('awsc-role-display-name-account')),
      roleDisplayNameUser: trimTxtCtn(('awsc-role-display-name-user')),
    })
  }

  elById('AESR_info').dataset.content = JSON.stringify(info);

  elById('AESR_form').csrf.value = AWSC.Auth.getMbtc();
})();
