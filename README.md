# ArithmeTick (mobile)

React Native / Expo port of the ArithmeTick web prototype (`../arithmetick`, Next.js). The web app stays
the reference for behaviour, copy and art until the port is complete.

## Run

```bash
npm install
npx expo start          # then press i (iOS simulator) or a (Android emulator), or scan the QR in Expo Go
```

Most dependencies are in Expo Go. If something native is missing there, make a development build:
`npx expo run:ios` / `npx expo run:android` (or `npx eas-cli@latest build --profile development`).

Checks: `npx tsc --noEmit` and `npx expo lint`.

## Layout

Feature-based. Files stay small (~150 lines); a big component lives in a folder with its pieces beside it.

```
src/
  app/          expo-router routes only — each file re-exports a feature screen (`_layout.tsx` loads fonts + saved state)
  features/     one folder per area, each with screens/, components/, hooks/, utils/ as needed
    splash/     14-frame animated intro (timeline/, components/, art/)
    auth/       welcome, login, signup, verify, forgot / reset password
    profiles/   "who is playing" + add explorer
    home/       level map, header, bottom tabs, badges / leaderboard placeholders
    play/       play screen + games/ (ten-frame, balance-scale, array-multiplication)
  components/   shared UI: ui/ (buttons, fields, icons…), mascot/ (Jaymo), backdrops/
  state/        the app store (AsyncStorage) — `store.ts` is the entry; actions/ grouped by domain
  hooks/        app-wide hooks (route guards)
  services/     audio (pre-rendered SFX), one-time screen hand-offs
  data/         levels, badges, leaderboard (shared with the web app)
  types/        data models + domain types
  utils/        validation
  constants/    routes
  theme/        colour + font tokens (from the web's `globals.css`)
```

- Import with the `@/` alias (`@/features/home/...`, `@/components/ui/Button`).
- `assets/sfx/` — sound effects rendered from the web's Web Audio recipes by `npm run sfx`
  (`scripts/render-sfx.mjs`, which also writes `src/services/audio/sfxAssets.ts`).
- `assets/splash/` — splash frame backgrounds and the home meadow (rasterised from Figma SVGs).

## Port status

| Area | Status |
| --- | --- |
| Store, validation, levels, badges, leaderboard data | ported |
| Sounds | ported (pre-rendered WAVs) |
| Theme, fonts (DynaPuff body, Quicksand headings) | ported |
| UI primitives, Jungle backdrop, Jaymo, avatars, icons | ported |
| Splash (14-frame animated intro) → welcome → login / signup → verify → add explorer → profiles, forgot / reset password | ported |
| Home: level map, header (explorer switcher, stars, screen time), bottom tabs | ported |
| Play screen: top bar, screen-time sheet, high-five hero pop | ported |
| Grade 1 board (Ten-Frames) | ported |
| Grade 2 (Balance Scale) and Grade 3 (Array Multiplication) boards | **stand-ins** — still to port |
| Level celebration, physical quests, badge medallion | **stand-ins** — still to port |
| Badges and Leaderboard tabs | **placeholders** ("Coming soon") |
| Google sign-in | **mocked** — native Google Sign-In (and Sign in with Apple for iOS) still to do |
| Reviewer panel (web demo tool) | not ported |
