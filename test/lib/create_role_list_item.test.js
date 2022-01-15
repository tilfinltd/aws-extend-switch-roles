import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { createRoleListItem } from '../../src/lib/create_role_list_item.js';

describe('createRoleListItem', () => {
  let window;

  beforeEach(() => {
    const dom = new JSDOM(
      `<html>
         <body>
         </body>
       </html>`,
       { url: 'http://localhost' },
    );
    window = dom.window;
  });

  describe("profile has minimum properties", () => {
    it('returns li element', () => {
      const item = {
        profile: 'profileA',
        aws_account_id: '222233334444',
        role_name: 'roleA',
      }
      const url = 'https://console.aws.amazonaws.com/';
      const options = {};
      let handlerData = null;
      const li = createRoleListItem(window.document, item, url, '', options, (data) => { handlerData = data });

      const a = li.querySelector('a')
      expect(a.href).to.eq('http://localhost/#');
      expect(a.title).to.eq('roleA@222233334444');
      expect(a.dataset.profile).to.eq('profileA');
      expect(a.dataset.rolename).to.eq('roleA');
      expect(a.dataset.account).to.eq('222233334444');
      expect(a.dataset.displayname).to.eq('profileA  |  222233334444');
      expect(a.dataset.color).to.eq('aaaaaa');
      expect(a.dataset.redirecturi).to.eq('https%3A%2F%2Fconsole.aws.amazonaws.com%2F');
      expect(a.dataset.search).to.eq('profilea 222233334444');
      expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(170, 170, 170);"> \
</span>profileA<span class="suffixAccountId">222233334444</span>`);

      a.click();
      expect(handlerData).to.deep.eq({
        profile: 'profileA',
        rolename: 'roleA',
        account: '222233334444',
        color: 'aaaaaa',
        displayname: 'profileA  |  222233334444',
        search: 'profilea 222233334444',
        redirecturi: 'https%3A%2F%2Fconsole.aws.amazonaws.com%2F',
      });
    });
  });

  describe('profile has color', () => {
    it('returns li element', () => {
      const item = {
        profile: 'profile-b',
        aws_account_id: '000011115555',
        role_name: 'role-b',
        color: 'ffaa99',
      }
      const url = 'https://console.aws.amazonaws.com/?region=us-east-1';
      const li = createRoleListItem(window.document, item, url, {}, () => {});

      const a = li.querySelector('a')
      expect(a.title).to.eq('role-b@000011115555');
      expect(a.dataset.profile).to.eq('profile-b');
      expect(a.dataset.rolename).to.eq('role-b');
      expect(a.dataset.account).to.eq('000011115555');
      expect(a.dataset.displayname).to.eq('profile-b  |  000011115555');
      expect(a.dataset.color).to.eq('ffaa99');
      expect(a.dataset.redirecturi).to.eq('https%3A%2F%2Fconsole.aws.amazonaws.com%2F%3Fregion%3Dus-east-1');
      expect(a.dataset.search).to.eq('profile-b 000011115555');
      expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(255, 170, 153);"> \
</span>profile-b<span class="suffixAccountId">000011115555</span>`);
    });
  });

  describe('profile has image', () => {
    it('returns li element', () => {
      const item = {
        profile: 'prf',
        aws_account_id: '333344441111',
        role_name: 'img-role',
        image: '"https://www.exapmle.com/icon.png"',
      }
      const url = 'https://console.aws.amazonaws.com/?region=us-east-1';
      const li = createRoleListItem(window.document, item, url, 'us-east-1', {}, () => {});

      const a = li.querySelector('a')
      expect(a.innerHTML).to.eq(`<span class="headSquare" style="\
background-image: url(https://www.exapmle.com/icon.png);"> </span>prf<span class="suffixAccountId">333344441111</span>`);
    });
  });

  describe('profile has color and image', () => {
    it('returns li element', () => {
      const item = {
        profile: 'prf',
        aws_account_id: '333344441111',
        role_name: 'img-role',
        color: 'ffaa22',
        image: '"https://www.exapmle.com/icon.png"',
      }
      const url = 'https://console.aws.amazonaws.com/?region=us-east-1';
      const li = createRoleListItem(window.document, item, url, 'us-east-1', {}, () => {});

      const a = li.querySelector('a')
      expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(255, 170, 34); \
background-image: url(https://www.exapmle.com/icon.png);"> </span>prf<span class="suffixAccountId">333344441111</span>`);
    });
  });

  describe('profile has region', () => {
    it('returns li element', () => {
      const item = {
        profile: 'foo',
        aws_account_id: '111122225555',
        role_name: 'role-foo',
        region: 'us-west-2',
      }
      const url = 'https://console.aws.amazonaws.com/?region=ap-southeast-1';
      const li = createRoleListItem(window.document, item, url, 'ap-southeast-1', {}, () => {});

      const a = li.querySelector('a')
      expect(a.dataset.redirecturi).to.eq('https%3A%2F%2Fconsole.aws.amazonaws.com%2F%3Fregion%3Dus-west-2');
    });
  });

  describe('hidesAccountId is true', () => {
    it('returns li element', () => {
      const item = {
        profile: 'ProfileC',
        aws_account_id: '000011117777',
        role_name: 'role-C',
      }
      const url = 'https://console.aws.amazonaws.com/?region=us-east-1';
      const options = { hidesAccountId: true }
      const li = createRoleListItem(window.document, item, url, 'us-east-1', options, () => {});

      const a = li.querySelector('a')
      expect(a.title).to.eq('role-C@000011117777');
      expect(a.dataset.profile).to.eq('ProfileC');
      expect(a.dataset.rolename).to.eq('role-C');
      expect(a.dataset.account).to.eq('000011117777');
      expect(a.dataset.displayname).to.eq('ProfileC');
      expect(a.dataset.redirecturi).to.eq('https%3A%2F%2Fconsole.aws.amazonaws.com%2F%3Fregion%3Dus-east-1');
      expect(a.dataset.search).to.eq('profilec 000011117777');
      expect(a.innerHTML).to.eq(`<span class="headSquare" style="background-color: rgb(170, 170, 170);"> </span>ProfileC`);
    });
  });
});
