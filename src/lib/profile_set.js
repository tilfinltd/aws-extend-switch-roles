class ProfileSet {
  constructor(items, showOnlyMatchingRoles, { baseAccount, roleFederated }) {
    // Map that has entries { <awsAccountId>: <Profile> }
    this.srcProfileMap = {};
    let destsBySrcMap = {}; // { <srcProfileName>: [<destProfile>... ] }
    let independentDests = [];

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
    const baseProfile = this.srcProfileMap[baseAccount];
    if (baseProfile) {
      complexDests = this._decideComplexDestProfiles(baseProfile, destsBySrcMap, { showOnlyMatchingRoles, roleFederated })
      delete destsBySrcMap[baseProfile.profile];
    }

    // To display roles on the list
    this.destProfiles = [].concat(independentDests).concat(complexDests)
  }

  _decideComplexDestProfiles(baseProfile, destsBySrcMap, { showOnlyMatchingRoles, roleFederated }) {
    let profiles = (destsBySrcMap[baseProfile.profile] || []).map(profile => {
      if (!profile.role_name) {
        profile.role_name = baseProfile.target_role_name
      }

      if (!profile.region && baseProfile.target_region) {
        profile.region = baseProfile.target_region
      }
      
      return profile
    })

    if (showOnlyMatchingRoles && roleFederated) {
      profiles = profiles.filter(el => el.role_name === roleFederated)
    }
    return profiles;
  }
}
