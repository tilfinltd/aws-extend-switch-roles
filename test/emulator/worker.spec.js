import { testInWorker } from './fixtures.js';

testInWorker('externalConfigReceived tests', async () => {
  await self.__tests__.externalConfigReceivedTest();
  await self.__tests__.externalConfigReceivedFailureTest();
})

testInWorker('findProfilesTable tests', async () => {
  await self.__tests__.findTargetProfilesTest();
})

testInWorker('updateProfilesTable tests', async () => {
  for (const test of [
    self.__tests__.updateProfilesTableMigrateSyncTest,
    self.__tests__.updateProfilesTableMigrateLocalTest,
    self.__tests__.updateProfilesTableUpdateSyncTest,
    self.__tests__.updateProfilesTableNoUpdateTest,
  ]) {
    await test();
    await self.__tests__.clean();
  }
})
