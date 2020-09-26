### V2 that supports the new UI for AWS MC becomes to show the role list in the menu shown when you click the extension icon.
Notice: https://github.com/tilfin/aws-extend-switch-roles/issues/156#issuecomment-698073728

---

# AWS Extend Switch Roles

[![Build Status](https://travis-ci.org/tilfin/aws-extend-switch-roles.svg?branch=master)](https://travis-ci.org/tilfin/aws-extend-switch-roles)
[![codecov](https://codecov.io/gh/tilfin/aws-extend-switch-roles/branch/master/graph/badge.svg)](https://codecov.io/gh/tilfin/aws-extend-switch-roles)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jpmkfafbacpgapdghgdpembnojdlgkdl.svg)](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?utm_source=github)
[![Firefox Add-on](https://img.shields.io/amo/v/aws-extend-switch-roles3.svg)](https://addons.mozilla.org/ja/firefox/addon/aws-extend-switch-roles3/)

Extend your AWS IAM switching roles by Chrome extension or Firefox add-on

Switch roll history does not remain only 5 maximum on the AWS Management Console.
This extension give you show all of switch roles from a browse menu by loading your aws configuration.

- Supports Chrome Sync

## Install

[AWS Extend Switch Roles - Chrome Web Store](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?utm_source=github)

[AWS Extend Switch Roles :: Add-ons for Firefox](https://addons.mozilla.org/firefox/addon/aws-extend-switch-roles3/)

## Configuration

Click Browser button, edit your profile settings to text area in popup form and save.

Supports ~/.aws/config format and like ~/.aws/credentials

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

- A profile that has only `aws_account_id` (without a `role_name`) is defined as **base account**.

- **If your account is aliased, the alias will be shown in the role dropdown after 'Account:'.  You MUST use that alias as the aws_account_id for the base account instead of the numerical account id or your configuration won't work as expected.**

- A **target role** is associated with a **base account** by the **target role** specifying a `source_profile`.

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
```

If you sign-in a base account, target roles of the other base accounts are excluded.

The 'Show only matching roles' setting is for use with more sophisticated account structures where you're using AWS Organizations with multiple accounts along with AWS Federated Logins via something like Active Directory or Google GSuite.  Common practice is to have a role in the master account that is allowed to assume a role of the same name in other member accounts.  Checking this box means that if you're logged in to the 'Developer' role in the master account, only member accounts with a role_arn ending in 'role/Developer' will be shown.  You won't see roles that your current role can't actually assume.

## Settings

- **Hide account id** hides the account_id for each profile.
- ~~**Show only matching roles** filters to only show profiles with roles that match your role in your master account.~~ **temporarily disabled**
- ~~**Automatically assume last assumed role (Experimental)** automatically assumes last assumed role on the next sign-in if did not back to the base account and signed out.~~ **temporarily disabled**

## Extension API

- **Config sender extension** allowed by the **ID** can send your switch roles configuration to this extension. [See](https://github.com/tilfin/aws-extend-switch-roles/wiki/External-API#config-sender-extension) how to make your config sender extension.

## Donation

Would you like to support this extension? I gladly accept small donations.

[![Donate $5 via PayPal.Me](https://img.shields.io/badge/Donate-%245%20via%20PayPal.Me-blue.svg?longCache=true&style=popout&logo=paypal)](https://www.paypal.me/toshitilfin/5USD)

![Donate with bitcoin](https://img.shields.io/badge/Donate-bitcoin-orange.svg?longCache=true&style=plastic&logo=bitcoin) [Bitcoin: 1C346W5vXaH7DjCyUUYeCj4GuXMTbNbLjk](bitcoin:1C346W5vXaH7DjCyUUYeCj4GuXMTbNbLjk)

## Appearance

![Screen Shot 1](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_1.png)

![Screen Shot 3](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_3_960x600.png)
