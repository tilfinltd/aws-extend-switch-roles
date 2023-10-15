import { DBManager } from '../js/lib/db.js';
import { externalConfigReceived } from '../js/handlers/external.js';

export async function externalConfigReceivedTest() {
  await chrome.storage.sync.set({ configStorageArea: 'sync', configSenderId: 'test_sender_id' });

  const action = 'updateConfig';
  const dataType = 'ini';
  const data = `;
; Tilfin
;
[profile tilfin]
aws_account_id = 444488881111

[dev]
role_arn = arn:aws:iam::666677770000:role/developer
source_profile = tilfin
color = ff33cc
image = https://console.aws.amazon.com/favicon.ico

[stg]
role_arn = arn:aws:iam::666677770000:role/developer
source_profile = tilfin
color = ccff33
image = https://console.aws.amazon.com/favicon.ico

[admin]
source_profile = tilfin
aws_account_id  = 333355551111
role_name = TilfinAdmin
`;
  await externalConfigReceived(action, dataType, data, 'test_sender_id');

  const dbManager = new DBManager('aesr');
  await dbManager.open();
  let items;
  await dbManager.transaction('profiles', async dbTable => {
    items = await dbTable.query('tilfin;');
  });
  await dbManager.close();
  assert(items.length, 3);

  const { configStorageArea } = await await chrome.storage.sync.get(['configStorageArea']);
  assert(configStorageArea, 'local');
}

export async function externalConfigReceivedFailureTest() {
  await chrome.storage.sync.set({ configStorageArea: 'sync', configSenderId: 'test_sender_id' });

  try {
    await externalConfigReceived('invalidaction', 'ini', '', 'test_sender_id');
    assertNever();
  } catch (err) {
    assert(err.message, 'Invalid action');
  }

  try {
    await externalConfigReceived('updateConfig', 'yaml', '', 'test_sender_id');
    assertNever();
  } catch (err) {
    assert(err.message, 'Invalid dataType');
  }
}
