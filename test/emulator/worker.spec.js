import { testInWorker } from './fixtures.js';

testInWorker('externalConfigReceived tests', async () => {
  await self.__tests__.externalConfigReceivedTest();
  await self.__tests__.externalConfigReceivedFailureTest();
})

testInWorker('updateProfilesTable tests', async () => {
  await self.__tests__.updateProfilesTableMigrateTest();
  await self.__tests__.updateProfilesTableUpdateTest();
  await self.__tests__.updateProfilesTableNoUpdateTest();
})
