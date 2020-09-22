(function () {
  const menuAccount = document.getElementById('menu--account');
  let lis;
  if (menuAccount) {
    lis = Array.from(menuAccount.querySelectorAll("li")).slice(0, 4);
  } else {
    // old UI
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

  const form = document.getElementById('AESR_form');
  form.csrf.value = AWSC.Auth.getMbtc();
})();
