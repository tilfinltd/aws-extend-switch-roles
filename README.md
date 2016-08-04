# AWS Extend Switch Roles

Extend your AWS IAM switching roles by Chrome extension

## Install

Go to [AWS Extend Switch Roles - Chrome Web Store](https://chrome.google.com/webstore/detail/aws-extend-switch-roles/jpmkfafbacpgapdghgdpembnojdlgkdl?utm_source=github)

## Configuration

Click Browser button, edit your profile settings to text area in popup form and save.

Support ~/.aws/config format and like ~/.aws/credentials

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
![Screen Shot](https://github.com/tilfin/aws-extend-switch-roles/blob/images/Banner_920x680.png)
