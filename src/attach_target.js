(function () {
  const menuAccount = document.getElementById("menu--account");
  let lis;
  if (menuAccount) {
    lis = Array.from(menuAccount.querySelectorAll("li")).slice(0, 4);
  } else {
    lis = [
      document.getElementById('awsc-login-display-name-user'),
      document.getElementById('awsc-login-display-name-account'),
      document.getElementById('awsc-role-display-name-user'),
      document.getElementById('awsc-role-display-name-account'),
    ]
  }
  const menuItems = lis.map(li => li ? li.innerHTML.replace(/<\/?[^>]+>/g, ' ').trim() : '');

  const div = document.createElement('div');
  div.id = 'AESR_info';
  div.style.display = 'none';
  const info = {
    menuItems,
    userName: ConsoleNavService.BuilderInstance.userName,
  }
  div.textContent = JSON.stringify(info);
  document.body.appendChild(div);

  let switchLink;
  if (menuAccount) {
    switchLink = menuAccount.querySelector('*[data-testid="awsc-switch-roles"]');
  } else {
    switchLink = document.getElementById('awsc-switch-role');
  }
  const actionHost = new URL(switchLink.href).host;

  const form = document.createElement('form');
  form.id = 'AESR_form';
  form.method = 'POST';
  form.action = `https://${actionHost}/switchrole`;
  form.innerHTML = '<input type="hidden" name="mfaNeeded" value="0"><input type="hidden" name="action" value="switchFromBasis"><input type="hidden" name="src" value="nav"><input type="hidden" name="csrf"><input type="hidden" name="roleName"><input type="hidden" name="account"><input type="hidden" name="color"><input type="hidden" name="redirect_uri"><input type="hidden" name="displayName">';
  form.csrf.value = AWSC.Auth.getMbtc();
  form.onsubmit = function (e) {
    replaceRedirectURI(this, this.dataset.region)
  }
  document.body.appendChild(form)
})();
