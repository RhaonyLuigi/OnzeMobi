This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

Preserve the user's preference for app screens without simulated phone chrome: do not draw a fake clock, signal/battery indicators, or an iPhone home indicator. Respect real device safe areas instead.

## User-authorized GitHub workflow

- Repository: https://github.com/RhaonyLuigi/OnzeMobi
- Remote: `origin` (`https://github.com/RhaonyLuigi/OnzeMobi.git`)
- Tracked branch: `main`
- Visibility: public (changed by the user on 2026-11-01); preserve it unless the user requests a change.
- GitHub Pages: the `Publish app to GitHub Pages` workflow publishes `main`. Keep the Pages base path `/OnzeMobi` isolated to `npm run build:pages`, so local and native builds retain their normal routes. Verify the deployment when reporting a preview update as live.

The user requested on 2026-11-01 that changes requested in this project/chat also be kept up to date in its GitHub repository. Once origin is configured, treat ordinary implementation requests here as authorization to validate, commit the related changes, and push them to the tracked branch, unless the user explicitly asks for local-only work. Reuse the existing origin; do not create a new repository for later changes.

- Run the required checks and any relevant tests before pushing.
- Inspect and commit only changes belonging to the requested work. Preserve unrelated work.
- Do not commit credentials, local environment files, caches, generated bundles, local test output, or temporary Figma download URLs.
- Use normal pushes. Never force-push, overwrite remote history, or change repository visibility without an explicit request.
- Verify that the remote branch contains the local commit before reporting synchronization as complete. If authentication or a push fails, report that clearly; do not claim the repository is updated.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
