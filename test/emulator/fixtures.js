import path from 'path';
import util from 'util';
import { fileURLToPath } from 'url';
import { test as base, chromium } from '@playwright/test';

export const test = base.extend({
  context: async ({}, use) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pathToExtension = path.resolve(__dirname, '../../src');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

const sleep = util.promisify(setTimeout);

export const testInOptions = (message, beforeFunc, pageFunc, afterFunc) => {
  test(message, async ({ page, context, extensionId }) => {
    const [worker] = context.serviceWorkers();
    const resultB = await worker.evaluate(beforeFunc);
    if (resultB !== undefined) console.log(resultB);

    await page.goto(`chrome-extension://${extensionId}/options.html`);
    const resultP = await pageFunc({ page, expect: test.expect });
    if (resultP !== undefined) console.log(resultP);

    await sleep(1000);
    const resultA = await worker.evaluate(afterFunc);
    if (resultA !== undefined) console.log(resultA);
    //await sleep(1000000);
  });
};

export const testInPopup = (message, beforeFunc, pageFunc, afterFunc) => {
  test(message, async ({ page, context, extensionId }) => {
    const [worker] = context.serviceWorkers();
    const resultB = await worker.evaluate(beforeFunc);
    if (resultB !== undefined) console.log(resultB);

    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    const resultP = await pageFunc({ page, expect: test.expect });
    if (resultP !== undefined) console.log(resultP);

    await sleep(100);
    const resultA = await worker.evaluate(afterFunc);
    if (resultA !== undefined) console.log(resultA);
    //await sleep(1000000);
  });
};

export const testInSupporters = (message, pageFunc) => {
  test(message, async ({ page, context, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/supporters.html`);
    const resultP = await pageFunc({ page, expect: test.expect });
    if (resultP !== undefined) console.log(resultP);
    //await sleep(1000000);
  });
};

export const testInWorker = (message, workerFunc) => {
  test(message, async ({ page, context, extensionId }) => {
    const [worker] = context.serviceWorkers();
    const result = await worker.evaluate(workerFunc);
    if (result !== undefined) console.log(result);
    //await sleep(1000000);
  });
};
