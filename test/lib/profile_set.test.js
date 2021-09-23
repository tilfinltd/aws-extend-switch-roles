import { expect } from 'chai';
import { createProfileSet } from '../../src/lib/profile_set.js';

describe('createProfileSet', () => {
  describe('when userInfo is on logged-in', () => {
    it('base aws account is number', () => {
      const profiles = [
        {
          profile: 'target1',
          aws_account_id: '111122223334',
          role_name: 'role1',
          source_profile: 'base1',
        },
        {
          profile: 'target2',
          aws_account_id: '111122223335',
          role_name: 'role2',
          source_profile: 'base1',
        },
        { profile: 'base1', aws_account_id: '111100003333' },
        { profile: 'base2', aws_account_id: '222200001111' },
        {
          profile: 'targetex',
          aws_account_id: '333300001112',
          role_name: 'roleex',
        },
        {
          profile: 'target4',
          aws_account_id: '222200001112',
          role_name: 'role3',
          source_profile: 'base2',
        },
      ];
      const userInfo = {
        loginDisplayNameAccount: '1111-0000-3333',
        loginDisplayNameUser: 'a-user',
        roleDisplayNameAccount: undefined,
        roleDisplayNameUser: undefined,
      };
      const settings = { showOnlyMatchingRoles: false };

      const profileSet = createProfileSet(profiles, userInfo, settings);

      expect(profileSet.destProfiles[0].profile).to.eq('targetex');
      expect(profileSet.destProfiles[1].profile).to.eq('target1');
      expect(profileSet.destProfiles[2].profile).to.eq('target2');
    });

    it('base account with target_role_name', () => {
      const profiles = [
        {
          profile: 'target1',
          aws_account_id: '111122223334',
          role_name: 'Role1',
          source_profile: 'base1',
        },
        {
          profile: 'target2',
          aws_account_id: '111122223335',
          source_profile: 'base1',
        },
        {
          profile: 'base1',
          aws_account_id: '111100003333',
          target_role_name: 'DefaultRole',
        },
        { profile: 'base2', aws_account_id: '222200001111' },
        {
          profile: 'targetex',
          aws_account_id: '333300001112',
          role_name: 'roleex',
        },
        {
          profile: 'target4',
          aws_account_id: '222200001112',
          role_name: 'role3',
          source_profile: 'base2',
        },
      ];
      const userInfo = {
        loginDisplayNameAccount: '1111-0000-3333',
        loginDisplayNameUser: 'a-user',
        roleDisplayNameAccount: undefined,
        roleDisplayNameUser: undefined,
      };
      const settings = { showOnlyMatchingRoles: false };

      const profileSet = createProfileSet(profiles, userInfo, settings);

      expect(profileSet.destProfiles[0].profile).to.eq('targetex');
      expect(profileSet.destProfiles[1]).to.deep.include({
        profile: 'target1',
        role_name: 'Role1',
      });
      expect(profileSet.destProfiles[2]).to.deep.include({
        profile: 'target2',
        role_name: 'DefaultRole',
      });
    });

    it('base account with target_region', () => {
      const profiles = [
        {
          profile: 'target1',
          aws_account_id: '111122223334',
          role_name: 'Role1',
          source_profile: 'base1',
        },
        {
          profile: 'target2',
          aws_account_id: '111122223335',
          source_profile: 'base1',
        },
        {
          profile: 'base1',
          aws_account_id: '111100003333',
          target_region: 'DefaultRegion',
        },
        { profile: 'base2', aws_account_id: '222200001111' },
        {
          profile: 'targetex',
          aws_account_id: '333300001112',
          role_name: 'roleex',
        },
        {
          profile: 'target4',
          aws_account_id: '222200001112',
          role_name: 'role3',
          source_profile: 'base2',
        },
        {
          profile: 'target5',
          aws_account_id: '333300001113',
          region: 'OverrideRegion',
          source_profile: 'base1',
        },
      ];
      const userInfo = {
        loginDisplayNameAccount: '1111-0000-3333',
        loginDisplayNameUser: 'a-user',
        roleDisplayNameAccount: undefined,
        roleDisplayNameUser: undefined,
      };
      const settings = { showOnlyMatchingRoles: false };

      const profileSet = createProfileSet(profiles, userInfo, settings);

      expect(profileSet.destProfiles[0].profile).to.eq('targetex');
      expect(profileSet.destProfiles[1]).to.deep.include({
        profile: 'target1',
        region: 'DefaultRegion',
      });
      expect(profileSet.destProfiles[2]).to.deep.include({
        profile: 'target2',
        region: 'DefaultRegion',
      });
      expect(profileSet.destProfiles[3]).to.deep.include({
        profile: 'target5',
        region: 'OverrideRegion',
      });
    });

    it('base aws account is alias', () => {
      const profiles = [
        { profile: 'base1', aws_account_id: 'my-base-alias' },
        {
          profile: 'target1',
          aws_account_id: '111133334445',
          role_name: 'role1',
          source_profile: 'base1',
        },
        {
          profile: 'target2',
          aws_account_id: '111133334446',
          role_name: 'role2',
          source_profile: 'base1',
        },
      ];
      const userInfo = {
        loginDisplayNameAccount: 'my-base-alias',
        loginDisplayNameUser: 'a-user',
        roleDisplayNameAccount: undefined,
        roleDisplayNameUser: undefined,
      };
      const settings = { showOnlyMatchingRoles: false };

      const profileSet = createProfileSet(profiles, userInfo, settings);

      expect(profileSet.destProfiles[0].profile).to.eq('target1');
      expect(profileSet.destProfiles[1].profile).to.eq('target2');
    });

    it('showOnlyMatchingRoles is true', () => {
      const profiles = [
        {
          profile: 'independence',
          aws_account_id: '111122223333',
          role_name: 'independence_role',
        },
        { profile: 'base-a', aws_account_id: '555511112222' },
        {
          profile: 'a-stg',
          aws_account_id: '555511113333',
          role_name: 'roleA',
          source_profile: 'base-a',
          color: '00ddff',
        },
        {
          profile: 'a-prod',
          aws_account_id: '555511114444',
          role_name: 'roleA',
          source_profile: 'base-a',
          region: 'ap-northwest-1',
        },
        {
          profile: 'a-dev',
          aws_account_id: '555511111111',
          role_name: 'roleDev',
          source_profile: 'base-a',
        },
        { profile: 'base-b', aws_account_id: '666611112222' },
        {
          profile: 'b-stg',
          aws_account_id: '666611113333',
          role_name: 'roleB',
          source_profile: 'base-b',
        },
        {
          profile: 'b-prod',
          aws_account_id: '666611114444',
          role_name: 'roleB',
          source_profile: 'base-b',
          color: 'ffcc333',
        },
      ];
      const userInfo = {
        loginDisplayNameAccount: '5555-1111-2222',
        loginDisplayNameUser: 'roleA/a-user',
        roleDisplayNameAccount: '5555-1111-4444',
        roleDisplayNameUser: 'roleA',
      };
      const settings = { showOnlyMatchingRoles: true };

      const profileSet = createProfileSet(profiles, userInfo, settings);

      expect(profileSet.destProfiles.length).to.eq(3);
      expect(profileSet.destProfiles[0]).to.deep.include({
        profile: 'independence',
        role_name: 'independence_role',
      });
      expect(profileSet.destProfiles[1]).to.deep.include({
        profile: 'a-stg',
        role_name: 'roleA',
      });
      expect(profileSet.destProfiles[2]).to.deep.include({
        profile: 'a-prod',
        role_name: 'roleA',
      });
    });
  });

  describe('when userInfo is on switched', () => {
    it('base aws account is number', () => {
      const profiles = [
        {
          profile: 'target1',
          aws_account_id: 'tilfin',
          role_name: 'role1',
          source_profile: 'base1',
        },
        {
          profile: 'target2',
          aws_account_id: '111122223335',
          role_name: 'role2',
          source_profile: 'base1',
        },
        { profile: 'base1', aws_account_id: '111100003333' },
        { profile: 'base2', aws_account_id: '222200001111' },
        {
          profile: 'targetex',
          aws_account_id: '333300001112',
          role_name: 'roleex',
        },
        {
          profile: 'target4',
          aws_account_id: '222200001112',
          role_name: 'role3',
          source_profile: 'base2',
        },
      ];
      const userInfo = {
        loginDisplayNameAccount: '1111-0000-3333',
        loginDisplayNameUser: 'a-user',
        roleDisplayNameAccount: 'tilfin',
        roleDisplayNameUser: 'role1',
      };
      const settings = { showOnlyMatchingRoles: false };

      const profileSet = createProfileSet(profiles, userInfo, settings);

      expect(profileSet.destProfiles[0].profile).to.eq('targetex');
      expect(profileSet.destProfiles[1].profile).to.eq('target1');
      expect(profileSet.destProfiles[2].profile).to.eq('target2');
    });

    it('base aws account is alias', () => {
      const profiles = [
        { profile: 'base1', aws_account_id: 'my-base-alias' },
        {
          profile: 'target1',
          aws_account_id: '111133334445',
          role_name: 'role1',
          source_profile: 'base1',
        },
        {
          profile: 'target2',
          aws_account_id: '111133334446',
          role_name: 'role2',
          source_profile: 'base1',
        },
      ];
      const userInfo = {
        loginDisplayNameAccount: 'my-base-alias',
        loginDisplayNameUser: 'a-user',
        roleDisplayNameAccount: '1111-3333-4446',
        roleDisplayNameUser: 'role2',
      };
      const settings = { showOnlyMatchingRoles: false };

      const profileSet = createProfileSet(profiles, userInfo, settings);

      expect(profileSet.destProfiles[0].profile).to.eq('target1');
      expect(profileSet.destProfiles[1].profile).to.eq('target2');
    });

    it('showOnlyMatchingRoles is true', () => {
      const profiles = [
        {
          profile: 'independence',
          aws_account_id: '111122223333',
          role_name: 'independence_role',
        },
        { profile: 'base-a', aws_account_id: '555511112222' },
        {
          profile: 'a-stg',
          aws_account_id: '555511113333',
          role_name: 'roleA',
          source_profile: 'base-a',
          color: '00ddff',
        },
        {
          profile: 'a-prod',
          aws_account_id: '555511114444',
          role_name: 'roleA',
          source_profile: 'base-a',
          region: 'ap-northwest-1',
        },
        {
          profile: 'a-dev',
          aws_account_id: '555511111111',
          role_name: 'roleDev',
          source_profile: 'base-a',
        },
        { profile: 'base-b', aws_account_id: '666611112222' },
        {
          profile: 'b-stg',
          aws_account_id: '666611113333',
          role_name: 'roleB',
          source_profile: 'base-b',
        },
        {
          profile: 'b-prod',
          aws_account_id: '666611114444',
          role_name: 'roleB',
          source_profile: 'base-b',
          color: 'ffcc333',
        },
      ];
      const userInfo = {
        loginDisplayNameAccount: '5555-1111-2222',
        loginDisplayNameUser: 'roleA',
        roleDisplayNameAccount: '5555-1111-4444',
        roleDisplayNameUser: 'roleA',
      };
      const settings = { showOnlyMatchingRoles: true };

      const profileSet = createProfileSet(profiles, userInfo, settings);

      expect(profileSet.destProfiles.length).to.eq(3);
      expect(profileSet.destProfiles[0]).to.deep.include({
        profile: 'independence',
        role_name: 'independence_role',
      });
      expect(profileSet.destProfiles[1]).to.deep.include({
        profile: 'a-stg',
        role_name: 'roleA',
      });
      expect(profileSet.destProfiles[2]).to.deep.include({
        profile: 'a-prod',
        role_name: 'roleA',
      });
    });
  });
});
