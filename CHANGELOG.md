Changelog
=========

## 6.1.0 (2024-12-14)

- Add comprehensive keyboard navigation support for the popup interface

## 6.0.3 (2025-11-17)

- Fix an issue where role switching failed in AWS GovCloud and China region (thanks to @harveymonster)
- Fix a potential internal storage corruption when configuration validation fails

## 6.0.2 (2025/11/05)

- Fix incorrect processing applied to iframes

## 6.0.1 (2025/10/30)

- Resolve an issue where users could not switch in the updated AWS Management Console (thanks to @Optischa)

## 6.0.0 (2025/01/22)

- Add support for **multi-session** on the AWS Management Console
- Add support for **multi-level source profile references** to enable role chaining
- Add experimental feature: **Automatic tab grouping for multi-session** for supporters

## 5.0.2 (2024/10/27)

- Fix to highlight the relevant part when validation fails in the configuration textarea (thanks to @brandonkgarner)
- Fix **Show only matching roles** when target role ARN has a path (thanks to @dblackhall-tyro)

## 5.0.1 (2024/04/07)

- Add support for remote retrieval of user configurations through [AESR Config Hub](https://aesr.dev/)

## 4.0.3 (2023/11/27)

- Implement fallback for displaying the role list in Firefox private browsing mode

## 4.0.2 (2023/11/07)

- Fix parsing of 'role_arn' when the role name contains slashes

## 4.0.1 (2023/10/31)

- Fix the switch targets to list in the order of Simple profiles, followed by Complex target profiles
- Shorten the process of fetching user info during the loading of the AWS Management Console page

## 4.0.0 (2023/10/22)

- Change the storage location of profile data to **IndexedDB**, removing the registration number limit
- Update the host specification for the AWS Management Console

## 3.0.0 (2023/06/18)

- Migrate to Manifest V3 (thanks to @eetann)
- Add 'Visual mode' that can change UI to Dark Mode (thanks to @XargsUK)

## 2.3.2 (2022/11/20)

- Truncate the display name when the length exceeds the limit (thanks to @samhpickering)
- Fix the browser console error when the popup menu is closed
- Updating the target AWS console URLs, support new health dashboard and LightSail
- Support 'aws_account_alias' parameter on base account
- Suppress outputing an error in a browser dev tool when the option page is opened

## 2.3.1 (2022/01/30)

- Fix that 'Sign-in endpoint in current region' breaks a switch role on some page like Chatbot
- Fix that the icon's background becomes gray if it is transparent

## 2.3.0 (2022/01/11)

- Implement 'Sign-in endpoint in current region' setting (Experimental, Supporters only)
- Fix how to get sign-in endpoint from AWS Console page
- Fix that switching sometimes fails on new experience pages

## 2.2.0 (2021/09/25)

- Support 'role_name' parameter that expresses the name of role at login, on base account (thanks to @AKoetsier)

## 2.1.1 (2021/05/22)

- Fix switching region broken by a strict change in the CSP of AWS Console

## 2.1.0 (2021/02/12)

- Implement 'Configuration storage' setting to select 'Sync' or 'Local' (thanks to @reegnz)
- Change the configuration by Config Sender API saving to 'Local' storage
- Strictly validate the AWS Configuration and change the error message distinct

## v2.0.6 (2021/01/25)

- Fix encoding redirect URI in the particular AWS Console pages
- Fix double scrollbars of the popup menu
- Add supporters program and golden key feature instead of donations
- Change left pane in the popup menu to always be visible

## v2.0.5 (2020/10/04)

- Fix 'Show only matching roles'
- Fix broken switch if the destination region is specified when you show AWS global service page
- Fix to work on old AWS Console Nav UI for AWS GovCloud and China partition

## v2.0.4 (2020/09/28)

- Enable 'Show only matching roles' again
- Open the popup menu with the keyboard shortcut (default `Ctrl + Shift + ,`) (thanks to @axeleroy)
- Refacor Refactor inner processing account and user information
- Remove dependency on Sanitizer

## v2.0.3 (2020/09/24)

- Significantly change to show the role list in the popup menu displayed when you click the extension icon on the browser tool bar.
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
