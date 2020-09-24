const autoAssumeLastRole = new AutoAssumeLastRole();

function extendIAMFormList() {
  const lastRoleKey = autoAssumeLastRole.createKey();

  chrome.storage.sync.get([
    'profiles', 'profiles_1', 'profiles_2', 'profiles_3', 'profiles_4',
    'hidesAccountId', 'showOnlyMatchingRoles',
    'autoAssumeLastRole', lastRoleKey
  ], function(data) {
    var hidesAccountId = data.hidesAccountId || false;
    var showOnlyMatchingRoles = data.showOnlyMatchingRoles || false;
    autoAssumeLastRole.enabled = data.autoAssumeLastRole || false;

    if (data.profiles) {
      const dps = new DataProfilesSplitter();
      const profiles = dps.profilesFromDataSet(data);

      loadProfiles(new ProfileSet(profiles, showOnlyMatchingRoles), list);
    }
    // console.log("Last role from '"+vlastRoleKey+"' was '"+lastRole+"'");
    autoAssumeLastRole.execute(data[lastRoleKey], list);
  });
}

function hookBeforeSwitch(form, profile) {
  autoAssumeLastRole.save(profile);
  return true;
}

function hookBeforeExit() {
  autoAssumeLastRole.clear();
  return true;
}

function loadProfiles(profileSet, list) {
  var recentNames = [];

  Array.from(list.querySelectorAll('form')).forEach(form => {
    form.onsubmit = function(e) {
      const destProfileName = this.dataset.aesrProfile;
      const foundProfile = profileSet.destProfiles.find(item => item.profile === destProfileName);
      return foundProfile ? hookBeforeSwitch(this, foundProfile) : true;
    }
  });

  const exitRoleForm = elById('awsc-exit-role-form');
  if (exitRoleForm) {
    exitRoleForm.addEventListener('submit', () => {
      hookBeforeExit(this);
    });
  }
}
