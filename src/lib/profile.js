String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function Profile(items, showOnlyMatchingRoles) {
  var baseAccountId = getAccountId('awsc-login-display-name-account');
  var baseRole = getAssumedRole('awsc-login-display-name-user');
  var srcProfileMap = {};
  var destProfiles = [];
  var destProfileMap = {};

  items.forEach(function(item){
    item.hash = JSON.stringify(item).hashCode()
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
      var profiles = destProfileMap[name] || [];
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
