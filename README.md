# Quick open AWS
### Forked from [tilfinltd/aws-extend-switch-roles](https://github.com/tilfinltd/aws-extend-switch-roles)

### List of modifications
- [x] Edit name
- [x] Build and load extension
- [x] Open an account
- [x] Switch accounts
- [ ] Open `iam.console.aws` instead of `console.aws`

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
              - document.getElementById('main').style.display = 'block'
                → displays anchor `main` from `popup.html`

            - else → `Failed to fetch user info from the AWS Management Console page`
        - else → `You'll see the role list here when the current tab is AWS Management Console page.`

- popup.html
  - anchor `main` (div)
    - anchor `roleFilter` (input)
    - anchor `roleList` (ul)

### For later:
- [ ] Run tests
- [ ] Remove golden key configuration, redirect to AESR
- [ ] Allow auto-assume last role
- [ ] Simplify UI
- [ ] Edit icons
- [ ] Remove the update notice
- [ ] Write logs
