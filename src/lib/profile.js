function Profile(items, showOnlyMatchingRoles) {
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
    if (!el) return null;

    var role = el.textContent;
    if (role.indexOf('/') > -1) {
      return role.split("/")[0];
    } else {
      return role;
    }
  }

  var baseAccountId = getAccountId('awsc-login-display-name-account');
  var baseRole = getAssumedRole('awsc-login-display-name-user');
  var srcProfileMap = {};
  var destProfiles = [];
  var destProfileMap = {};

  items.forEach(function(item){
    if (item.source_profile) {
      if (item.source_profile in destProfileMap) {
        destProfileMap[item.source_profile].push(item);
      } else {
        destProfileMap[item.source_profile] = [item];
      }
    } else if (item.aws_account_id && !item.role_name) {
      srcProfileMap[item.aws_account_id] = item;
    } else {
      destProfiles.push(item);
    }
  });

  this.destProfiles = (function(){
    var result = [].concat(destProfiles);
    var baseProfile = srcProfileMap[baseAccountId];
    if (baseProfile) {
      var name = baseProfile.profile;
      var profiles = (destProfileMap[name] || []);
      if (showOnlyMatchingRoles) {
        profiles = profiles.filter(function(el) { return (el.role_name == baseRole); })
      }
      result = result.concat(profiles);
      delete destProfileMap[name];
    }
    return result;
  })();

  this.exProfileNames = (function(){
    var result = [];
    for (var name in destProfileMap) {
      destProfileMap[name].forEach(function(item){
        result.push(item.profile + '  |  ' + item.aws_account_id);
      });
    }
    return result;
  })();
}
