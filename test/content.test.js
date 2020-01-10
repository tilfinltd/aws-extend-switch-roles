describe('Profile', () => {
  afterEach(() => {
    fixture.cleanup()
  });

  context('aws account is number', () => {
    beforeEach(() => {
      fixture.load('aws-account.html');
    })

    it('load base aws account is number', () => {
        let profileSet = new ProfileSet([
          { profile: 'target1', aws_account_id: '111122223334',
            role_name: 'role1', source_profile: 'base1' },
          { profile: 'target2', aws_account_id: '111122223335',
            role_name: 'role2', source_profile: 'base1' },
          { profile: 'base1', aws_account_id: '111100003333' },
          { profile: 'base2', aws_account_id: '222200001111' },
          { profile: 'targetex', aws_account_id: '333300001112',
            role_name: 'roleex' },
          { profile: 'target4', aws_account_id: '222200001112',
            role_name: 'role3', source_profile: 'base2' }
        ]);
  
      expect(profileSet.destProfiles[0].profile).to.eq('targetex');
      expect(profileSet.destProfiles[1].profile).to.eq('target1');
      expect(profileSet.destProfiles[2].profile).to.eq('target2');
      expect(profileSet.excludedNames[0]).to.eq('target4');
    })

    it('loads the configuration that contains base account with target_role_name', () => {
      let profileSet = new ProfileSet([
        { profile: 'target1', aws_account_id: '111122223334',
          role_name: 'Role1', source_profile: 'base1' },
        { profile: 'target2', aws_account_id: '111122223335',
          source_profile: 'base1' },
        { profile: 'base1', aws_account_id: '111100003333', target_role_name: 'DefaultRole' },
        { profile: 'base2', aws_account_id: '222200001111' },
        { profile: 'targetex', aws_account_id: '333300001112',
          role_name: 'roleex' },
        { profile: 'target4', aws_account_id: '222200001112',
          role_name: 'role3', source_profile: 'base2' }
      ]);
  
      expect(profileSet.destProfiles[0].profile).to.eq('targetex');
      expect(profileSet.destProfiles[1]).to.deep.include({ profile: 'target1', role_name: 'Role1' });
      expect(profileSet.destProfiles[2]).to.deep.include({ profile: 'target2', role_name: 'DefaultRole' });
      expect(profileSet.excludedNames[0]).to.eq('target4');
    })

    it('loads the configuration that contains base account with target_region', () => {
      let profileSet = new ProfileSet([
        { profile: 'target1', aws_account_id: '111122223334',
          role_name: 'Role1', source_profile: 'base1' },
        { profile: 'target2', aws_account_id: '111122223335',
          source_profile: 'base1' },
        { profile: 'base1', aws_account_id: '111100003333', target_region: 'DefaultRegion' },
        { profile: 'base2', aws_account_id: '222200001111' },
        { profile: 'targetex', aws_account_id: '333300001112',
          role_name: 'roleex' },
        { profile: 'target4', aws_account_id: '222200001112',
          role_name: 'role3', source_profile: 'base2' }
      ]);

      expect(profileSet.destProfiles[0].profile).to.eq('targetex');
      expect(profileSet.destProfiles[1]).to.deep.include({ profile: 'target1', region: 'DefaultRegion' });
      expect(profileSet.destProfiles[2]).to.deep.include({ profile: 'target2', region: 'DefaultRegion' });
      expect(profileSet.excludedNames[0]).to.eq('target4');
    })
  })

  it('load base aws account is alias', () => {
    fixture.load('aws-account-alias.html');

    let profileSet = new ProfileSet([
        { profile: 'base1', aws_account_id: 'my-base-alias' },
        { profile: 'target1', aws_account_id: '111133334445',
          role_name: 'role1', source_profile: 'base1' },
        { profile: 'target2', aws_account_id: '111133334446',
          role_name: 'role2', source_profile: 'base1' }
      ]);

    expect(profileSet.destProfiles[0].profile).to.eq('target1');
    expect(profileSet.destProfiles[1].profile).to.eq('target2');
    expect(profileSet.excludedNames.length).to.eq(0);
  });
});
