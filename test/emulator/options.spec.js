import { testInOptions } from './fixtures.js';

testInOptions("change and save configuration",
  async () => {
  }, // before
  async ({ page, expect }) => {
    await page.locator('#awsConfigTextArea').fill(`\
[src-A]
aws_account_id = 000011112222
# comment2

[profile src/B]
aws_account_id = 111122223333
;comment
[A1]
role_arn = arn:aws:iam::000011112223:role/target/a1
source_profile = src-A
color = ffcccc
; comment

[profile B1]
role_arn = arn:aws:iam::111122223334:role/roleB1
source_profile = src/B
# comment
[profile A/2]
aws_account_id = 000011112224
role_name=target-a2
color=#00cc33
source_profile=src-A
; comment`);
    await page.locator('#saveButton').click();
  },
  async () => { // after
    const syncData = await chrome.storage.sync.get(['configStorageArea', 'lztext']);
    self.assertUndefined(syncData.configStorageArea);
    self.assertTrue(syncData.lztext.length > 0);
  }
);
