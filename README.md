# Dear early donators and current supporters ![Golden Key](./icons/Icon_48x48_g.png)
You have a ticket to get the AESR Golden Key code. If you don't have it yet, please contact me.

### for my early donator via PayPal or Bitcoin
Please check *To those who have donated before* section of **Supporters** in the AESR pop-up menu of your browser.

### for current supporters (GitHub Sponsors)
Please check **Request for Contact Information** in https://github.com/sponsors/tilfinltd.

---

# AWS Extend Switch Roles

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jpmkfafbacpgapdghgdpembnojdlgkdl.svg)](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?utm_source=github)
[![Firefox Add-on](https://img.shields.io/amo/v/aws-extend-switch-roles3.svg)](https://addons.mozilla.org/ja/firefox/addon/aws-extend-switch-roles3/)
[![Edge Add-on](https://img.shields.io/badge/dynamic/json?label=edge%20add-on&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fdcflbohnocoeheondddeoknmgbngijbi)](https://microsoftedge.microsoft.com/addons/detail/aws-extend-switch-roles/dcflbohnocoeheondddeoknmgbngijbi)

Extend your AWS IAM switching roles by Chrome extension, Firefox add-on, or Edge add-on

Switch roll history only stores the last 5 roles (maximum) on the AWS Management Console.
This extension shows a menu of switchable roles that you can configure manually.

- Supports the Sync feature on all sorts of browsers
- Not support switching between AWS accounts you sign into with AWS SSO or SAML solution providers directly

### Development and Distribution Guideline

##### Minimizes required permissions and operates only on AWS Console pages
A browser plug-in goes with security risks. AWS Management Console allows you to manipulate your essential data.

##### Supports only the  latest version of each official browser
This extension does not restrict the use of other compatible browsers. The version restrictions are only due to the JavaScript language features used.

## Install

- [AWS Extend Switch Roles - Chrome Web Store](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?utm_source=github)
- [AWS Extend Switch Roles :: Add-ons for Firefox](https://addons.mozilla.org/firefox/addon/aws-extend-switch-roles3/)
- [AWS Extend Switch Roles - Microsoft Edge Addons](https://microsoftedge.microsoft.com/addons/detail/aws-extend-switch-roles/dcflbohnocoeheondddeoknmgbngijbi)

## Configuration

Left-click the extension, click "Configure", enter your configuration in the text box, and click "Save".
You can write the configuration in INI format like `~/.aws/config` or `~/.aws/credentials`.

### Simple Configuration
The simplest configuration is for multiple **target roles** when you always intend to show the whole list.  **Target roles** can be expressed with a `role_arn` or with both `aws_account_id` and `role_name`.

#### Optional parameters

* `color` - The RGB hex value (without the prefix '#') for the color of the header bottom border and around the current profile.
* `region` - Changing the region whenever switching the role if this parameter is specified.
* `image` - The uri of an image to use on top of any color attribute supplied. The color and image are not mutually exclusive.

```
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
```

### Complex Configuration
More complex configurations involve multiple AWS accounts and/or organizations.

- A profile specified by the `source_profile` of the others is defined as a **base account**.

- **If your account is aliased, the alias will be shown in the role dropdown after 'Account:'.  You MUST use that alias as the aws_account_id for the base account instead of the numerical account id or your configuration won't work as expected.**

- If an `role_name` is specified in a **base account** it will also check for the role that is used to login to AWS. This can be used to select a subset of accounts when you are using an SSO IdP to login to AWS.

- A **target role** is associated with a **base account** by its `source_profile` specifying the profile name of the base account.

- As above, **target roles** can be expressed with a `role_arn` or with both `aws_account_id` and `role_name` and can optionally pass the optional parameters.

- If `target_role_name` is set in **base account**, the value is provided as the default role name for each **target roles**.
- If `target_region` is set in **base account**, the value is provided as the default region for each **target roles**.

```
[organization1]
aws_account_id = your-account-alias

[Org1-Account1-Role1]
role_arn = arn:aws:iam::123456789012:role/Role1
source_profile = organization1

[Org1-Account1-Role2]
aws_account_id = 123456789012
role_name = Role2
source_profile = organization1

[Org1-Account2-Role1]
aws_account_id = 210987654321
role_name = Role1
source_profile = organization1

[baseaccount2]
aws_account_id = 000000000000

[Base2-Role1]
role_arn = arn:aws:iam::234567890123:role/Role1
source_profile = baseaccount2

[AnotherRole]
role_name = SomeOtherRole
aws_account_id = account-3-alias

;
; target_role_name example
;
[Org2-BaseAccount]
aws_account_id = 222200000000
target_role_name = Developer

[Org2-Account1-Developer]
aws_account_id = 222200001111
source_profile = Org2-BaseAccount

[Org2-Account2-Manager]
aws_account_id = 222200002222
role_name = Manager ; overrides target role name
source_profile = Org2-BaseAccount

;
; entry_role example
;
[Org3-BaseAccount1]
aws_account_id = 333300000000
entry_role = Entry-Role-1

[Org3-BaseAccount2]
aws_account_id = 333300000000
entry_role = Entry-Role-2

[Org3-Account1-Role1]
aws_account_id = 333300001111
role_name = Role1
source_profile = Org3-BaseAccount1

[Org2-Account2-Role2]
aws_account_id = 222200002222
role_name = Role2
source_profile = Org3-BaseAccount2
```

If you sign-in a base account, target roles of the other base accounts are excluded.

The 'Show only matching roles' setting is for use with more sophisticated account structures where you're using AWS Organizations with multiple accounts along with AWS Federated Logins via something like Active Directory or Google GSuite.  Common practice is to have a role in the master account that is allowed to assume a role of the same name in other member accounts.  Checking this box means that if you're logged in to the 'Developer' role in the master account, only member accounts with a role_arn ending in 'role/Developer' will be shown.  You won't see roles that your current role can't actually assume.

## Settings

- **Hide account id** hides the account_id for each profile.
- **Show only matching roles** filters to only show profiles with roles that match your role in your master account.
- ~~**Automatically assume last assumed role (Experimental)** automatically assumes last assumed role on the next sign-in if did not back to the base account and signed out.~~ **temporarily disabled**
- **Configuration storage** specifies which storage to save to. 'Sync' can automatically share it between browsers with your account but cannot store many profiles. 'Local' is the exact opposite of 'Sync.'

## Extension API

- **Config sender extension** allowed by the **ID** can send your switch roles configuration to this extension. **'Configuration storage' forcibly becomes 'Local' when the configuration is received from a config sender.** [See](https://github.com/tilfin/aws-extend-switch-roles/wiki/External-API#config-sender-extension) how to make your config sender extension.

## Supporters

<a href="https://classmethod.jp/" rel="noopener"><img alt="Classmethod, Inc." src="https://aesr.tilfin.com/supporters/img/classmethod.png" width="208" height="90"></a>
<a href="https://www.doit-intl.com/" rel="noopener"><img alt="Classmethod, Inc." src="https://aesr.tilfin.com/supporters/img/doitintl.png" width="208" height="90"></a>

## Appearance

![Screen Shot 1](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_1.png)

![Screen Shot 3](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_3_960x600.png)
