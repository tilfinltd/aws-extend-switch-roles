import { expect } from 'chai';
import { CurrentContext } from './current_context.js';

describe('CurrentContext', () => {
  const defaultSettings = { showOnlyMatchingRoles: false };

  describe('when userInfo is on logged-in', () => {
    describe('when login account is number', () => {
      const userInfo = {
        loginDisplayNameAccount: '1111-0000-3333',
        loginDisplayNameUser: 'a-user',
        roleDisplayNameAccount: undefined,
        roleDisplayNameUser: undefined,
      };

      it('returns baseAccount with hyphens removed, login user as loginRole', () => {
        const ctx = new CurrentContext(userInfo, defaultSettings);

        expect(ctx.baseAccount).to.eq('111100003333');
        expect(ctx.loginRole).to.eq('a-user');
      });
    });

    describe('when login account is alias', () => {
      const userInfo = {
        loginDisplayNameAccount: 'my-base-alias',
        loginDisplayNameUser: 'b-user',
        roleDisplayNameAccount: undefined,
        roleDisplayNameUser: undefined,
      };

      it('returns alias as baseAccount, login user as loginRole', () => {
        const ctx = new CurrentContext(userInfo, defaultSettings);

        expect(ctx.baseAccount).to.eq('my-base-alias');
        expect(ctx.loginRole).to.eq('b-user');
        expect(ctx.filterByTargetRole).to.be.null;
      });
    });

    describe('when login user contains role name', () => {
      const userInfo = {
        loginDisplayNameAccount: '6666-1111-2222',
        loginDisplayNameUser: 'entry-role1/a-user',
        roleDisplayNameAccount: undefined,
        roleDisplayNameUser: undefined,
      };

      it('returns baseAccount, options with loginRole', () => {
        const ctx = new CurrentContext(userInfo, defaultSettings);

        expect(ctx.baseAccount).to.eq('666611112222');
        expect(ctx.loginRole).to.eq('entry-role1');
        expect(ctx.filterByTargetRole).to.be.null;
      });

      describe('when showOnlyMatchingRoles is true', () => {
        it('returns baseAccount, options with loginRole and filterByTargetRole', () => {
          const ctx = new CurrentContext(userInfo, { showOnlyMatchingRoles: true });

          expect(ctx.baseAccount).to.eq('666611112222');
          expect(ctx.loginRole).to.eq('entry-role1');
          expect(ctx.filterByTargetRole).to.eq('entry-role1');
        });
      });
    });

    describe('when login user contains AWS SSO permission set', () => {
      const userInfo = {
        loginDisplayNameAccount: '7777-1111-2222',
        loginDisplayNameUser: 'AWSReservedSSO_custom_permssion-set_0123456789abcdef/tilfin-sso',
        roleDisplayNameAccount: undefined,
        roleDisplayNameUser: undefined,
      };

      it('returns baseAccount, options with loginRole', () => {
        const ctx = new CurrentContext(userInfo, defaultSettings);

        expect(ctx.baseAccount).to.eq('777711112222');
        expect(ctx.loginRole).to.eq('custom_permssion-set');
        expect(ctx.filterByTargetRole).to.be.null;
      });

      describe('when showOnlyMatchingRoles is true', () => {
        it('returns baseAccount, options with loginRole and filterByTargetRole', () => {
          const ctx = new CurrentContext(userInfo, { showOnlyMatchingRoles: true });

          expect(ctx.baseAccount).to.eq('777711112222');
          expect(ctx.loginRole).to.eq('custom_permssion-set');
          expect(ctx.filterByTargetRole).to.eq('custom_permssion-set');
        });
      });
    });

    describe('when prism', () => {
      const userInfo = {
        loginDisplayNameAccount: '1111-0000-4444',
        loginDisplayNameUser: 'a1-user',
        roleDisplayNameAccount: null,
        roleDisplayNameUser: null,
        prism: true,
      };

      it('returns baseAccount with hyphens removed, login user as loginRole', () => {
        const ctx = new CurrentContext(userInfo, defaultSettings);

        expect(ctx.baseAccount).to.eq('111100004444');
        expect(ctx.loginRole).to.eq('a1-user');
      });
    })
  });

  describe('when userInfo is on switched', () => {
    const userInfo = {
      loginDisplayNameAccount: '1111-0000-3333',
      loginDisplayNameUser: 'd-user',
      roleDisplayNameAccount: 'tilfin',
      roleDisplayNameUser: 'role1',
    };

    describe('when login account is number', () => {
      it('returns baseAccount, options with loginRole', () => {
        const ctx = new CurrentContext(userInfo, defaultSettings);

        expect(ctx.baseAccount).to.eq('111100003333');
        expect(ctx.loginRole).to.eq('d-user');
        expect(ctx.filterByTargetRole).to.be.null;
      });
    });

    describe('when login account is alias', () => {
      const userInfo = {
        loginDisplayNameAccount: 'your-base-alias',
        loginDisplayNameUser: 'e-user',
        roleDisplayNameAccount: '1111-3333-4446',
        roleDisplayNameUser: 'role2',
      };

      it('returns baseAccount, options with loginRole', () => {
        const ctx = new CurrentContext(userInfo, defaultSettings);

        expect(ctx.baseAccount).to.eq('your-base-alias');
        expect(ctx.loginRole).to.eq('e-user');
        expect(ctx.filterByTargetRole).to.be.null;
      });
    });

    describe('when showOnlyMatchingRoles is true', () => {
      const userInfo = {
        loginDisplayNameAccount: '5555-1111-2222',
        loginDisplayNameUser: 'roleA',
        roleDisplayNameAccount: '5555-1111-4444',
        roleDisplayNameUser: 'roleB',
      };

      it('returns baseAccount, options with loginRole and filterByTargetRole', () => {
        const ctx = new CurrentContext(userInfo, { showOnlyMatchingRoles: true });

        expect(ctx.baseAccount).to.eq('555511112222');
        expect(ctx.loginRole).to.eq('roleA');
        expect(ctx.filterByTargetRole).to.eq('roleB');
      });
    });

    describe('when login user contains AWS SSO permission set', () => {
      const userInfo = {
        loginDisplayNameAccount: 'my-company',
        loginDisplayNameUser: 'AWSReservedSSO_ccpermssion-set_0123456789abcdef/sso',
        roleDisplayNameAccount: 'projectX',
        roleDisplayNameUser: 'admin',
      };

      it('returns baseAccount, options with loginRole', () => {
        const ctx = new CurrentContext(userInfo, defaultSettings);

        expect(ctx.baseAccount).to.eq('my-company');
        expect(ctx.loginRole).to.eq('ccpermssion-set');
        expect(ctx.filterByTargetRole).to.be.null;
      });

      describe('when showOnlyMatchingRoles is true', () => {
        it('returns baseAccount, options with loginRole and filterByTargetRole', () => {
          const ctx = new CurrentContext(userInfo, { showOnlyMatchingRoles: true });

          expect(ctx.baseAccount).to.eq('my-company');
          expect(ctx.loginRole).to.eq('ccpermssion-set');
          expect(ctx.filterByTargetRole).to.eq('admin');
        });
      });
    });

    describe('when prism', () => {
      const prismUserInfo = {
        ...userInfo,
        prism: true,
      }

      it('returns roleDisplayNameAccount as baseAccount, roleDisplayNameUser as loginRole', () => {
        const ctx = new CurrentContext(prismUserInfo, defaultSettings);

        expect(ctx.baseAccount).to.eq('tilfin');
        expect(ctx.loginRole).to.eq('role1');
        expect(ctx.filterByTargetRole).to.be.null;
      });
    })
  });
});
