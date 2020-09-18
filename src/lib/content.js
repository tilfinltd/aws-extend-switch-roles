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
      attachColorLine(profiles);
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

function attachColorLine(profiles) {
  var usernameMenu = elById('nav-usernameMenu');
  if (usernameMenu.classList.contains('awsc-has-switched-role')) {
    var profileName = usernameMenu.textContent.trim().split(/\s+\|\s+/)[0];

    usernameMenu.style = 'white-space:pre';

    const found = profiles.find(item => { return item.profile === profileName });
    const color = found && found.color || null;

    var label = usernameMenu.querySelector('.nav-elt-label');
    if (found && found.image) {
      label.insertAdjacentHTML('beforebegin', Sanitizer.escapeHTML`<img id="AESW_Image" src=${found.image.replace(/"/g, '')} style="float: left; padding-right: .66em; width: 1.33em; height: 1.33em">`);
    }

    if (color) {
      if (needsInvertForeColorByBack(color)) {
        label.style = 'color: #eee';
      }

      var menubar = elById('nav-menubar');
      var barDiv = document.createElement('div');
      barDiv.id = 'AESW_ColorLine';
      barDiv.style = 'position:absolute;top:39px;width:100%;height:3px;z-index:0;background-color:#' + color;
      menubar.appendChild(barDiv);
    }
  }
}

function needsInvertForeColorByBack(color) {
  var r = color.substr(0, 2),
      g = color.substr(2, 2),
      b = color.substr(4, 2);

  r = parseInt(r, 16);
  g = parseInt(g, 16);
  b = parseInt(b, 16);

  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}
