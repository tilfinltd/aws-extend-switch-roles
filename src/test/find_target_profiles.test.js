import { DBManager } from '../js/lib/db.js';
import { findTargetProfiles } from '../js/lib/target_profiles.js';

export async function findTargetProfilesTest() {
  const dbManager = new DBManager('aesr');
  await dbManager.open();
  await dbManager.transaction('profiles', async dbTable => {
    await dbTable.insert({ profilePath: '[COMPLEX];000001', name: 'a-company', aws_account_id: '111100000000', target_region: 'ap-northeast-1' });
    await dbTable.insert({ profilePath: '[COMPLEX];000002', name: 'b-company', aws_account_id: '222200000000', aws_account_alias: 'bc', });
    await dbTable.insert({ profilePath: '[COMPLEX];000003', name: 'c-company', aws_account_id: '333300000000', target_role_name: 'c-member' });
    await dbTable.insert({ profilePath: '[COMPLEX];000004', name: 'd-company', aws_account_id: '444400000000', role_name: 'd-user' });
    await dbTable.insert({ profilePath: 'a-company;000005', name: 'saas-stg', aws_account_id: '111100001111', role_name: 'developer', color: '112233', region: 'us-west-2' });
    await dbTable.insert({ profilePath: 'a-company;000006', name: 'saas-prd', aws_account_id: '111100002222', role_name: 'developer', color: '4455FF' });
    await dbTable.insert({ profilePath: 'a-company;000007', name: 'saas-prd-admin', aws_account_id: '111100003333', role_name: 'admin', image: 'https://example.com/s.png' });
    await dbTable.insert({ profilePath: 'b-company;000008', name: 'project1', aws_account_id: '222200001111', role_name: 'manager' });
    await dbTable.insert({ profilePath: 'c-company;000009', name: 'service/prd', aws_account_id: '333300001111', role_name: 'maintainer' });
    await dbTable.insert({ profilePath: 'c-company;000010', name: 'service/dev', aws_account_id: '333300002222' });
    await dbTable.insert({ profilePath: 'd-company;000011', name: 'proj-D', aws_account_id: '444400001111', role_name: 'd-admin' });
    await dbTable.insert({ profilePath: '[SINGLE];000012', name: 'test', aws_account_id: '999900000000', role_name: 'entry-user', image: 'https://example.com/t.png' });
    await dbTable.insert({ profilePath: '[SINGLE];000013', name: 'SandBox', aws_account_id: '999900001111', role_name: 'user' });
  });
  await dbManager.close();

  // matching aws_account_id
  const resultsA1 = await findTargetProfiles({ baseAccount: '111100000000', loginRole: 'a-user' });
  assert(resultsA1, [
    // not applying target_region to region because region is specified
    { profilePath: 'a-company;000005', name: 'saas-stg', aws_account_id: '111100001111', role_name: 'developer', color: '112233', region: 'us-west-2' },
    // applying target_region to region
    { profilePath: 'a-company;000006', name: 'saas-prd', aws_account_id: '111100002222', role_name: 'developer', color: '4455FF', region: 'ap-northeast-1' },
    { profilePath: 'a-company;000007', name: 'saas-prd-admin', aws_account_id: '111100003333', role_name: 'admin', image: 'https://example.com/s.png', region: 'ap-northeast-1' },
    { profilePath: '[SINGLE];000012', name: 'test', aws_account_id: '999900000000', role_name: 'entry-user', image: 'https://example.com/t.png' },
    { profilePath: '[SINGLE];000013', name: 'SandBox', aws_account_id: '999900001111', role_name: 'user' },
  ]);

  // showOnlyMatchingRoles is true
  const resultsA2 = await findTargetProfiles({ baseAccount: '111100000000', loginRole: 'a-user', filterByTargetRole: 'developer' });
  assert(resultsA2, [
    // narrow down to only profiles with the same role_name
    { profilePath: 'a-company;000005', name: 'saas-stg', aws_account_id: '111100001111', role_name: 'developer', color: '112233', region: 'us-west-2' },
    { profilePath: 'a-company;000006', name: 'saas-prd', aws_account_id: '111100002222', role_name: 'developer', color: '4455FF', region: 'ap-northeast-1' },
    { profilePath: '[SINGLE];000012', name: 'test', aws_account_id: '999900000000', role_name: 'entry-user', image: 'https://example.com/t.png' },
    { profilePath: '[SINGLE];000013', name: 'SandBox', aws_account_id: '999900001111', role_name: 'user' },
  ]);

  const resultsB1 = await findTargetProfiles({ baseAccount: '222200000000', loginRole: 'b-user' });
  assert(resultsB1, [
    { profilePath: 'b-company;000008', name: 'project1', aws_account_id: '222200001111', role_name: 'manager' },
    { profilePath: '[SINGLE];000012', name: 'test', aws_account_id: '999900000000', role_name: 'entry-user', image: 'https://example.com/t.png' },
    { profilePath: '[SINGLE];000013', name: 'SandBox', aws_account_id: '999900001111', role_name: 'user' },
  ]);

  // matching aws_account_alias
  const resultsB2 = await findTargetProfiles({ baseAccount: 'bc', loginRole: 'b-user' });
  assert(resultsB2, [
    { profilePath: 'b-company;000008', name: 'project1', aws_account_id: '222200001111', role_name: 'manager' },
    { profilePath: '[SINGLE];000012', name: 'test', aws_account_id: '999900000000', role_name: 'entry-user', image: 'https://example.com/t.png' },
    { profilePath: '[SINGLE];000013', name: 'SandBox', aws_account_id: '999900001111', role_name: 'user' },
  ]);

  const resultsC = await findTargetProfiles({ baseAccount: '333300000000', loginRole: 'c-user' });
  assert(resultsC, [
    // target_role_name is ignored when role_name is specified
    { profilePath: 'c-company;000009', name: 'service/prd', aws_account_id: '333300001111', role_name: 'maintainer' },
    // applying target_role_name to role_name
    { profilePath: 'c-company;000010', name: 'service/dev', aws_account_id: '333300002222', role_name: 'c-member' },
    { profilePath: '[SINGLE];000012', name: 'test', aws_account_id: '999900000000', role_name: 'entry-user', image: 'https://example.com/t.png' },
    { profilePath: '[SINGLE];000013', name: 'SandBox', aws_account_id: '999900001111', role_name: 'user' },
  ]);

  // matching aws_account_* and role_name
  const resultsD1 = await findTargetProfiles({ baseAccount: '444400000000', loginRole: 'd-user' });
  assert(resultsD1, [
    { profilePath: 'd-company;000011', name: 'proj-D', aws_account_id: '444400001111', role_name: 'd-admin' },
    { profilePath: '[SINGLE];000012', name: 'test', aws_account_id: '999900000000', role_name: 'entry-user', image: 'https://example.com/t.png' },
    { profilePath: '[SINGLE];000013', name: 'SandBox', aws_account_id: '999900001111', role_name: 'user' },
  ]);

  // no matching aws_account_* and role_name
  const resultsD2 = await findTargetProfiles({ baseAccount: '444400000000', loginRole: 'd-manager' });
  assert(resultsD2, [
    { profilePath: '[SINGLE];000012', name: 'test', aws_account_id: '999900000000', role_name: 'entry-user', image: 'https://example.com/t.png' },
    { profilePath: '[SINGLE];000013', name: 'SandBox', aws_account_id: '999900001111', role_name: 'user' },
  ]);

  // no matching aws_account_*
  const resultsX = await findTargetProfiles({ baseAccount: '000000000000', loginRole: 'x-user' });
  assert(resultsX, [
    { profilePath: '[SINGLE];000012', name: 'test', aws_account_id: '999900000000', role_name: 'entry-user', image: 'https://example.com/t.png' },
    { profilePath: '[SINGLE];000013', name: 'SandBox', aws_account_id: '999900001111', role_name: 'user' },
  ]);
}
