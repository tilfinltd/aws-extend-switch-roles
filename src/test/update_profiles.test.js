import { DBManager } from '../js/lib/db.js';
import { updateProfilesTable } from '../js/handlers/update_profiles.js';

export async function updateProfilesTableMigrateTest() {
  await chrome.storage.sync.set({
    configStorageArea: 'sync',
    lztext: "<dummy>",
    profiles: [
      { aws_account_id: '986450800000', profile: 'MyCompany' },
      {
        aws_account_id: '333372696324',
        color: 'ff33cc',
        image: 'https://console.aws.amazon.com/favicon.ico',
        profile: 'dev',
        role_name: 'developer',
        source_profile: 'MyCompany'
      },
      {
        aws_account_id: '633772692222',
        color: 'ccff33',
        image: 'https://console.aws.amazon.com/favicon.ico',
        profile: 'stg',
        role_name: 'developer',
        source_profile: 'MyCompany'
      },
      {
        aws_account_id: '986450800000',
        profile: 'tfadmin',
        role_name: 'MyCompanyAdmin',
        source_profile: 'MyCompany'
      },
      {
        aws_account_id: '986450800000',
        profile: 'tfadmin2',
        role_name: 'MyCompanyAdmin',
        source_profile: 'MyCompany'
      },
      {
        aws_account_id: '986400005555',
        profile: 'tfadmin3',
        role_name: 'MyCompanyAdmin',
        source_profile: 'MyCompany'
      },
      { aws_account_id: '652527129940', profile: 'b-project' },
      {
        aws_account_id: '616567000000',
        color: '222222',
        profile: 'stg',
        role_name: 'developer',
        source_profile: 'b-project'
      },
    ],
    profiles_1: [
      {
        aws_account_id: '724670320000',
        color: 'ff0080',
        profile: 'manager',
        role_name: 'manager',
        source_profile: 'b-project'
      },
      {
        aws_account_id: 'company',
        profile: 'Company',
        target_role_name: 'first.family'
      },
      {
        aws_account_id: '482057926000',
        color: '805300',
        profile: 'foo-itg',
        region: 'us-east-1',
        source_profile: 'Company'
      },
      {
        aws_account_id: '707153760000',
        color: 'f88607',
        profile: 'foo-stg',
        region: 'ap-northeast-1',
        source_profile: 'Company'
      },
      {
        aws_account_id: '594117680000',
        color: 'f76505',
        profile: 'foo-prd',
        region: 'ap-northeast-1',
        source_profile: 'Company'
      },
    ],
    profiles_2: [
      {
        aws_account_id: '557831300000',
        color: '7e7e7e',
        profile: 'abc-stg',
        region: 'ap-northeast-1',
        source_profile: 'Company'
      },
      {
        aws_account_id: '814742550000',
        color: '5a5a5a',
        profile: 'abc-prd',
        region: 'ap-northeast-1',
        source_profile: 'Company'
      },
    ],
    profiles_3: [
      { aws_account_id: '404956750000', profile: 'a-company' },
      {
        aws_account_id: '000001068889',
        color: '008040',
        profile: 'z-dev',
        role_name: 'first.family',
        source_profile: 'a-company'
      },
    ],
    profiles_4: [
      {
        aws_account_id: '111111111',
        profile: 'profile1',
        region: 'ap-northeast-1',
        role_name: 'some-role'
      }
    ],
  });

  await updateProfilesTable();

  // lztext in stroage should be kept and profiles in storage should be deleted.
  const postStorage = await chrome.storage.sync.get(['lztext', 'lztext_1', "profile", 'profile_1', 'profile_2', 'profile_3', 'profile_4', 'profilesLastUpdated']);
  assertTrue(postStorage.lztext);
  assertUndefined(postStorage.lztext_1);
  assertUndefined(postStorage.profile);
  assertUndefined(postStorage.profile_1);
  assertUndefined(postStorage.profile_2);
  assertUndefined(postStorage.profile_3);
  assertUndefined(postStorage.profile_4);
  assertTrue(postStorage.profilesLastUpdated > 1693526400);

  // Indexed DB profiles should be registered.
  const dbManager = new DBManager('aesr');
  await dbManager.open();
  await dbManager.transaction('profiles', async dbTable => {
    const singleProfiles = await dbTable.query('[SINGLE];');
    assert(singleProfiles[0].name, 'profile1');

    const complexProfiles = await dbTable.query('[COMPLEX];');
    assert(complexProfiles[0].name, 'MyCompany');
    assert(complexProfiles[1].name, 'b-project');
    assert(complexProfiles[2].name, 'Company');
    assert(complexProfiles[3].name, 'a-company');

    const childMyCompany = await dbTable.query('MyCompany;');
    assert(childMyCompany.length, 5);

    const childBProject = await dbTable.query('b-project;');
    assert(childBProject.length, 2);

    const childCompany = await dbTable.query('Company;');
    assert(childCompany.length, 5);
  
    const childACompany = await dbTable.query('a-company;');
    assert(childACompany.length, 1);
  });
  await dbManager.close();
}

export async function updateProfilesTableUpdateTest() {
  // Sync storage is updated and local is older than it.
  const epochTime = Math.floor(new Date().getTime() / 1000);
  await chrome.storage.sync.set({
    configStorageArea: 'sync',
    profilesLastUpdated: epochTime - 5,
    lztext: `\u1b62\u6c41\u414c\u0780\u5d22\u41a0\u7723\u1c2f\u5321\u4638\u1ee0\u5748\u0195\u2120\u1320\u0422\u78e8\u08eb\u3aa0\u4caf\u6839\u4b13`,
    lztext_1: `\u3906\u0260\u5320\u6efc\u00fb\u3020\u3be0\u0296\u603d\u6eac\u2a45\u1950\u5920\u5c69\u48b4\u21a1\u0274\u5761\u49bb\u0036\u12a9\u2921`,
    lztext_2: `\u7480\u0188\u21d8\u4022\u1b93\u0bac\u47ac\u2354\u70a9\u0086\u0873\u73e3\u21e0\u70a4\u6312\u6e8e\u27c7\u44a4\u4724\u0020\u0020`,
    lztext_3: '',
    lztext_4: '',
  });
  await chrome.storage.local.set({ profilesTableUpdated: epochTime - 10 });

  await updateProfilesTable();

  // Indexed DB profiles should be updated.
  const dbManager = new DBManager('aesr');
  await dbManager.open();
  let items;
  await dbManager.transaction('profiles', async dbTable => {
    items = await dbTable.all();
  });
  await dbManager.close();
  assert(items, [{
    profilePath: "[COMPLEX];000001",
    name: 'main',
    aws_account_id: '111122223333',
  }, {
    profilePath: "main;000002",
    name: 'develop',
    color: 'eeffdd',
    aws_account_id: '111122223334',
    role_name: 'a-member',
  }]);
}

export async function updateProfilesTableNoUpdateTest() {
  const dbManager = new DBManager('aesr');
  await dbManager.open();
  await dbManager.transaction('profiles', dbTable => dbTable.truncate());
  await dbManager.close();

  // Sync storage update datetime and local DB update datetime match.
  await chrome.storage.sync.set({
    configStorageArea: 'sync',
    profilesLastUpdated: 1693526400,
    lztext: "<dummy>",
    lztext_1: '',
    lztext_2: '',
    lztext_3: '',
    lztext_4: '',
  });
  await chrome.storage.local.set({ profilesTableUpdated: 1693526400 });

  await updateProfilesTable();

  // Indexed DB profiles shouldn't be updated.
  await dbManager.open();
  let items;
  await dbManager.transaction('profiles', async dbTable => {
    items = await dbTable.all();
  });
  await dbManager.close();
  assert(items.length, 0); // not registered
}
