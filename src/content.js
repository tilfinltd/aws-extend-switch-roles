function lastRoleKey() {
  var baseAccountId = getAccountId('awsc-login-display-name-account');
  var baseRole = getAccountId('awsc-login-display-name-user');
  return('lastRole_'+baseAccountId+'_'+baseRole.replace(/(.*)\/.*/, '$1'))
}

function extendIAMFormList() {
  var csrf, list = document.getElementById('awsc-username-menu-recent-roles');
  if (list) {
    var firstForm = list.querySelector('#awsc-recent-role-0 form');
    csrf = firstForm['csrf'].value;
  } else {
    list = generateEmptyRoleList();
    csrf = '';
  }

  var vlastRoleKey = lastRoleKey();
  chrome.storage.sync.get(['profiles', 'hidesHistory', 'hidesAccountId','showOnlyMatchingRoles','autoAssumeLastRole', vlastRoleKey], function(data) {
    var hidesHistory = data.hidesHistory || false;
    var hidesAccountId = data.hidesAccountId || false;
    var showOnlyMatchingRoles = data.showOnlyMatchingRoles || false;
    var autoAssumeLastRole = data.autoAssumeLastRole || false;
    var lastRole = data[vlastRoleKey] || false;
    if (data.profiles) {
      loadProfiles(new Profile(data.profiles, showOnlyMatchingRoles), list, csrf, hidesHistory, hidesAccountId);
      attachColorLine(data.profiles);
    }
    // console.log("Last role from '"+vlastRoleKey+"' was '"+lastRole+"'");
    if (! hasAssumedRole() && autoAssumeLastRole && lastRole ) {
      // console.log("Should try to auto-switch to role '"+lastRole+"'");
      document.getElementById("submit_"+lastRole).click();
    }
  });
}

function generateEmptyRoleList() {
  var divLbl = document.createElement('div');
  divLbl.id = 'awsc-recent-roles-label';
  divLbl.textContent = 'Role List:';
  var ul = document.createElement('ul');
  ul.id = 'awsc-username-menu-recent-roles';
  var parentEl = document.getElementById('awsc-login-account-section');
  parentEl.appendChild(divLbl);
  parentEl.appendChild(ul);

  var script = document.createElement('script');
  script.src = chrome.extension.getURL('/js/csrf-setter.js');
  parentEl.appendChild(script);
  return ul;
}

function loadProfiles(profile, list, csrf, hidesHistory, hidesAccountId) {
  var recentNames = [];
  var baseAccountId = getAccountId('awsc-login-display-name-account');
  var baseRole = getAssumedRole('awsc-login-display-name-user');

  if (hidesHistory) {
    var fc = list.firstChild;
    while (fc) {
      list.removeChild(fc);
      fc = list.firstChild;
    }

    var label = document.getElementById('awsc-recent-roles-label');
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
        input.style = 'white-space:pre';
        recentNames.push(name);
        li = li.nextElementSibling;
      }
    }
  }

  profile.destProfiles.forEach(function(item) {
    var name = item.profile;
    if (!hidesAccountId) name += '  |  ' + item.aws_account_id;
    if (recentNames.indexOf(name) !== -1) return true;


    var color = item.color || 'aaaaaa';
    var redirect_uri = encodeURI(window.location.href);
    list.insertAdjacentHTML('beforeend', Sanitizer.escapeHTML`<li>
    <form action="https://signin.aws.amazon.com/switchrole" method="POST" target="_top" id='form_${item.hash}'>
          <input type="hidden" name="action" value="switchFromBasis">
          <input type="hidden" name="src" value="nav">
          <input type="hidden" name="roleName" value="${item.role_name}">
          <input type="hidden" name="account" value="${item.aws_account_id}">
          <input type="hidden" name="mfaNeeded" value="0">
          <input type="hidden" name="hash" value="${item.hash}">
          <input type="hidden" name="color" value="${color}">
          <input type="hidden" name="csrf" value="${csrf}">
          <input type="hidden" name="redirect_uri" value="${redirect_uri}">
          <label for="awsc-recent-role-switch-0" class="awsc-role-color" style="background-color: #${color};">&nbsp;</label>
     <input type="submit" class="awsc-role-submit awsc-role-display-name" name="displayName" value="${name}"
            title="${item.role_name}@${item.aws_account_id}" id='submit_${item.hash}' style="white-space:pre"></form>
    </li>`);

    document.getElementById("form_"+item.hash).addEventListener("submit", function(){
      saveAssumedRole(item.hash);
    });
  });
  if (hasAssumedRole()) {
    document.getElementById("awsc-exit-role-form").addEventListener("submit", function(){
      clearLastRole();
    });
  }
}

function attachColorLine(profiles) {
  var usernameMenu = document.querySelector('#nav-usernameMenu');
  if (usernameMenu.classList.contains('awsc-has-switched-role')) {
    var r = usernameMenu.textContent.match(/^([^\s]+)\s+|\s+([^\s]+)/);
    if (r.length < 2) return;

    usernameMenu.style = 'white-space:pre';

    var profileName = r[1];
    var color = null;
    profiles.some(function(item) {
      if (item.profile === profileName) {
        color = item.color;
        return true;
      }
    });

    if (color) {
      if (needsInvertForeColorByBack(color)) {
        var label = usernameMenu.querySelector('.nav-elt-label');
        label.style = 'color: #eee';
      }

      var menubar = document.querySelector('#nav-menubar');
      var barDiv = document.createElement('div');
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

function getAccountId(elId) {
  var el = document.getElementById(elId);
  if (!el) return null;

  var aid = el.textContent;
  var r = aid.match(/^(\d{4})\-(\d{4})\-(\d{4})$/);
  if (r) {
    return r[1] + r[2] + r[3];
  } else {
    return aid;
  }
}

function getAssumedRole(elId) {
  var el = document.getElementById(elId);
  return ( !el ? null : el.textContent.split("/")[0] );
}

function hasAssumedRole() {
  var usernameMenu = document.querySelector('#nav-usernameMenu');
  if (usernameMenu.classList.contains('awsc-has-switched-role')) { return(true) } else { return(false) }
}

function clearLastRole() {
  var vlastRoleKey = lastRoleKey();
  chrome.storage.sync.remove(vlastRoleKey, function() {
    // console.log("Cleared lastRole '"+vlastRoleKey+"'");
  });
}

function saveAssumedRole(currentRole) {
  var baseAccountId = getAccountId('awsc-login-display-name-account');
  var vlastRoleKey = lastRoleKey();
  var setHash = {};
  setHash[vlastRoleKey] = currentRole;
  chrome.storage.sync.set(setHash, function() {
    // console.log("Saved lastRole to '"+vlastRoleKey+"' as '"+currentRole+"'");
  });
  return('foo');
}

extendIAMFormList();
