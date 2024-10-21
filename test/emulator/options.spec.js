import { testInOptions } from './fixtures.js';

testInOptions("change and save configuration",
  async () => {
    await chrome.storage.sync.set({ profilesLastUpdated: 1000 });
    await chrome.storage.local.set({ profilesTableUpdated: 1000 });
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
color=00cc33
source_profile=src-A
; comment`);
    await page.locator('#saveButton').click();
  },
  async () => { // after
    const syncData = await chrome.storage.sync.get(['configStorageArea', 'lztext', 'profilesLastUpdated']);
    self.assertUndefined(syncData.configStorageArea);
    self.assertTrue(syncData.lztext.length > 0);
    self.assertTrue(syncData.profilesLastUpdated > 1000);

    const localData = await chrome.storage.local.get(['profilesTableUpdated']);
    self.assertTrue(localData.profilesTableUpdated > 1000);

    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
  }
);

testInOptions("change Configuration storage from local to sync",
  async () => {
    await chrome.storage.sync.set({ configStorageArea: 'local' });
    await chrome.storage.local.set({ 
      lztext: `\u1b62\u6c41\u414c\u0780\u5d22\u41a0\u7723\u1c2f\u5321\u4638\u1ee0\u5748\u0195\u2120\u1320\u0422\u78e8\u08eb\u3aa0\u4caf\u6839\u4b13\u3906\u0260\u5320\u6efc\u00fb\u3020\u3be0\u0296\u603d\u6eac\u2a45\u1950\u5920\u5c69\u48b4\u21a1\u0274\u5761\u49bb\u0036\u12a9\u2921\u7480\u0188\u21d8\u4022\u1b93\u0bac\u47ac\u2354\u70a9\u0086\u0873\u73e3\u21e0\u70a4\u6312\u6e8e\u27c7\u44a4\u4724\u0020\u0020`,
      profilesTableUpdated: 1400,
    });
  }, // before
  async ({ page, expect }) => {
    expect(await page.locator('#configStorageSyncRadioButton').isChecked()).toBeFalsy();
    expect(await page.locator('#configStorageLocalRadioButton').isChecked()).toBeTruthy();
    await page.locator('#configStorageSyncRadioButton').check();
  },
  async () => { // after
    // lztext should be copied from local to sync
    const syncData = await chrome.storage.sync.get(['configStorageArea', 'lztext', 'lztext_1', 'profilesLastUpdated']);
    self.assert(syncData.configStorageArea, 'sync');
    self.assert(syncData.lztext, `\u1b62\u6c41\u414c\u0780\u5d22\u41a0\u7723\u1c2f\u5321\u4638\u1ee0\u5748\u0195\u2120\u1320\u0422\u78e8\u08eb\u3aa0\u4caf\u6839\u4b13\u3906\u0260\u5320\u6efc\u00fb\u3020\u3be0\u0296\u603d\u6eac\u2a45\u1950\u5920\u5c69\u48b4\u21a1\u0274\u5761\u49bb\u0036\u12a9\u2921\u7480\u0188\u21d8\u4022\u1b93\u0bac\u47ac\u2354\u70a9\u0086\u0873\u73e3\u21e0\u70a4\u6312\u6e8e\u27c7\u44a4\u4724\u0020\u0020`,)
    self.assert(syncData.lztext_1, '')
    self.assertTrue(syncData.profilesLastUpdated > 1400);

    // The profilesTableUpdated in local is updated to the same value as profilesLastUpdated.
    const localData = await chrome.storage.local.get(['lztext', 'profilesTableUpdated']);
    self.assert(localData.lztext, `\u1b62\u6c41\u414c\u0780\u5d22\u41a0\u7723\u1c2f\u5321\u4638\u1ee0\u5748\u0195\u2120\u1320\u0422\u78e8\u08eb\u3aa0\u4caf\u6839\u4b13\u3906\u0260\u5320\u6efc\u00fb\u3020\u3be0\u0296\u603d\u6eac\u2a45\u1950\u5920\u5c69\u48b4\u21a1\u0274\u5761\u49bb\u0036\u12a9\u2921\u7480\u0188\u21d8\u4022\u1b93\u0bac\u47ac\u2354\u70a9\u0086\u0873\u73e3\u21e0\u70a4\u6312\u6e8e\u27c7\u44a4\u4724\u0020\u0020`,)
    self.assertTrue(localData.profilesTableUpdated > 1400);
    self.assert(syncData.profilesLastUpdated, localData.profilesTableUpdated);

    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
  }
);

testInOptions("change Configuration storage from sync to local",
  async () => {
    await chrome.storage.sync.set({
      configStorageArea: 'sync',
      lztext: '<dummyA>',
      profilesLastUpdated: 1500,
    });
    await chrome.storage.local.set({ 
      lztext: '<dummyB>',
      profilesTableUpdated: 1500,
    });
  }, // before
  async ({ page, expect }) => {
    expect(await page.locator('#configStorageSyncRadioButton').isChecked()).toBeTruthy();
    expect(await page.locator('#configStorageLocalRadioButton').isChecked()).toBeFalsy();
    await page.locator('#configStorageLocalRadioButton').check();
  },
  async () => { // after
    // Nothing should be changed except for updating configStorageArea.
    const syncData = await chrome.storage.sync.get(['configStorageArea', 'lztext', 'profilesLastUpdated']);
    self.assert(syncData.configStorageArea, 'local');
    self.assert(syncData.lztext, '<dummyA>');
    self.assertTrue(syncData.profilesLastUpdated, 1500);

    const localData = await chrome.storage.local.get(['lztext', 'profilesTableUpdated']);
    self.assert(localData.lztext, '<dummyB>');
    self.assert(localData.profilesTableUpdated, 1500);

    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
  }
);
