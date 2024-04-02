import { ConfigParser } from 'aesr-config';
import { DBManager } from './db.js';
import { loadConfigIni } from './config_ini.js';

export async function writeProfileSetToTable(profileSet) {
  const dbManager = new DBManager('aesr');
  await dbManager.open();

  await dbManager.transaction('profiles', async dbTable => {
    await dbTable.truncate();
  });

  await dbManager.transaction('profiles', async dbTable => {
    const { singles = [], complexes = [] } = profileSet;
    let i = 0;

    for (const profile of singles) {
      await dbTable.insert({
        profilePath: `[SINGLE];${formatNum(++i)}`,
        ...profile,
      });
    }

    for (const baseProfile of complexes) {
      const { targets, ...props } = baseProfile;
      await dbTable.insert({
        profilePath: `[COMPLEX];${formatNum(++i)}`,
        ...props,
      });

      for (const targetProfile of targets) {
        await dbTable.insert({
          profilePath: `${props.name};${formatNum(++i)}`,
          ...targetProfile,
        });
      }
    }
  });

  await dbManager.close();
}

export async function writeProfileItemsToTable(items, replace = false) {
  const dbManager = new DBManager('aesr');
  await dbManager.open();

  if (replace) {
    await dbManager.transaction('profiles', async dbTable => {
      await dbTable.truncate();
    });
  }

  await dbManager.transaction('profiles', async dbTable => {
    let i = 1;
    for (const item of items) {
      const num = `${i}`.padStart(6, '0')
      const { profile, source_profile, single, ...props } = item;
      const profilePath = (() => {
        if (single) return `[SINGLE];${num}`;
        if (source_profile) {
          return `${source_profile};${num}`;
        } else {
          return `[COMPLEX];${num}`;
        }
      })();
      const record = {
        profilePath,
        name: profile,
        ...props,
      };
      await dbTable.insert(record);
      i++;
    }
  });

  await dbManager.close();
}

export async function refreshDB(storageRepo) {
  const cfgText = await loadConfigIni(storageRepo);
  if (cfgText) {
    const profileSet = ConfigParser.parseIni(cfgText);
    await writeProfileSetToTable(profileSet);
  }
  return cfgText;
}

function formatNum(num) {
  return `${num}`.padStart(6, '0');
}
