export function createProfileSet(profiles, userInfo, settings) {
  const {
    loginDisplayNameAccount, loginDisplayNameUser,
    roleDisplayNameAccount, roleDisplayNameUser,
  } = userInfo;
  const { showOnlyMatchingRoles } = settings;

  const baseAccount = brushAccountId(loginDisplayNameAccount);
  const loginRole = extractLoginRole(loginDisplayNameUser.split("/", 2)[0]);
  const filterByTargetRole = showOnlyMatchingRoles ? (roleDisplayNameUser || loginRole) : null;

  return new ProfileSet(profiles, baseAccount, { loginRole, filterByTargetRole });
}

export class ProfileSet {
  constructor(items, baseAccount, { loginRole, filterByTargetRole }) {
    // Map that has entries { <awsAccountId>: <Profile> }
    this.srcProfileMap = {};
    let destsBySrcMap = {}; // { <srcProfileName>: [<destProfile>... ] }
    let independentOrSrcProfiles = [];
    let independentDests = [];

    items.forEach(item => {
      if (item.source_profile) {
        if (item.source_profile in destsBySrcMap) {
          destsBySrcMap[item.source_profile].push(item);
        } else {
          destsBySrcMap[item.source_profile] = [item];
        }
      } else {
        independentOrSrcProfiles.push(item);
      }
    });

    independentOrSrcProfiles.forEach(item => {
      if (item.profile in destsBySrcMap) {
        let key = item.aws_account_id;
        if (item.role_name) key += '/' + item.role_name;
        this.srcProfileMap[key] = item;
      } else {
        independentDests.push(item)
      }
    });

    let complexDests = [];
    const baseProfile = this.srcProfileMap[baseAccount + "/" + loginRole] || this.srcProfileMap[baseAccount];
    if (baseProfile) {
      complexDests = this._decideComplexDestProfiles(baseProfile, destsBySrcMap, filterByTargetRole);
      delete destsBySrcMap[baseProfile.profile];
    }

    // To display roles on the list
    this.destProfiles = [].concat(independentDests).concat(complexDests)
  }

  _decideComplexDestProfiles(baseProfile, destsBySrcMap, filterByTargetRole) {
    let profiles = (destsBySrcMap[baseProfile.profile] || []).map(profile => {
      if (!profile.role_name) {
        profile.role_name = baseProfile.target_role_name
      }

      if (!profile.region && baseProfile.target_region) {
        profile.region = baseProfile.target_region
      }
      
      return profile
    })

    if (filterByTargetRole) {
      profiles = profiles.filter(el => el.role_name === filterByTargetRole);
    }
    return profiles;
  }
}

function brushAccountId(val) {
  const r = val.match(/^(\d{4})\-(\d{4})\-(\d{4})$/);
  if (!r) return val;
  return r[1] + r[2] + r[3];
}

const RESERVED_SSO_PREFIX = "AWSReservedSSO_";
function extractLoginRole(role) {
  if (role.startsWith(RESERVED_SSO_PREFIX)) {
    // extract permission set from SSO role
    const lastUnderscore = role.lastIndexOf('_');
    return role.substr(RESERVED_SSO_PREFIX.length, lastUnderscore - RESERVED_SSO_PREFIX.length);
  }
  return role;
}
