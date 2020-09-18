class ProfileSet {
  constructor(items, showOnlyMatchingRoles, baseAccountId) {
    // Map that has entries { <awsAccountId>: <Profile> }
    this.srcProfileMap = {};
    let destsBySrcMap = {}; // { <srcProfileName>: [<destProfile>... ] }
    let independentDests = [];
    this.baseAccountId = baseAccountId;

    items.forEach(item => {
      if (item.source_profile) {
        if (item.source_profile in destsBySrcMap) {
          destsBySrcMap[item.source_profile].push(item);
        } else {
          destsBySrcMap[item.source_profile] = [item];
        }
      } else if (item.aws_account_id && item.role_name && !item.target_role_name) {
        independentDests.push(item);
      } else {
        this.srcProfileMap[item.aws_account_id] = item;
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
    return this.srcProfileMap[this.baseAccountId];
  }

  _decideComplexDestProfiles(baseProfile, destsBySrcMap, { showOnlyMatchingRoles }) {
    let profiles = (destsBySrcMap[baseProfile.profile] || []).map(profile => {
      if (!profile.role_name) {
        profile.role_name = baseProfile.target_role_name
      }

      if (!profile.region && baseProfile.target_region) {
        profile.region = baseProfile.target_region
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
