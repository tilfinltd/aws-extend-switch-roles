function extendIAMFormList() {
  var csrf, list = document.getElementById('awsc-username-menu-recent-roles');
  if (list) {
    var firstForm = list.querySelector('#awsc-recent-role-0 form');
    csrf = firstForm['csrf'].value;
  } else {
    list = generateEmptyRoleList();
    csrf = '';
  }

  chrome.storage.sync.get(['profiles', 'hidesHistory'], function(data) {
    var hidesHistory = data.hidesHistory || false;
  	if (data.profiles) {
      loadProfiles(new Profile(data.profiles), list, csrf, hidesHistory);
      attachColorLine(data.profiles);
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

function loadProfiles(profile, list, csrf, hidesHistory) {
  var recentNames = [];

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
    var name = item.profile + '  |  ' + item.aws_account_id;
    if (recentNames.indexOf(name) !== -1) return true;

    var color = item.color || 'aaaaaa';
	  var listItem = document.createElement('li');
	  listItem.innerHTML = '<form action="https://signin.aws.amazon.com/switchrole" method="POST" target="_top">'
	    +   '<input type="hidden" name="action" value="switchFromBasis">'
	    +   '<input type="hidden" name="src" value="nav">'
	    +   '<input type="hidden" name="roleName" value="' + item.role_name + '">'
	    +   '<input type="hidden" name="account" value="' + item.aws_account_id + '">'
	    +   '<input type="hidden" name="mfaNeeded" value="0">'
	    +   '<input type="hidden" name="color" value="' + color + '">'
	    +   '<input type="hidden" name="csrf" value="' + csrf + '">'
	    +   '<input type="hidden" name="redirect_uri" value="https%3A%2F%2Fconsole.aws.amazon.com%2Fs3%2Fhome">'
	    +   '<label for="awsc-recent-role-switch-0" class="awsc-role-color" style="background-color: #'+color+';">&nbsp;</label>'
	    +   '<input type="submit" class="awsc-role-submit awsc-role-display-name" name="displayName" value="'
	    +   name + '" title="' + item.role_name + '@' + item.aws_account_id + '" style="white-space:pre">'
	    + '</form>';

	  list.appendChild(listItem);
  });
}

function attachColorLine(profiles) {
  var usernameMenu = document.querySelector('#nav-usernameMenu');
  if (usernameMenu.classList.contains('awsc-has-switched-role')) {
    var r = usernameMenu.textContent.match(/^([^\s]+)/);
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
      var menubar = document.querySelector('#nav-menubar');
      var barDiv = document.createElement('div');
      barDiv.style = 'position:absolute;top:39px;width:100%;height:3px;z-index:0;background-color:#' + color;
      menubar.appendChild(barDiv);
    }
  }
}

extendIAMFormList();
