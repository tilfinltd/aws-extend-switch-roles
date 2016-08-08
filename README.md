# AWS Extend Switch Roles

Extend your AWS IAM switching roles by Chrome extension

Switch roll history does not remain only 5 maximum on the AWS Management Console.
This extension extends to show more switch roles by loading your aws configuration.
The bottom of the console header is emphasized with your specified color if you assume a cross account role.

- Supports Chrome Sync

## Install

Go to [AWS Extend Switch Roles - Chrome Web Store](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?utm_source=github)

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

## Appearance

![Screen Shot 1](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_1_960x600.png)

![Screen Shot 2](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_2_960x600.png)

![Screen Shot 3](https://github.com/tilfin/aws-extend-switch-roles/blob/images/ScreenShot_3_960x600.png)
