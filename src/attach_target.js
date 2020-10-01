(function () {
  const elById = id => document.getElementById(id);
  const elTextContent = elId => typeof(elById(elId))!="undefined" ? elById(elId).textContent : null;

  const info = { userName: ConsoleNavService.BuilderInstance.userName };
  const accInfo = ConsoleNavService.AccountInfo;
  if (accInfo) {
    Object.assign(info, accInfo);
    info.isSwitched = accInfo.roleDisplayNameUser !== undefined;
  } else {
    Object.assign(info, {
      loginDisplayNameAccount: elTextContent('awsc-login-display-name-account'),
      loginDisplayNameUser: elTextContent('awsc-login-display-name-user'),
      roleDisplayNameAccount: elTextContent('awsc-role-display-name-account'),
      roleDisplayNameUser: elTextContent('awsc-role-display-name-user'),
      isSwitched: elById('awsc-exit-role-form') != null,
    })
  }

  elById('AESR_info').dataset.content = JSON.stringify(info);

  elById('AESR_form').csrf.value = AWSC.Auth.getMbtc();
})();
