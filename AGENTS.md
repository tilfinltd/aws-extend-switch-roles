# Repository guidance

## Project shape

- This is a cross-browser extension for Chrome, Firefox, and Edge that augments AWS IAM role switching.
- Keep the three execution contexts distinct:
  - `src/js/background.js` handles extension lifecycle, storage synchronization, and external configuration.
  - `src/js/content.js` runs in AWS Console pages and injects the role-switching UI.
  - `src/js/war/` contains page-context scripts used to access AWS-internal objects that content scripts cannot access directly.
- Source files use ES modules (`package.json` has `"type": "module"`). Do not use Node-only APIs in browser or content-script code.
- Preserve cross-browser extension API compatibility (`chrome` / `browser`) and browser-specific manifest overrides.

## Generated files and commands

- Edit source files under `src/`; do not edit generated files under `dist/`.
- Use `npm run build` for production builds and `npm run build:dev` for development builds.
- Run `npm test` for unit tests. Use `npm run test_emulator` for Playwright extension tests when the change affects browser behavior.
- `src/js/content.js` is copied rather than Rollup-bundled, so keep its dependencies compatible with the content-script environment.

## Storage invariants

- Access extension storage through the repositories in `storage_repository.js`, using `StorageProvider` singleton accessors rather than direct ad hoc storage calls.
- Configuration is compressed and split in Chrome sync/local storage, while parsed profiles live in the IndexedDB `aesr` database. Changes to either layer must preserve the synchronization and migration behavior in `update_profiles.js`.
- Do not conflate `profilesLastUpdated` (configuration changed) with `profilesTableUpdated` (IndexedDB synchronized); their comparison controls re-synchronization.
- Preserve the existing split-key format (`profiles`, `profiles_1`, and so on) and its storage-size constraints when changing configuration persistence.
- Parsed profile records use synthetic `profilePath` identifiers. Preserve their format and ordering semantics when changing profile parsing or persistence.

## AWS Console integration

- Page-context access to AWS internals belongs in WAR scripts, with hidden DOM elements such as `#AESR_info` and `#AESR_result` serving as the communication channel to the content script.
- Role switching depends on the AWS CSRF token obtained in page context and submitted through `#AESR_form`; do not move that access into the isolated content-script context.
- Account for both the newer Prism console and the legacy AWS Console when changing DOM detection or role-switch behavior.

## Tests

- Unit tests live beside shared libraries as `src/js/lib/*.test.js` and use jsdom.
- Browser integration tests live in `test/browser/`; Playwright extension tests live in `test/emulator/`.
- Add or update tests in the closest matching layer for behavioral changes, especially storage migration, profile parsing, and console-context communication.
