# ArithmeTick 🦉

A playful maths adventure for kids aged 5–8. Explorers follow **Brijo the owl** along a jungle trail,
unlocking levels by solving hands-on number puzzles: ten-frames, balance scales and arrays.

Built with **Expo SDK 58**, **React Native 0.88**, **TypeScript** and **Reanimated 4**.
A mobile port of the ArithmeTick web app.

<p align="center">
  <img src="assets/splash-icon.png" width="320" alt="ArithmeTick logo" />
</p>

## Features

- **Animated splash**: a 14-frame intro with sound, haptics and a reduced-motion version
- **Family accounts**: sign up / log in, email or phone verification, password reset
- **Up to 4 explorers per family**, each with an avatar, grade and progress
- **Level map**: a winding jungle trail with unlock animations, stars and screen-time limits
- **Grade 1 ten-frame game**: drag-and-drop bottle caps with gestures and haptics
- **Accessibility first**: screen-reader labels, WCAG AA contrast, Dynamic Type, Reduce Motion support

## Getting started

Requires Node 20+ and Yarn.

    yarn install
    npx expo start          # press i (iOS simulator) or a (Android), or scan with Expo Go

Native changes (icons, splash, native modules) need a development build:

    npx expo run:ios        # or run:android
    # or: npx eas-cli build --profile development

## Scripts

| Command | What it does |
| --- | --- |
| `npx expo start` | Start the dev server |
| `npx expo lint` | Lint |
| `npx tsc --noEmit` | Type-check |
| `npm run sfx` | Re-render sound effects to `assets/sfx/` |

## Project structure

Feature-based, with small focused files (~150 lines).

    src/
      app/          expo-router routes (thin re-exports of feature screens)
      features/     splash · auth · profiles · home · play (each with screens/components/hooks/utils)
      components/   shared UI kit, Brijo mascot, backdrops
      state/        persisted app store (AsyncStorage)
      services/     audio, screen hand-offs
      data/ types/ utils/ constants/ theme/

Import with the `@/` alias, e.g. `import Button from "@/components/ui/Button"`.

## Tech stack

Expo Router · React Native Reanimated & Worklets · Gesture Handler · react-native-svg ·
expo-audio · expo-haptics · AsyncStorage

## Roadmap

- [ ] Grade 2 (Balance Scale) and Grade 3 (Array Multiplication) boards
- [ ] Level celebration, physical quests, badge medallion
- [ ] Badges and Leaderboard tabs
- [ ] Native Google Sign-In and Sign in with Apple

## License

See [MIT LICENSE](LICENSE).
