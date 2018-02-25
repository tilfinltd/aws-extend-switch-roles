# AWS Extend Switch Roles

[![Build Status](https://travis-ci.org/tilfin/aws-extend-switch-roles.svg?branch=master)](https://travis-ci.org/tilfin/aws-extend-switch-roles)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jpmkfafbacpgapdghgdpembnojdlgkdl.svg)](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?utm_source=github)
[![Firefox Add-on](https://img.shields.io/amo/v/aws-extend-switch-roles3.svg)](https://addons.mozilla.org/ja/firefox/addon/aws-extend-switch-roles3/)

Extend your AWS IAM switching roles by Chrome extension or Firefox add-on

Switch roll history does not remain only 5 maximum on the AWS Management Console.
This extension extends to show more switch roles by loading your aws configuration.
The bottom of the console header is emphasized with your specified color if you assume a cross account role.

- Supports Chrome Sync

## Install

[AWS Extend Switch Roles - Chrome Web Store](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?utm_source=github)

[AWS Extend Switch Roles :: Add-ons for Firefox](https://addons.mozilla.org/ja/firefox/addon/aws-extend-switch-roles3/)

## Configuration

Click Browser button, edit your profile settings to text area in popup form and save.

Supports ~/.aws/config format and like ~/.aws/credentials

### Simple Configuration
The simplest configuration is for multiple **target roles** when you always intend to show the whole list.  **Target roles** can be expressed with a 'role_arn' or with both 'aws_account_id' and 'role_name'.  An optional 'color' parameter can also be used to specify an RGB hex value without prefix '#'.

```
[profile marketingadmin]
role_arn = arn:aws:iam::123456789012:role/marketingadmin
color = ffaaee

[anotheraccount]
aws_account_id = 987654321987
role_name = anotherrole
color=bbeeff
```

### Complex Configuration
More complex configurations involve multiple AWS accounts and/or organizations.

- A profile that has only `aws_account_id` (without a role_name) is defined as **base account**.

- **If your account is aliased, the alias will be shown in the role dropdown after 'Account:'.  You MUST use that alias as the aws_account_id for the base account instead of the numerical account id or your configuration won't work as expected.**

- A **target role** is associated with a **base account** by the **target role** specifying a 'source_profile'.

- As above, **target roles** can be expressed with a 'role_arn' or with both 'aws_account_id' and 'role_name' and can optionally pass a 'color' parameter.

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
```

If you sign-in a base account, target roles of the other base accounts are excluded.

The 'Show only matching roles' setting is for use with more sophisticated account structures where you're using AWS Organizations with multiple accounts along with AWS Federated Logins via something like Active Directory or Google GSuite.  Common practice is to have a role in the master account that is allowed to assume a role of the same name in other member accounts.  Checking this box means that if you're logged in to the 'Developer' role in the master account, only member accounts with a role_arn ending in 'role/Developer' will be shown.  You won't see roles that your current role can't actually assume.

## Settings

- Can hide original role history (Show only roles in the configuration)
- Can hide the account_id for each profile
- Can filter to only show profiles with roles that match your role in your master account

## Appearance

![Screen Shot 1](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_1_960x600.png)

![Screen Shot 2](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_2_960x600.png)

![Screen Shot 3](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_3_960x600.png)
