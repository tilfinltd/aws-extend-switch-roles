describe('Content redirect_uri', () => {
  const REDIRECT_URI = 'https://eu-west-1.console.aws.amazon.com/console/home?region=eu-west-1#';

  const emulateReplacingRedirectURIOfForm = () => {
    const forms = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles form'));
    forms.forEach(form => {
      form.redirect_uri.value = encodeURIComponent(REDIRECT_URI);
    });
  };

  beforeEach(() => {
    loadFixtures('awsmc-iam', 'data');
    document.getElementById('awsc-login-display-name-account').textContent = '5555-1111-2222';
    chrome.storage.sync.data.hidesHistory = true;
    extendIAMFormList();
  })

  context('clicking a-prod of list when base-a profile', () => {
    it('changes the region of redirect_uri', () => {
      expect(document.body.className.includes('user-type-iam')).to.be.true;
      expect(document.body.className.includes('user-type-federated')).to.be.false;

      const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
      expect(roles.length).to.eq(4);
      expect(roles[3].querySelector('input[name="roleName"]').value).to.eq('prod-role');
      expect(roles[3].querySelector('input[type="submit"]').value).to.eq('a-prod  |  555511114444');

      emulateReplacingRedirectURIOfForm();

      const form = document.querySelector('#awsc-username-menu-recent-roles li:nth-child(4) form');
      form.onsubmit();
      expect(form.redirect_uri.value).to.eq(encodeURIComponent('https://ap-northwest-1.console.aws.amazon.com/console/home?region=ap-northwest-1#'));
    })
  })

  context('clicking a-stg of list when base-a profile', () => {
    it('does not change the region of redirect_uri', () => {
      expect(document.body.className.includes('user-type-iam')).to.be.true;
      expect(document.body.className.includes('user-type-federated')).to.be.false;

      const roles = Array.from(document.querySelectorAll('#awsc-username-menu-recent-roles li'))
      expect(roles.length).to.eq(4);
      expect(roles[2].querySelector('input[name="roleName"]').value).to.eq('stg-role');
      expect(roles[2].querySelector('input[type="submit"]').value).to.eq('a-stg  |  555511113333');

      emulateReplacingRedirectURIOfForm();

      const form = document.querySelector('#awsc-username-menu-recent-roles li:nth-child(2) form');
      form.onsubmit();
      expect(form.redirect_uri.value).to.eq(encodeURIComponent(REDIRECT_URI));
    })
  })
})
