# Quick open AWS
### Forked from [tilfinltd/aws-extend-switch-roles](https://github.com/tilfinltd/aws-extend-switch-roles)

### List of modifications
- [x] Edit name
- [x] Build and load extension
- [x] Open an account
- [x] Switch accounts
- [x] Open URI `console.aws/ec2/` instead of `console.aws/`
- [x] Unit tests still pass after my edit
- [x] Remove the update notice
- [x] Add debug logs

### How does AESR work ?
- popup.js
  - window.onload = func(){ ... }
    - main()
      - getCurrentTab().then()
        - if url.host.endsWith('.aws.amazon.com')
          - executeAction(tab.id, action='loadInfo', data={})
            - return chrome.tabs.sendMessage(tabId, { action, data })
          - .then(userInfo)
            - if (userInfo)
              - loadFormList(tab.url, userInfo, tab.id)
                - charge des profiles
                - appelle renderRoleList()
                  - appelle getCurrentURL()
                  - on définit le callback `listItemOnSelect()`
                    - qui appelle `sendSwitchRole(tabId, data)`
                      - qui `executeAction()` sur notre `tabId` avec l'event `'switch'` et les `{data}`
              - document.getElementById('main').style.display = 'block'
                → displays anchor `main` from `popup.html`

            - else → `Failed to fetch user info from the AWS Management Console page`
        - else → `You'll see the role list here when the current tab is AWS Management Console page.`

- popup.html
  - anchor `main` (div)
    - anchor `roleFilter` (input)
    - anchor `roleList` (ul)

### For later:
- [ ] Remove golden key configuration, redirect to AESR
- [ ] Allow auto-assume last role
- [ ] Simplify UI
- [ ] Add icons for the list of services
