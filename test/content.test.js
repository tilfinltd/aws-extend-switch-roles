describe('Profile', () => {
  afterEach(() => {
    fixture.cleanup()
  });

  it('load base aws account is number', () => {
    fixture.load('aws-account.html');

    var profile = new Profile([
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

    expect(profile.destProfiles[0].profile).to.eq('targetex');
    expect(profile.destProfiles[1].profile).to.eq('target1');
    expect(profile.destProfiles[2].profile).to.eq('target2');
    expect(profile.excludedNames[0]).to.eq('target4');
  });

  it('load base aws account is alias', () => {
    fixture.load('aws-account-alias.html');

    var profile = new Profile([
        { profile: 'base1', aws_account_id: 'my-base-alias' },
        { profile: 'target1', aws_account_id: '111133334445',
          role_name: 'role1', source_profile: 'base1' },
        { profile: 'target2', aws_account_id: '111133334446',
          role_name: 'role2', source_profile: 'base1' }
      ]);

    expect(profile.destProfiles[0].profile).to.eq('target1');
    expect(profile.destProfiles[1].profile).to.eq('target2');
    expect(profile.excludedNames.length).to.eq(0);
  });
});
