# Lookaway20

Offline 20-20-20 eye-care timer built with React, TanStack Start and Capacitor.

## Web development

```sh
npm install
npm run dev
npm test
npm run build
```

The existing PWA and web build remain available.

## Android build

Prerequisites:

- Node.js 20+
- JDK 21
- Android SDK Platform 36
- Android SDK Build Tools
- `ANDROID_HOME` or `ANDROID_SDK_ROOT`

Prepare the local web assets and sync Capacitor:

```sh
npm run android
```

Build a debug APK:

```sh
npm run android:debug
```

Debug APK output:

`android/app/build/outputs/apk/debug/app-debug.apk`

For a release APK:

```sh
cd android
./gradlew assembleRelease
```

Release signing is not configured in the repository. Configure a local keystore
through `android/gradle.properties` or Gradle environment variables. Do not
commit passwords or signing keys.

## Android architecture

- TanStack Start's SPA shell is prerendered and copied into `dist/`.
- Capacitor loads packaged assets from the Android WebView.
- Timer rules remain in `src/lib/eye-timer.ts`.
- Browser timer state remains in `lookaway:*` localStorage keys.
- `src/lib/android-notifications.ts` schedules one stable reminder notification
  at the timer deadline using `@capacitor/local-notifications`.
- Native notifications are reconciled on timer changes and app resume.
- Android 13+ notification permission is requested only when notifications
  are enabled and permission has not already been denied.
- Scheduling is inexact by default; exact-alarm restrictions and OEM battery
  behavior can still delay reminders.

The Android build is offline: JavaScript, CSS, images and fonts are packaged,
and no backend or remote API is required.
