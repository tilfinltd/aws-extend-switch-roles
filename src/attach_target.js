(function () {
  const menuAccount = document.getElementById('menu--account');
  const lis = Array.from(menuAccount.querySelectorAll("li")).slice(0, 4);
  const menuItems = lis.map(li => li ? li.innerHTML.replace(/<\/?[^>]+>/g, ' ').trim() : '');
  const isSwitched = document.querySelector('#menu--account input[data-testid="awsc-exit-role"]') != null;

  const div = document.createElement('div');
  div.id = 'AESR_info';
  div.style.display = 'none';
  const info = {
    isSwitched,
    menuItems,
    userName: ConsoleNavService.BuilderInstance.userName,
  }
  div.textContent = JSON.stringify(info);
  document.body.appendChild(div);

  const form = document.getElementById('AESR_form');
  form.csrf.value = AWSC.Auth.getMbtc();
})();
