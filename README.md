# AWS Extend Switch Roles

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

```
[profile marketingadmin]
role_arn = arn:aws:iam::123456789012:role/marketingadmin
color = ffaaee

[anotheraccount]
aws_account_id = 987654321987
role_name = anotherrole
color=bbeeff
```

- Required `role_arn` or (`aws_account_id` and `role_name`)
- Optional `color` that is RGB hex value without prefix `#`

### Multi base accounts
- A profile that has only `aws_account_id` is defined as **base account**.
- A profile that has `source_profile` is defined as **target account**.
- A **base account** is associated with **target account**s.

```
[baseaccount1]
aws_account_id = 000000000000

[targetaccount1]
role_arn = arn:aws:iam::123456789012:role/targetaccount
source_profile = baseaccount1

[baseaccount2]
aws_account_id = your-alias-name

[targetaccount2]
role_arn = arn:aws:iam::234567890123:role/targetaccount
source_profile = baseaccount2
```

If you sign-in a base account, target accounts of the other base accounts are excluded.

## Settings

- Can hide original role history (Show only roles in the configuration)

## Appearance

![Screen Shot 1](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_1_960x600.png)

![Screen Shot 2](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_2_960x600.png)

![Screen Shot 3](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_3_960x600.png)
