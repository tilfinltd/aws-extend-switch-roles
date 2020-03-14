describe('ContentScripts', () => {
  context('when iam user have signed in with 5 histories', () => {
    it('load base aws account is number', () => {
      loadFixtures('awsmc-iam-switched');
      return extendIAMFormList().then(() => {

        expect(document.body.className.includes('user-type-federated')).to.be.true;
        expect(document.body.className.includes('user-type-iam')).to.be.false;
        expect(document.querySelectorAll('#awsc-username-menu-recent-roles li').length).to.eq(5);
      });
    })

    context('not hidesHistory', () => {
      context('base-a profile', () => {
        it('appends 4 roles but two of them already exist', () => {
          loadFixtures('awsmc-iam-switched', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
          return extendIAMFormList().then(() => {

            expect(document.body.className.includes('user-type-federated')).to.be.true;
            expect(document.body.className.includes('user-type-iam')).to.be.false;

            const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
            expect(roles.length).to.eq(8);
            expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('stg-role');
            expect(roles[0].querySelector('input[type="submit"]').value).to.eq('a-stg  |  555511113333');
            expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
            expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('independence_role');
            expect(roles[6].querySelector('input[name="roleName"]').value).to.eq('prod-role');
            expect(roles[6].querySelector('input[type="submit"]').value).to.eq('a-prod  |  555511114444');
          });
        })
      })
    })

    context('hidesHistory', () => {
      context('base-a profile', () => {
        it('hides histories and appends 4 roles', () => {
          loadFixtures('awsmc-iam-switched', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          return extendIAMFormList().then(() => {

            expect(document.body.className.includes('user-type-federated')).to.be.true;
            expect(document.body.className.includes('user-type-iam')).to.be.false;

            const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
            expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
            expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
            expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
            expect(roles[2].querySelector('input[type="submit"]').value).to.eq('a-stg  |  555511113333');
            expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
            expect(roles[3].querySelector('input[type="submit"]').value).to.eq('a-prod  |  555511114444');
          });
        })
      })

      context('base-b profile', () => {
        it('hides histories and appends 5 roles', () => {
          loadFixtures('awsmc-iam-switched', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          return extendIAMFormList().then(() => {

            expect(document.body.className.includes('user-type-federated')).to.be.true;
            expect(document.body.className.includes('user-type-iam')).to.be.false;

            const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
            expect(roles.length).to.eq(6);
            expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
            expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
            expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
            expect(roles[2].querySelector('input[type="submit"]').value).to.eq('b-stg  |  666611113333');
            expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
            expect(roles[3].querySelector('input[type="submit"]').value).to.eq('b-prod  |  666611114444');
            expect(roles[4].querySelector('input[name="roleName"]').value).to.eq('renpou');
            expect(roles[4].querySelector('input[type="submit"]').value).to.eq('b-renpou  |  666611115555');
            expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('prod-role-image');
            expect(roles[5].querySelector('input[type="submit"]').value).to.eq('b-prod-image  |  666611114444');
          });
        })
      })
    })

    context('hidesHistory and hidesAccountId', () => {
      context('base-b profile', () => {
        it('hides account id', () => {
          loadFixtures('awsmc-iam-switched', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          chrome.storage.sync.data.hidesAccountId = true;
          return extendIAMFormList().then(() => {

            expect(document.body.className.includes('user-type-federated')).to.be.true;
            expect(document.body.className.includes('user-type-iam')).to.be.false;

            const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
            expect(roles.length).to.eq(6);
            expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
            expect(roles[0].querySelector('input[type="submit"]').value).to.eq('independence');
            expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
            expect(roles[1].querySelector('input[type="submit"]').value).to.eq('history-contained');
            expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
            expect(roles[2].querySelector('input[type="submit"]').value).to.eq('b-stg');
            expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
            expect(roles[3].querySelector('input[type="submit"]').value).to.eq('b-prod');
            expect(roles[4].querySelector('input[name="roleName"]').value).to.eq('renpou');
            expect(roles[4].querySelector('input[type="submit"]').value).to.eq('b-renpou');
            expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('prod-role-image');
            expect(roles[5].querySelector('input[type="submit"]').value).to.eq('b-prod-image');
          });
        })
      })
    })

    context('showOnlyMatchingRoles', () => {
      it('filters b-roles by the same role name', () => {
        loadFixtures('awsmc-iam-switched', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        return extendIAMFormList().then(() => {

          expect(document.body.className.includes('user-type-federated')).to.be.true;
          expect(document.body.className.includes('user-type-iam')).to.be.false;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(6);
          expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[4].querySelector('input[name="roleName"]').value).to.eq('independence_role');
          expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('stg-role');
          expect(roles[5].querySelector('input[type="submit"]').value).to.eq('b-stg  |  666611113333');
        });
      })
    })

    context('hidesHistory and showOnlyMatchingRoles', () => {
      it('hides histories and filters b-roles by the same role name', () => {
        loadFixtures('awsmc-iam-switched', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.hidesHistory = true;
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        return extendIAMFormList().then(() => {

          expect(document.body.className.includes('user-type-federated')).to.be.true;
          expect(document.body.className.includes('user-type-iam')).to.be.false;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(3);
          expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
          expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
          expect(roles[2].querySelector('input[type="submit"]').value).to.eq('b-stg  |  666611113333');
        });
      })
    })
  })

  context('when federated user have signed in with 5 histories', () => {
    it('load base aws account is number', () => {
      loadFixtures('awsmc-federated-switched');
      return extendIAMFormList().then(() => {

        expect(document.body.className.includes('user-type-iam')).to.be.false;
        expect(document.body.className.includes('user-type-federated')).to.be.true;
        expect(document.querySelectorAll('#awsc-username-menu-recent-roles li').length).to.eq(5);
      });
    })

    context('not hidesHistory', () => {
      context('base-b profile', () => {
        it('hides histories and appends 5 roles', () => {
          loadFixtures('awsmc-federated-switched', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          return extendIAMFormList().then(() => {

            expect(document.body.className.includes('user-type-federated')).to.be.true;
            expect(document.body.className.includes('user-type-iam')).to.be.false;

            const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
            expect(roles.length).to.eq(6);
            expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
            expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
            expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
            expect(roles[2].querySelector('input[type="submit"]').value).to.eq('b-stg  |  666611113333');
            expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
            expect(roles[3].querySelector('input[type="submit"]').value).to.eq('b-prod  |  666611114444');
            expect(roles[4].querySelector('input[name="roleName"]').value).to.eq('renpou');
            expect(roles[4].querySelector('input[type="submit"]').value).to.eq('b-renpou  |  666611115555');
            expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('prod-role-image');
            expect(roles[5].querySelector('input[type="submit"]').value).to.eq('b-prod-image  |  666611114444');
          });
        })
      })
    })

    context('hidesHistory', () => {
      context('base-b profile', () => {
        it('hides histories and appends 5 roles', () => {
          loadFixtures('awsmc-federated-switched', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          return extendIAMFormList().then(() => {

            expect(document.body.className.includes('user-type-federated')).to.be.true;
            expect(document.body.className.includes('user-type-iam')).to.be.false;

            const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
            expect(roles.length).to.eq(6);
            expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
            expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
            expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
            expect(roles[2].querySelector('input[type="submit"]').value).to.eq('b-stg  |  666611113333');
            expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
            expect(roles[3].querySelector('input[type="submit"]').value).to.eq('b-prod  |  666611114444');
            expect(roles[4].querySelector('input[name="roleName"]').value).to.eq('renpou');
            expect(roles[4].querySelector('input[type="submit"]').value).to.eq('b-renpou  |  666611115555');
            expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('prod-role-image');
            expect(roles[5].querySelector('input[type="submit"]').value).to.eq('b-prod-image  |  666611114444');
          });
        })
      })
    })

    context('showOnlyMatchingRoles', () => {
      it('appends 3 roles but one of them already exists', () => {
        loadFixtures('awsmc-federated-switched', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        return extendIAMFormList().then(() => {

          expect(document.body.className.includes('user-type-federated')).to.be.true;
          expect(document.body.className.includes('user-type-iam')).to.be.false;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(6);
          expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('renpou');
          expect(roles[0].querySelector('input[type="submit"]').value).to.eq('b-renpou  |  666611115555');
          expect(roles[4].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('independence_role');
        });
      })
    })

    context('hidesHistory and showOnlyMatchingRoles', () => {
      it('appends 3 roles but one of them already exists', () => {
        loadFixtures('awsmc-federated-switched', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.hidesHistory = true;
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        return extendIAMFormList().then(() => {

          expect(document.body.className.includes('user-type-federated')).to.be.true;
          expect(document.body.className.includes('user-type-iam')).to.be.false;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(3);
          expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
          expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('renpou');
          expect(roles[2].querySelector('input[type="submit"]').value).to.eq('b-renpou  |  666611115555');
        });
      })
    })
  })
})
