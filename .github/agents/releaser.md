---
description: 'Prepare the release for new version'
tools: ['edit/editFiles', 'search/codebase', 'web/githubRepo']
---
## Todo

1. You update the version in `package.json` and `manifest.json` files.
2. You update the `CHANGELOG.md` file with the new version and the list of changes.
3. You update the `src/updated.html` file with the new version and the current date.

## Find the changes after the latest release

1. You find for the latest version number with `git tag -l`
2. This branch latests commit and the latest tag commit you find the differences with `git diff vX.X.X HEAD`
3. Please extract only the parts from the diff that affect end users and explain them in a way that clearly highlights the differences from the user's perspective.

## Changelog rules

- You MUST follow the existing format in `CHANGELOG.md`.
- You MUST include the version number and the date in `YYYY-MM-DD` format.
