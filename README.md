# AI Skin Disease Detector

This is an Expo + React Native application that lets users create an account, upload skin photos, and review AI-generated insights and history.

## Quick Start

```bash
npm install
npx expo start
```

## Project Structure

- `app/` – Expo Router screens
- `src/` – feature code (theme, services, hooks, UI components)
- `assets/` – images and icons

## Theme

The app supports light, dark, and system themes through `ThemeProvider`. You can switch modes under **Profile → Appearance**.

## Useful Scripts

- `npx expo start --tunnel` – start development server
- `npm run ios` – run on iOS simulator
- `npm run android` – run on Android emulator
- `npm run lint` – lint the project

## Notes

Make sure to update environment variables in `.env` before running in production. Test uploads and theme switching on both platforms after changes.
