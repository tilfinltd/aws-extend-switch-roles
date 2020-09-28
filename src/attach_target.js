(function () {
  const elById = id => document.getElementById(id);

  const info = { userName: ConsoleNavService.BuilderInstance.userName };
  const accInfo = ConsoleNavService.AccountInfo;
  if (accInfo) {
    Object.assign(info, accInfo);
    info.isSwitched = accInfo.roleDisplayNameUser !== undefined;
  } else {
    Object.assign(info, {
      loginDisplayNameAccount: elById('awsc-login-display-name-account')?.textContent,
      loginDisplayNameUser: elById('awsc-login-display-name-user')?.textContent,
      roleDisplayNameAccount: elById('awsc-role-display-name-account')?.textContent,
      roleDisplayNameUser: elById('awsc-role-display-name-user')?.textContent,
      isSwitched: elById('awsc-exit-role-form') != null,
    })
  }

  elById('AESR_info').dataset.content = JSON.stringify(info);

  elById('AESR_form').csrf.value = AWSC.Auth.getMbtc();
})();
