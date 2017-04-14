function Profile(items) {
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

  var baseAccountId = getAccountId('awsc-login-display-name-account');
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
      result = result.concat(destProfileMap[name] || []);
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
