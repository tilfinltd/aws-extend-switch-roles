const autoAssumeLastRole = new AutoAssumeLastRole();

function extendIAMFormList() {
  var csrf, list = elById('awsc-username-menu-recent-roles');
  if (list) {
    var firstForm = list.querySelector('#awsc-recent-role-0 form');
    csrf = firstForm['csrf'].value;
  } else {
    list = generateEmptyRoleList();
    csrf = '';
  }

  const lastRoleKey = autoAssumeLastRole.createKey();

  chrome.storage.sync.get([
    'profiles', 'profiles_1', 'profiles_2', 'profiles_3', 'profiles_4',
    'hidesHistory', 'hidesAccountId', 'showOnlyMatchingRoles',
    'autoAssumeLastRole', lastRoleKey
  ], function(data) {
    var hidesHistory = data.hidesHistory || false;
    var hidesAccountId = data.hidesAccountId || false;
    var showOnlyMatchingRoles = data.showOnlyMatchingRoles || false;
    autoAssumeLastRole.enabled = data.autoAssumeLastRole || false;

    if (data.profiles) {
      const dps = new DataProfilesSplitter();
      const profiles = dps.profilesFromDataSet(data);

      loadProfiles(new Profile(profiles, showOnlyMatchingRoles), list, csrf, hidesHistory, hidesAccountId);
      attachColorLine(profiles);
    }
    // console.log("Last role from '"+vlastRoleKey+"' was '"+lastRole+"'");
    autoAssumeLastRole.execute(data[lastRoleKey], list);
  });
}

function generateEmptyRoleList() {
  var divLbl = document.createElement('div');
  divLbl.id = 'awsc-recent-roles-label';
  divLbl.textContent = 'Role List:';
  var ul = document.createElement('ul');
  ul.id = 'awsc-username-menu-recent-roles';

  var parentEl = elById('awsc-login-account-section');
  parentEl.appendChild(divLbl);
  parentEl.appendChild(ul);

  var script = document.createElement('script');
  script.src = chrome.extension.getURL('/js/csrf-setter.js');
  parentEl.appendChild(script);
  return ul;
}

function replaceRedirectURI(form, profile) {
  if (!profile.region) return false;

  const destRegion = profile.region;
  var redirectUri = decodeURIComponent(form.redirect_uri.value);
  const md = redirectUri.match(/region=([a-z\-1-9]+)/);
  if (md) {
    const currentRegion = md[1];
    if (currentRegion !== destRegion) {
      redirectUri = redirectUri.replace(new RegExp(currentRegion, 'g'), destRegion);
      if (currentRegion === 'us-east-1') {
        redirectUri = redirectUri.replace('://', `://${destRegion}.`);
      } else if (destRegion === 'us-east-1') {
        redirectUri = redirectUri.replace(/:\/\/[^.]+\./, '://');
      }
    }
    form.redirect_uri.value = encodeURIComponent(redirectUri);
  }  
}

function hookBeforeSwitch(form, profile) {
  replaceRedirectURI(form, profile);
  autoAssumeLastRole.save(profile);
  return true;
}

function hookBeforeExit() {
  autoAssumeLastRole.clear();
  return true;
}

function loadProfiles(profile, list, csrf, hidesHistory, hidesAccountId) {
  var recentNames = [];

  if (hidesHistory) {
    var fc = list.firstChild;
    while (fc) {
      list.removeChild(fc);
      fc = list.firstChild;
    }

    var label = elById('awsc-recent-roles-label');
    if (label) {
      label.textContent = label.textContent.replace('History', 'List');
    }
  } else {
    var li = list.firstElementChild;
    while (li) {
      input = li.querySelector('input[type="submit"]');
      var name = input.value;
      if (profile.exProfileNames.indexOf(name) > -1) {
        var nextLi = li.nextElementSibling;
        list.removeChild(li);
        li = nextLi;
      } else {
        const form = li.querySelector('form');
        form.dataset.aesrProfile = name.replace(/\s+\|\s+\d+$/, '');
        input.style = 'white-space:pre';
        recentNames.push(name);
        li = li.nextElementSibling;
      }
    }
  }

  const redirectUri = encodeURIComponent(window.location.href);
  profile.destProfiles.forEach(function(item) {
    var name = item.profile;
    if (!hidesAccountId) name += '  |  ' + item.aws_account_id;
    if (recentNames.indexOf(name) !== -1) return true;

    var color = item.color || 'aaaaaa';
    if (!item.image) {
        list.insertAdjacentHTML('beforeend', Sanitizer.escapeHTML`<li>
         <form action="https://signin.aws.amazon.com/switchrole" method="POST" target="_top" data-aesr-profile="${item.profile}">
          <input type="hidden" name="action" value="switchFromBasis">
          <input type="hidden" name="src" value="nav">
          <input type="hidden" name="roleName" value="${item.role_name}">
          <input type="hidden" name="account" value="${item.aws_account_id}">
          <input type="hidden" name="mfaNeeded" value="0">
          <input type="hidden" name="color" value="${color}">
          <input type="hidden" name="csrf" value="${csrf}">
          <input type="hidden" name="redirect_uri" value="${redirectUri}">
          <label for="awsc-recent-role-switch-0" class="awsc-role-color" style="background-color: #${color};">&nbsp;</label>
          <input type="submit" class="awsc-role-submit awsc-role-display-name" name="displayName" value="${name}"
                title="${item.role_name}@${item.aws_account_id}" style="white-space:pre"></form>
        </li>`);
    } else {
        list.insertAdjacentHTML('beforeend', Sanitizer.escapeHTML`<li>
         <form action="https://signin.aws.amazon.com/switchrole" method="POST" target="_top" data-aesr-profile="${item.profile}">
          <input type="hidden" name="action" value="switchFromBasis">
          <input type="hidden" name="src" value="nav">
          <input type="hidden" name="roleName" value="${item.role_name}">
          <input type="hidden" name="account" value="${item.aws_account_id}">
          <input type="hidden" name="mfaNeeded" value="0">
          <input type="hidden" name="color" value="${color}">
          <input type="hidden" name="csrf" value="${csrf}">
          <input type="hidden" name="redirect_uri" value="${redirectUri}">
          <label for="awsc-recent-role-switch-0" class="awsc-role-color"><img src=${item.image.replace(/"/g, '')} style="width: 1em; height: 1em"></label>
          <input type="submit" class="awsc-role-submit awsc-role-display-name" name="displayName" value="${name}"
                title="${item.role_name}@${item.aws_account_id}" style="white-space:pre"></form>
        </li>`);

    }
  });

  Array.from(list.querySelectorAll('form')).forEach(form => {
    form.onsubmit = function(e) {
      const destProfileName = this.dataset.aesrProfile;
      const foundProfile = profile.destProfiles.find(item => item.profile === destProfileName);
      return foundProfile ? hookBeforeSwitch(this, foundProfile) : true;
    }
  });

  const exitRoleForm = elById('awsc-exit-role-form');
  if (exitRoleForm) {
    exitRoleForm.addEventListener('submit', () => {
      hookBeforeExit(this);
    });
  }

  // Place role filter textinput
  var AWSR_firstForm = null;

  document.getElementById('awsc-recent-roles-label').insertAdjacentHTML('beforeend', '<input id="AESR_RoleFilter" type="text" placeholder="Filter by profile name" style="border:1px solid #ccc;border-radius:3px;font-size:13px;margin-left:0.25em;max-width:20ex;padding:0.4ex">');

  document.getElementById('AESR_RoleFilter').onkeyup = function(e) {
    const str = this.value;
    if (e.keyCode === 13) {
      if (AWSR_firstForm) {
        AWSR_firstForm.querySelector('input[type="submit"]').click()
      }
    } else {
      const lis = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles > li'));
      let firstHitLi = null;
      lis.forEach(li => {
        const profileName = li.firstElementChild.dataset.aesrProfile.toLowerCase();
        const hit = str ? profileName.indexOf(str) > -1 : false;
        const shown = str ? hit : true;
        li.style.display = shown ? 'block' : 'none';
        li.style.background = null;
        if (hit && firstHitLi === null) firstHitLi = li;
      });

      if (firstHitLi) {
        firstHitLi.style.background = '#f0f9ff';
        AWSR_firstForm = firstHitLi.querySelector('form');
      } else {
        AWSR_firstForm = null;
      }
    }
  }

  document.getElementById('nav-usernameMenu').addEventListener('click', () => {
    document.getElementById('AESR_RoleFilter').focus()
  })
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
        label.insertAdjacentHTML('beforebegin', Sanitizer.escapeHTML(`<img id="AESW_Image" src=${found.image.replace(/"/g, '')} style="float: left; padding-right: 1em; width: 1em; height: 1em">`));
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

