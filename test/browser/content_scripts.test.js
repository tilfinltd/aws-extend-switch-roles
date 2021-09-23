describe('ContentScripts', () => {
  context('when initial user have signed in', () => {
    beforeEach(() => {
      loadFixtures('awsmc-iam-initial', 'data');
    })

    it('does not run generateEmptyRoleList and awsc-username-menu-recent-roles does not exist', () => {
      expect(document.body.className.includes('user-type-iam')).to.be.true;
      expect(document.getElementById('awsc-username-menu-recent-roles')).to.be.null;
    })

    it('creates awsc-username-menu-recent-roles', () => {
      extendIAMFormList();
      expect(document.body.className.includes('user-type-iam')).to.be.true;
      expect(document.getElementById('awsc-username-menu-recent-roles')).to.exist;
    })
  })

  context('when iam user have signed in with 5 histories', () => {
    it('load base aws account is number', () => {
      loadFixtures('awsmc-iam');
      extendIAMFormList();

      expect(document.body.className.includes('user-type-iam')).to.be.true;
      expect(document.body.className.includes('user-type-federated')).to.be.false;
      expect(document.querySelectorAll('#awsc-username-menu-recent-roles li').length).to.eq(5);
    })

    context('not hidesHistory', () => {
      context('base profile is undefined', () => {
        it('appends 2 roles but one of them already exists', () => {
          loadFixtures('awsmc-iam', 'data');
          chrome.storage.sync.data.hidesHistory = false;
          extendIAMFormList();

          expect(document.body.className.includes('user-type-iam')).to.be.true;
          expect(document.body.className.includes('user-type-federated')).to.be.false;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(6);
          expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('independence_role');
        })
      })

      context('base-a profile', () => {
        it('hides base-b histories and appends 3 roles', () => {
          loadFixtures('awsmc-exclude-unrelated-profile-from-history', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
          chrome.storage.sync.data.hidesHistory = false;
          extendIAMFormList();

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(5);
          expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('stg-role_history');
          expect(roles[0].querySelector('input[type="submit"]').value).to.eq('a-stg');
          expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('independence_role');
          expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
          expect(roles[3].querySelector('input[type="submit"]').value).to.eq('a-prod  |  555511114444');
          expect(roles[4].querySelector('input[name="roleName"]').value).to.eq('stg-role-image');
          expect(roles[4].querySelector('input[type="submit"]').value).to.eq('a-stg-image  |  555511113333');
        })
      })
    })

    context('hidesHistory', () => {
      context('base profile is undefined', () => {
        it('hides histories and appends 2 roles', () => {
          loadFixtures('awsmc-iam', 'data');
          chrome.storage.sync.data.hidesHistory = true;
          extendIAMFormList();

          expect(document.body.className.includes('user-type-iam')).to.be.true;
          expect(document.body.className.includes('user-type-federated')).to.be.false;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(2);
          expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
          expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
        })
      })

      context('base-a profile', () => {
        it('hides histories and appends 4 roles', () => {
          loadFixtures('awsmc-iam', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          extendIAMFormList();

          expect(document.body.className.includes('user-type-iam')).to.be.true;
          expect(document.body.className.includes('user-type-federated')).to.be.false;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(5);
          expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
          expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
          expect(roles[2].querySelector('input[type="submit"]').value).to.eq('a-stg  |  555511113333');
          expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
          expect(roles[3].querySelector('input[type="submit"]').value).to.eq('a-prod  |  555511114444');
          expect(roles[4].querySelector('input[name="roleName"]').value).to.eq('stg-role-image');
          expect(roles[4].querySelector('input[type="submit"]').value).to.eq('a-stg-image  |  555511113333');
        })
      })

      context('base-b profile', () => {
        it('hides histories and appends 5 roles', () => {
          loadFixtures('awsmc-iam', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          extendIAMFormList();

          expect(document.body.className.includes('user-type-iam')).to.be.true;
          expect(document.body.className.includes('user-type-federated')).to.be.false;

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
        })
      })
    })

    context('hidesHistory and hidesAccountId', () => {
      context('base-b profile', () => {
        it('hides account id', () => {
          loadFixtures('awsmc-iam', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          chrome.storage.sync.data.hidesAccountId = true;
          extendIAMFormList();

          expect(document.body.className.includes('user-type-iam')).to.be.true;
          expect(document.body.className.includes('user-type-federated')).to.be.false;

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
        })
      })
    })

    context('showOnlyMatchingRoles', () => {
      it('does not affect', () => {
        loadFixtures('awsmc-iam', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        extendIAMFormList();

        expect(document.body.className.includes('user-type-iam')).to.be.true;
        expect(document.body.className.includes('user-type-federated')).to.be.false;

        const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
        expect(roles.length).to.eq(10);
        expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
        expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('independence_role');
        expect(roles[6].querySelector('input[name="roleName"]').value).to.eq('stg-role');
        expect(roles[6].querySelector('input[type="submit"]').value).to.eq('b-stg  |  666611113333');
        expect(roles[7].querySelector('input[name="roleName"]').value).to.eq('prod-role');
        expect(roles[7].querySelector('input[type="submit"]').value).to.eq('b-prod  |  666611114444');
        expect(roles[8].querySelector('input[name="roleName"]').value).to.eq('renpou');
        expect(roles[8].querySelector('input[type="submit"]').value).to.eq('b-renpou  |  666611115555');
        expect(roles[9].querySelector('input[name="roleName"]').value).to.eq('prod-role-image');
        expect(roles[9].querySelector('input[type="submit"]').value).to.eq('b-prod-image  |  666611114444');
      })
    })

    context('hidesHistory and showOnlyMatchingRoles', () => {
      it('does not affect', () => {
        loadFixtures('awsmc-iam', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.hidesHistory = true;
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        extendIAMFormList();

        expect(document.body.className.includes('user-type-iam')).to.be.true;
        expect(document.body.className.includes('user-type-federated')).to.be.false;

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
      })
    })
  })

  context('when federated user have signed in with 5 histories', () => {
    it('load base aws account is number', () => {
      loadFixtures('awsmc-federated');
      extendIAMFormList();

      expect(document.body.className.includes('user-type-iam')).to.be.false;
      expect(document.body.className.includes('user-type-federated')).to.be.true;
      expect(document.querySelectorAll('#awsc-username-menu-recent-roles li').length).to.eq(5);
    })

    context('not hidesHistory', () => {
      context('base profile is undefined', () => {
        it('appends 2 roles but one of them already exists', () => {
          loadFixtures('awsmc-federated', 'data');
          extendIAMFormList();

          expect(document.body.className.includes('user-type-iam')).to.be.false;
          expect(document.body.className.includes('user-type-federated')).to.be.true;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(6);
          expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('independence_role');
        })
      })
    })

    context('hidesHistory', () => {
      context('base profile is undefined', () => {
        it('hides histories and appends 2 roles', () => {
          loadFixtures('awsmc-federated', 'data');
          chrome.storage.sync.data.hidesHistory = true;
          extendIAMFormList();

          expect(document.body.className.includes('user-type-iam')).to.be.false;
          expect(document.body.className.includes('user-type-federated')).to.be.true;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(2);
          expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
          expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
        })
      })

      context('base-a profile', () => {
        it('hides histories and appends 4 roles', () => {
          loadFixtures('awsmc-federated', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          extendIAMFormList();

          expect(document.body.className.includes('user-type-federated')).to.be.true;
          expect(document.body.className.includes('user-type-iam')).to.be.false;

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(5);
          expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
          expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
          expect(roles[2].querySelector('input[type="submit"]').value).to.eq('a-stg  |  555511113333');
          expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
          expect(roles[3].querySelector('input[type="submit"]').value).to.eq('a-prod  |  555511114444');
          expect(roles[4].querySelector('input[name="roleName"]').value).to.eq('stg-role-image');
          expect(roles[4].querySelector('input[type="submit"]').value).to.eq('a-stg-image  |  555511113333');
        })
      })

      context('base-b profile', () => {
        it('hides histories and appends 5 roles', () => {
          loadFixtures('awsmc-federated', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
          chrome.storage.sync.data.hidesHistory = true;
          extendIAMFormList();

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
        })
      })

      context('base-c-1 profile', () => {
        it('hides histories and appends 3 roles', () => {
          loadFixtures('awsmc-federated', 'data');
          document.getElementById('awsc-login-display-name-account').textContent = '7777-1111-2222';
          document.getElementById('awsc-login-display-name-user').textContent = 'entry-role-c-1';
          chrome.storage.sync.data.hidesHistory = true;
          extendIAMFormList();

          const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
          expect(roles.length).to.eq(4);
          expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
          expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
          expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
          expect(roles[2].querySelector('input[type="submit"]').value).to.eq('c-1-stg  |  888811113333');
          expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
          expect(roles[3].querySelector('input[type="submit"]').value).to.eq('c-1-prod  |  888811114444');
        })
      })
    })

    context('showOnlyMatchingRoles', () => {
      it('appends 3 roles but one of them already exists', () => {
        loadFixtures('awsmc-federated', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        extendIAMFormList();

        expect(document.body.className.includes('user-type-federated')).to.be.true;
        expect(document.body.className.includes('user-type-iam')).to.be.false;

        const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
        expect(roles.length).to.eq(7);
        expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
        expect(roles[5].querySelector('input[name="roleName"]').value).to.eq('independence_role');
        expect(roles[6].querySelector('input[name="roleName"]').value).to.eq('renpou');
        expect(roles[6].querySelector('input[type="submit"]').value).to.eq('b-renpou  |  666611115555');
      })
    })

    context('hidesHistory and showOnlyMatchingRoles', () => {
      it('appends 3 roles', () => {
        loadFixtures('awsmc-federated', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.hidesHistory = true;
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        extendIAMFormList();

        expect(document.body.className.includes('user-type-federated')).to.be.true;
        expect(document.body.className.includes('user-type-iam')).to.be.false;

        const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
        expect(roles.length).to.eq(3);
        expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
        expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
        expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('renpou');
        expect(roles[2].querySelector('input[type="submit"]').value).to.eq('b-renpou  |  666611115555');
      })
    })

    context('hidesHistory, showOnlyMatchingRoles and hidesAccountId', () => {
      it('appends 3 roles and nothing breaks', () => {
        loadFixtures('awsmc-federated', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.hidesHistory = true;
        chrome.storage.sync.data.hidesAccountId = true;
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        extendIAMFormList();

        expect(document.body.className.includes('user-type-federated')).to.be.true;
        expect(document.body.className.includes('user-type-iam')).to.be.false;

        const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
        expect(roles.length).to.eq(3);
        expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('independence_role');
        expect(roles[1].querySelector('input[name="roleName"]').value).to.eq('contained_history_role');
        expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('renpou');
      })
    })
    
    context('including the AccountId in Search', () => {
      it('appends 3 roles then filter', () => {
        loadFixtures('awsmc-federated', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.hidesHistory = true;
        chrome.storage.sync.data.hidesAccountId = false;
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        extendIAMFormList();
        
        const filter = document.querySelector('#AESR_RoleFilter')      
        filter.value = "666611115555"
        filter.dispatchEvent(new KeyboardEvent('keyup',{'key':'5'}))

        const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li[style*="display: block;"]'))
        expect(roles.length).to.eq(1);
        expect(roles[0].querySelector('input[name="roleName"]').value).to.eq('renpou');        
      })
    })

    context('not including the AccountId in Search', () => {
      it('appends 3 roles then filter', () => {
        loadFixtures('awsmc-federated', 'data');
        document.getElementById('awsc-login-display-name-account').textContent = '6666-1111-2222';
        chrome.storage.sync.data.hidesHistory = true;
        chrome.storage.sync.data.hidesAccountId = true;
        chrome.storage.sync.data.showOnlyMatchingRoles = true;
        extendIAMFormList();
        
        const filter = document.querySelector('#AESR_RoleFilter')      
        filter.value = "666611115555"
        filter.dispatchEvent(new KeyboardEvent('keyup',{'key':'5'}))

        const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li[style*="display: block;"]'))
        expect(roles.length).to.eq(0);
      })
    })    
  })
})
