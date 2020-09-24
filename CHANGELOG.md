Changelog
=========

## v2.0.3 (2020/09/24)

- Change showing the Role List UI from a browser extension menu outside the AWS Console page
- Abolish 'Hide original role history'
- Abolish attaching color line on the bottom of the AWS Console header
- Abolish inserting the profile image into the AWS Console header even if the image parameter is defined
- Abolish adjusting the color contrast of the display name in the AWS Console header
- Disable 'Show only matching roles' temporarily
- Disable 'Automatically assume last assumed role (Experimental)' temporarily
- Change the color of this extension icon

## v0.15.0 (2020/05/16)

- Support AWS China Partition (thanks to @int32bit)


## v0.14.0 (2019/07/24)

- Support Config sender extension of External API


## v0.13.1 (2019/06/24)

- Fix that the switch role definition in the same AWS Account ID causes the list to be empty


## v0.13.0 (2019/06/23)

- Support 'target_role_name' parameter that expresses the role name for target roles, on base account
- Fix excluding unrelated profiles from role history


## v0.12.1 (2019/05/10)

- Enlarge profile image icon
- Fix configuration textarea not synchronized


## v0.12.0 (2019/03/27)

- Textbox filtering supports by account id (thanks to @heldersepu)
- Fix auto switch last role feature
- Support AWS GovCloud (experimental)


## v0.11.0 (2019/02/23)

- Add image option (thanks to @timcleaver)
- Fix that a part of deleted profiles remaining


## v0.10.1 (2018/11/23)

- Change popmenu links


## v0.10.0 (2018/11/17)

- Add new textbox that filters items by profile name and its 'Enter' key makes switching to first matched role


## v0.9.0 (2018/11/16)

- Support the number of profiles maximum 200
- Add 'Credits' and 'Donation' links on popup menu


## v0.8.1 (2018/10/02)

- Fix finding profile on form submit (thanks to @craig-miskell-fluxfederation)


## v0.8.0 (2018/03/03)

- Change the configuration from popup panel to another tab page
- Support new 'Automatically assume last assumed role' option (Experimental) 
- Fix attaching color line broken


## v0.7.0 (2018/02/27)

- Support a 'region' parameter can be used to change the region whenever switching the role
- Fix Show only matching roles option has negative effect on normal AWS login


## v0.6.3 (2018/01/07)

- Add role filtering for use with federated AWS login by @robsweet


## v0.6.0 (2017/09/02)

- Keep the color contrast of profile caption


## v0.5.3 (2017/08/31)

- First release for Firefox


## v0.5.0 (2017/05/11)

- Add the option to hide account id on the right of each label
- Update popup style
    - wide textarea and set its spellcheck off
    - modify color input
- Fix spelling mistake, thanks @jbonachera


## v0.5.0 (2017/05/11)

- Fix it to work before switching role manually


## v0.3.2 (2016/12/06)

- Support 'Personal Health Dashboard' page (Domain phd.aws.amazon.com)


## v0.3.1 (2016/11/27)

- Fix to get base AWS account ID


## v0.3.0 (2016/11/17)

- Support multi base accounts


## v0.2.0 (2016/11/06)

- Can hide original role history


## v0.1.8 (2016/08/09)

- Add color picker for color fields
- Apply your setting to Chrome Sync


## v0.1.6 (2016/08/08)

- Fix to show recent items are repeated
- Fix space on the sides of | at the account caption
