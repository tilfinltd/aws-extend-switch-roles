import { DBManager } from './db.js';
import { loadConfigIni } from './config_ini.js';
import { loadAwsConfig } from './load_aws_config.js';

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
    const items = loadAwsConfig(cfgText);
    await writeProfileItemsToTable(items, true);
  }
  return cfgText;
}
