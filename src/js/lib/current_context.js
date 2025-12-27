export class CurrentContext {
  constructor(userInfo, settings) {
    const {
      loginDisplayNameAccount, loginDisplayNameUser,
      roleDisplayNameAccount, roleDisplayNameUser,
      prism,
    } = userInfo;
    const { showOnlyMatchingRoles } = settings;

    this.baseAccount = (() => {
      if (prism && roleDisplayNameAccount) return brushAccountId(roleDisplayNameAccount);
      return brushAccountId(loginDisplayNameAccount);
    })();
    this.loginRole = (() => {
      if (prism && roleDisplayNameUser) return extractLoginRole(roleDisplayNameUser);
      return extractLoginRole(loginDisplayNameUser.split("/", 2)[0]);
    })();
    this.filterByTargetRole = showOnlyMatchingRoles ? (roleDisplayNameUser || this.loginRole) : null;

    // Track if we're in a delegated role and what the source account is
    this.isInDelegatedRole = !!(roleDisplayNameAccount || (prism && roleDisplayNameUser));
    this.sourceAccount = this.isInDelegatedRole ? brushAccountId(loginDisplayNameAccount) : null;
    this.sourceRole = this.isInDelegatedRole ? extractLoginRole(loginDisplayNameUser.split("/", 2)[0]) : null;
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
