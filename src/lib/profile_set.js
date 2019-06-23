class ProfileSet {
  constructor(items, showOnlyMatchingRoles) {
    // Map that has entries { <awsAccountId>: <Profile> }
    this.profileByIdMap = {};

    let destsBySrcMap = {}; // { <srcProfileName>: [<destProfile>... ] }
    let independentDests = [];

    items.forEach(item => {
      this.profileByIdMap[item.aws_account_id] = item;

      if (item.source_profile) {
        if (item.source_profile in destsBySrcMap) {
          destsBySrcMap[item.source_profile].push(item);
        } else {
          destsBySrcMap[item.source_profile] = [item];
        }
      } else if (item.aws_account_id && item.role_name && !item.target_role_name) {
        independentDests.push(item);
      }
    });

    let complexDests = [];
    let baseProfile = this._getBaseProfile();
    if (baseProfile) {
      complexDests = this._decideComplexDestProfiles(baseProfile, destsBySrcMap, { showOnlyMatchingRoles })
      delete destsBySrcMap[baseProfile.profile];
    }

    // To display roles on the list
    this.destProfiles = [].concat(independentDests).concat(complexDests)

    // For excluding unrelated profiles from recent history
    this.excludedNames = this._decideExcludedNames(destsBySrcMap)
  }

  _getBaseProfile() {
    let baseAccountId = getAccountId('awsc-login-display-name-account');
    return this.profileByIdMap[baseAccountId];
  }

  _decideComplexDestProfiles(baseProfile, destsBySrcMap, { showOnlyMatchingRoles }) {
    let profiles = (destsBySrcMap[baseProfile.profile] || []).map(profile => {
      if (!profile.role_name) {
        profile.role_name = baseProfile.target_role_name
      }
      return profile
    })

    if (showOnlyMatchingRoles && document.body.className.includes('user-type-federated')) {
      let baseRole = getAssumedRole();
      profiles = profiles.filter(el => el.role_name === baseRole)
    }
    return profiles;
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
