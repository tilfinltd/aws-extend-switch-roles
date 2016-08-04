# AWS Extend Switch Roles

Extend your AWS IAM switching roles for chrome extension

## Configuration

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
