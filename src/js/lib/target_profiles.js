import { ConfigParser } from "aesr-config";
import { DBManager } from "./db.js";
import { loadConfigIni } from "./config_ini";
import { StorageProvider } from "./storage_repository.js";

export async function findTargetProfiles(ctx) {
  try {
    return await retrieveTargetProfilesFromDB(ctx);
  } catch (err) {
    // Firefox private browsing
    return await retrieveTargetProfilesFromLztext(ctx);
  }
}

async function retrieveTargetProfilesFromDB(ctx) {
  const { baseAccount, loginRole, filterByTargetRole, isInDelegatedRole, sourceAccount, sourceRole } = ctx;
  const dbManager = new DBManager('aesr');
  await dbManager.open();

  const results = [];
  await dbManager.transaction('profiles', async dbTable => {
    const singles = await dbTable.query(`[SINGLE];`);
    results.push(...singles)

    const complexSrcItems = await dbTable.query('[COMPLEX];');
    const matchedComplexSrc = complexSrcItems.find(it => matchSourceProfile(it, baseAccount, loginRole));
    if (matchedComplexSrc) {
      const complexTargetItems = await dbTable.query(`${matchedComplexSrc.name};`);
      let targets = complexTargetItems.map(it => convertComplexTarget(it, matchedComplexSrc));
      if (filterByTargetRole) {
        targets = targets.filter(it => matchRoleNameLeaf(it, filterByTargetRole));
      }
      results.push(...targets)
    }

    // If we're in a delegated role, add the base account as a switchable target
    if (isInDelegatedRole && sourceAccount) {
      const baseProfile = complexSrcItems.find(it => matchSourceProfile(it, sourceAccount, sourceRole));
      if (baseProfile) {
        const switchBackProfile = {
          ...baseProfile,
          isSwitchBack: true,
          profile: `← ${baseProfile.name}`,
        };
        // Add it at the beginning for easy access
        results.unshift(switchBackProfile);
      }
    }
  }, 'readonly');

  await dbManager.close();

  return results;
}

function matchSourceProfile(item, account, role) {
  const { aws_account_id, aws_account_alias, role_name } = item;
  if (role_name && role_name !== role) return false;
  return (aws_account_id === account || aws_account_alias === account);
}

function convertComplexTarget(item, baseProfile) {
  if (!item.role_name) {
    item.role_name = baseProfile.target_role_name
  }

  if (!item.region && baseProfile.target_region) {
    item.region = baseProfile.target_region
  }

  return item
}

async function retrieveTargetProfilesFromLztext(ctx) {
  const { baseAccount, loginRole, filterByTargetRole, isInDelegatedRole, sourceAccount, sourceRole } = ctx;

  const localRepo = StorageProvider.getLocalRepository();
  const cfgText = await loadConfigIni(localRepo);
  if (!cfgText) return [];

  const profileSet = ConfigParser.parseIni(cfgText);

  const results = [...profileSet.singles];

  const matchedComplexSrc = profileSet.complexes.find(it => matchSourceProfile(it, baseAccount, loginRole));
  if (matchedComplexSrc) {
    let targets = matchedComplexSrc.targets;
    if (filterByTargetRole) {
      targets = targets.filter(it => matchRoleNameLeaf(it, filterByTargetRole));
    }
    results.push(...targets)
  }

  // If we're in a delegated role, add the base account as a switchable target
  if (isInDelegatedRole && sourceAccount) {
    const baseProfile = profileSet.complexes.find(it => matchSourceProfile(it, sourceAccount, sourceRole));
    if (baseProfile) {
      const switchBackProfile = {
        ...baseProfile,
        isSwitchBack: true,
        profile: `← ${baseProfile.name}`,
      };
      // Add it at the beginning for easy access
      results.unshift(switchBackProfile);
    }
  }

  return results;
}

function matchRoleNameLeaf(item, targetLeaf) {
  return item.role_name.split('/').pop() === targetLeaf;
}
