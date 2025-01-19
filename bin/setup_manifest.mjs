#!/usr/bin/env node

import fs from 'node:fs/promises';
import { parseArgs } from 'node:util';

function mergeObjects(target, source) {
  if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
    return source;
  }

  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      target[key] = mergeObjects(target[key], source[key]); // 再帰的にマージ
    }
  }

  return target;
}

const args = process.argv.slice(2);
const options = {
  dev: {
    type: 'boolean',
    short: 'd',
  },
};
const { values } = parseArgs({ args, options });

const baseData = await fs.readFile('manifest.json', { encoding: 'utf8' });

const { version } = JSON.parse(baseData);
let versionText = version.replace(/\./g, '-');
if (values.dev) {
  versionText += '-dev';
}
await fs.writeFile(`./dist/version`, versionText);

async function writeManifestJsonFile({ browser, dev }) {
  const result = mergeObjects({}, JSON.parse(baseData));

  const browserData = await fs.readFile(`manifest_${browser}.json`, { encoding: 'utf8' });
  mergeObjects(result, JSON.parse(browserData));

  if (dev) {
    try {
      const brwDevData = await fs.readFile(`manifest_${browser}_dev.json`, { encoding: 'utf8' });
      mergeObjects(result, JSON.parse(brwDevData));
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.log(`Failed to read manifest json file because of ${err}`);
      }
    }
  }

  await fs.writeFile(`./dist/${browser}/manifest.json`, JSON.stringify(result, null, 2));
}

await writeManifestJsonFile({ browser: 'chrome', dev: values.dev });
await writeManifestJsonFile({ browser: 'firefox', dev: values.dev });
