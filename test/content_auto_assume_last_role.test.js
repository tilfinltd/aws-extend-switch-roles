describe('Auto assume last assumed role on content script', () => {
  it('triggers clicking the submit button of target role form', (done) => {
    loadFixtures('awsmc-iam', 'data');
    document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
    chrome.storage.sync.data.autoAssumeLastRole = true;
    chrome.storage.sync.data.lastRole_555511112222_tilfin = '555511113333_stg-role';
    extendIAMFormList();
    const form = document.querySelector('#awsc-username-menu-recent-roles li:nth-child(7)')
    form.onsubmit = () => {
      done();
      return false;
    }
  })

  context('hides histories', () => {
    it('triggers clicking the submit button of target role form', (done) => {
      loadFixtures('awsmc-iam', 'data');
      document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
      chrome.storage.sync.data.hidesHistory = true;
      chrome.storage.sync.data.autoAssumeLastRole = true;
      chrome.storage.sync.data.lastRole_555511112222_tilfin = '555511113333_stg-role';
      extendIAMFormList();
      const form = document.querySelector('#awsc-username-menu-recent-roles li:nth-child(3)')
      form.onsubmit = () => {
        done();
        return false;
      }
    })
  })

  context('not autoAssumeLastRole', () => {
    it('does not trigger clicking any submit button', (done) => {
      loadFixtures('awsmc-iam', 'data');
      document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
      chrome.storage.sync.data.autoAssumeLastRole = false;
      chrome.storage.sync.data.lastRole_555511112222_tilfin = '555511113333_stg-role';
      extendIAMFormList();
      const form = document.querySelector('#awsc-username-menu-recent-roles li:nth-child(7)')
      form.onsubmit = () => {
        done('must not occurr');
        return false;
      }
      done();
    })
  })

  context('has assumed role', () => {
    it('clears on clicking exit', (done) => {
      loadFixtures('awsmc-iam-switched', 'data');
      document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
      chrome.storage.sync.data.autoAssumeLastRole = true;
      chrome.storage.sync.data.lastRole_555511112222_tilfin = '555511113333_stg-role';
      extendIAMFormList();
      const form = document.getElementById('awsc-exit-role-form');
      form.addEventListener('submit', function(e) {
        expect(chrome.storage.sync.data.lastRole_555511112222_tilfin).to.null;
        e.preventDefault(); 
        done();
      });
      form.querySelector('input[type="submit"]').click();
    })
  })
})
