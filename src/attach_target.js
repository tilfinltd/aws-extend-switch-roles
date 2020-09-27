(function () {
  const menuAccount = document.getElementById('menu--account');
  const lis = Array.from(menuAccount.querySelectorAll("li")).slice(0, 4);
  const menuItems = lis.map(li => li ? li.innerHTML.replace(/<\/?[^>]+>/g, ' ').trim() : '');
  const isSwitched = document.querySelector('#menu--account input[data-testid="awsc-exit-role"]') != null;

  const divInfo = document.getElementById('AESR_info');
  const info = {
    isSwitched,
    menuItems,
    userName: ConsoleNavService.BuilderInstance.userName,
  }
  divInfo.dataset.content = JSON.stringify(info);

  const form = document.getElementById('AESR_form');
  form.csrf.value = AWSC.Auth.getMbtc();
})();
