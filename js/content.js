function extendIAMFormList() {
  var list = document.querySelector('#awsc-username-menu-recent-roles');
  if (!list) return;

  var firstForm = list.querySelector('#awsc-recent-role-0 form');
  var csrf = firstForm['csrf'].value;

  chrome.storage.sync.get(['profiles', 'hidesHistory'], function(data) {
    var hidesHistory = data.hidesHistory || false;
  	if (data.profiles) {
      loadProfiles(data.profiles, list, csrf, hidesHistory);
      attachColorLine(data.profiles);
  	}
  });
}

function loadProfiles(profiles, list, csrf, hidesHistory) {
  var submits = list.querySelectorAll('input[type="submit"]');
  var recentNames = [];

  if (hidesHistory) {
    var fc = list.firstChild;
    while (fc) {
      list.removeChild(fc);
      fc = list.firstChild;
    }
  } else {
    submits.forEach(function(input){
      input.style = 'white-space:pre';
      recentNames.push(input.value);
    });
  }

  profiles.forEach(function(item) {
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
