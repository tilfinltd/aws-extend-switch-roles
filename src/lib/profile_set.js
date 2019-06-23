class ProfileSet {
  constructor(items, showOnlyMatchingRoles) {
    let srcProfileMap = {}; // { <awsAccountId>: <Profile> }
    let destsBySrcMap = {}; // { <srcProfileName>: [<destProfile>... ] }
    let independentDests = [];

    items.forEach(item => {
      if (item.source_profile) {
        if (item.source_profile in destsBySrcMap) {
          destsBySrcMap[item.source_profile].push(item);
        } else {
          destsBySrcMap[item.source_profile] = [item];
        }
      } else if (item.aws_account_id && !item.role_name) {
        srcProfileMap[item.aws_account_id] = item;
      } else {
        independentDests.push(item);
      }
    });

    const complexDests = this._decideComplexDestProfiles(srcProfileMap, destsBySrcMap, { showOnlyMatchingRoles })

    // To display roles on the list
    this.destProfiles = [].concat(independentDests).concat(complexDests)

    // For excluding unrelated profiles from recent history
    this.excludedNames = this._decideExcludedNames(destsBySrcMap)
  }

  _decideComplexDestProfiles(srcProfileMap, destsBySrcMap, { showOnlyMatchingRoles }) {
    let baseAccountId = getAccountId('awsc-login-display-name-account');
    let baseProfile = srcProfileMap[baseAccountId];
    if (baseProfile) {
      let name = baseProfile.profile;
      let profiles = destsBySrcMap[name] || [];
      if (showOnlyMatchingRoles && document.body.className.includes('user-type-federated')) {
        let baseRole = getAssumedRole();
        profiles = profiles.filter(el => el.role_name === baseRole)
      }
      delete destsBySrcMap[name];
      return profiles;
    }
    return [];
  }

  _decideExcludedNames(destsBySrcMap) {
    let result = [];
    for (let name in destsBySrcMap) {
      destsBySrcMap[name].forEach(item => {
        result.push(item.profile);
      });
    }
    return result;
  }
}
