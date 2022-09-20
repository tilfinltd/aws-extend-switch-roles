import { expect } from 'chai'
import { loadAwsConfig } from '../../src/lib/load_aws_config.js'

describe('loadAwsConfig', () => {
  describe('Simple Configuration', () => {
    it('load profiles', () => {
      const results = loadAwsConfig(`\
[profile marketingadmin]
role_arn = arn:aws:iam::123456789012:role/marketingadmin
color = ffaaee

[anotheraccount]
aws_account_id = 987654321987
role_name = anotherrole
region=ap-northeast-1

[athirdaccount]
aws_account_id = 987654321988
role_name = athirdrole
image = "https://via.placeholder.com/150"
`);
      expect(results[0]).to.deep.equal({ profile: 'marketingadmin', aws_account_id: '123456789012', role_name: 'marketingadmin', color: 'ffaaee' });
      expect(results[1]).to.deep.equal({ profile: 'anotheraccount', aws_account_id: '987654321987', role_name: 'anotherrole', region: 'ap-northeast-1' });
      expect(results[2]).to.deep.equal({ profile: 'athirdaccount', aws_account_id: '987654321988', role_name: 'athirdrole', image: '"https://via.placeholder.com/150"' });
    })
  })

  describe('Complex Configuration', () => {
    it('load profiles', () => {
      const results = loadAwsConfig(`\
[organization1]
aws_account_id = your-account-alias

[Org1-Account1-Role1]
role_arn = arn:aws:iam::123456789012:role/Role1
source_profile = organization1

[Org1-Account1-Role2]
aws_account_id = 123456789013
role_name = Role2
source_profile = organization1

[baseaccount2]
aws_account_id = 000000000000

[profile Base2/Role1]
role_arn = arn:aws:iam::234567890123:role/Role1
source_profile = baseaccount2

[AnotherRole]
role_name = SomeOtherRole#comment
aws_account_id = account-3-alias
`);
      expect(results[0]).to.deep.equal({ profile: 'organization1', aws_account_id: 'your-account-alias' });
      expect(results[1]).to.deep.equal({ profile: 'Org1-Account1-Role1', aws_account_id: '123456789012', role_name: 'Role1', source_profile: 'organization1' });
      expect(results[2]).to.deep.equal({ profile: 'Org1-Account1-Role2', aws_account_id: '123456789013', role_name: 'Role2', source_profile: 'organization1' });
      expect(results[3]).to.deep.equal({ profile: 'baseaccount2', aws_account_id: '000000000000' });
      expect(results[4]).to.deep.equal({ profile: 'Base2/Role1', aws_account_id: '234567890123', role_name: 'Role1', source_profile: 'baseaccount2' });
      expect(results[5]).to.deep.equal({ profile: 'AnotherRole', aws_account_id: 'account-3-alias', role_name: 'SomeOtherRole' });
    })
  })

  describe('comments and spaces are everywhere', () => {
    it('trims all comments and spaces', () => {
      const results = loadAwsConfig(`\
[profile a]# comment
; comment
role_arn = arn:aws:iam::123456789012:role/roleA  #

  [profile B] # comment
role_arn = arn:aws:iam::123456789012:role/role-b;
  # comment
[profileC];comment
# comment
  role_arn = arn:aws:iam::123456789012:role/c  ;comment
  ; comment
`);
      expect(results[0]).to.deep.equal({ profile: 'a', aws_account_id: '123456789012', role_name: 'roleA' });
      expect(results[1]).to.deep.equal({ profile: 'B', aws_account_id: '123456789012', role_name: 'role-b' });
      expect(results[2]).to.deep.equal({ profile: 'profileC', aws_account_id: '123456789012', role_name: 'c' });
    })
  })

  describe('when section has duplicate key', () => {
    it('throws an error whose message is "duplicate definition of ~"', () => {      
      expect(() => {
        loadAwsConfig(`
          [profile A]
          role_arn = arn:aws:iam::123456789012:role/roleA

          ;[ignored]
          role_arn = arn:aws:iam::123456789012:role/role-B
        `);
      }).to.throw(`duplicate definition of role_arn`);
    })
  })

  describe('when section is not declared', () => {
    it('throws an error whose message is "profile is not declared ~"', () => {      
      expect(() => {
        loadAwsConfig(`
          role_arn = arn:aws:iam::123456789012:role/roleA

          [nextprofile]
          role_arn = arn:aws:iam::123456789012:role/role-B
        `);
      }).to.throw(`profile is not declared before the key property definitions`);
    })
  })

  describe('when key property line is wrong', () => {
    it('throws an error whose message is "invalid key property definition"', () => {      
      expect(() => {
        loadAwsConfig(`
          [a]
          key property does not contain equal
        `);
      }).to.throw(`invalid key property definition`);
    })
  })

  describe('when profile does not specify AWS account id', () => {
    it('throws an error whose message is "Found a profile definition which does not include an AWS account id"', () => {      
      expect(() => {
        loadAwsConfig(`
          [b]
          key=property
        `);
      }).to.throw(`Found a profile definition which does not include an AWS account id`);
    })
  })
})
