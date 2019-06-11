class AutoAssumeLastRole {
  constructor() {
    this.enabled = false;
  }

  execute(targetIdRole, list) {
    if (!this.enabled || this.hasAssumedRole() || !targetIdRole) return;

    const event = document.createEvent('MouseEvents');
    event.initEvent('click', false, true);
    elById('nav-usernameMenu').dispatchEvent(event);

    setTimeout(() => {
      for (let form of list.querySelectorAll('form')) {
        const val = `${form.account.value}_${form.roleName.value}`;
        if (targetIdRole === val) {
          form.querySelector('input[type="submit"]').click();
          break;
        }        
      }
    }, 0);
  }

  save(profile) {
    if (!this.enabled) return;
    const lastRoleKey = this.createKey();
    const value = `${profile.aws_account_id}_${profile.role_name}`;
    chrome.storage.sync.set({ [lastRoleKey]: value }, function() {
      console.log(`Saved lastRole to '${lastRoleKey}' as '${value}'`);
    });
  }

  clear() {
    if (!this.enabled) return;
    const lastRoleKey = this.createKey();
    chrome.storage.sync.remove(lastRoleKey, function() {
      console.log(`Cleared lastRole '${lastRoleKey}'`);
    });
  }

  createKey() {
    const accountId = getAccountId('awsc-login-display-name-account');
    const user = elById('awsc-login-display-name-user').textContent.trim().replace(/(.*)\/.*/, '$1');
    return `lastRole_${accountId}_${user}`;
  }

  hasAssumedRole() {
    const usernameMenu = elById('nav-usernameMenu');
    return usernameMenu.classList.contains('awsc-has-switched-role');
  }
}
