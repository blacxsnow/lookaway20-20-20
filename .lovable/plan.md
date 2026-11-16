Lookaway: storage, phones, Kids mode and more ideas

## 1. Where your data is saved now

- Streaks, daily break counts and settings are saved **only in this browser on this device**.
- Pros: works with no account, private, and works offline.
- Cons: clearing your browser data erases it, and your phone and laptop don't share streaks.

**Decision: offline first, with an account as an optional extra.**
- The app keeps working with **no internet and no account**, just like now. Everything is saved on the device first.
- Backup is something you choose to turn on. If you sign in with Lovable Cloud, your streaks and settings copy to your account **whenever you're online**. While you're offline, the app keeps counting on the phone and catches up later.
- You never have to sign in to use the timer, streaks or Kids mode.
- Kids mode stays fully on the device too, so a child's data is never sent anywhere unless a parent turns on backup.
- Decision for now: build offline mode first and decide on accounts later (step 4 of the build).

## 2. Running on iPhone and Android

What's possible for a web app:

- **Simple steps to get it on your phone like an app:**
  1. Publish the app so it has a public link.
  2. **iPhone:** open the link in Safari, tap Share, then "Add to Home Screen".
  3. **Android:** open the link in Chrome, tap the ⋮ menu, then "Install app" (or "Add to Home screen").
  4. Lookaway then appears with its own icon, opens full screen without a browser bar, and works offline after the first visit.
  - I'll add an "Install on your phone" button in the app that shows these steps for the phone you're using.
- **Install to home screen**: it opens full screen like an app, with its own icon. I'll add this, plus a short "How to install" guide for iPhone (Safari > Share > Add to Home Screen) and Android (Chrome menu > Install app).
- **Limit:** phones stop web pages when they're closed or the screen locks. Reminders only work while Lookaway is open. iPhone is the strictest about this.
- **Workaround in the app:** when you return to it, the timer still shows the right time, and a message tells you if a break was missed while it was closed.
- True always-on background reminders would need a separate App Store or Play Store app. I can't build that here.

## 3. Kids mode (being honest about the limits)

A website can't lock a child's phone or block other apps. Only the phone's own controls can do that: Screen Time on iPhone and Family Link on Android. Inside Lookaway, Kids mode can:

- Set a **daily screen-time allowance** (for example 1 hour), with a friendly countdown and a "time's up" screen.
- Show **playful breaks**: an animal to spot "far away", an eye-movement game, and stars earned for each finished break.
- Use a **parent PIN** to exit Kids mode, skip a break or change settings.
- Use bigger buttons, softer colours and simple words.
- Show a **parent summary** of today's screen time and breaks.
- Give a tip pointing parents to Screen Time and Family Link for real device limits, plus sourced guidance (for example the American Academy of Pediatrics and the American Academy of Ophthalmology on outdoor time and myopia) with references, as in the current guide.

## 4. More ideas (I'll build the starred ones)

- - **Weekly insights**: breaks per day and how many you finished versus skipped.
- - **Install to home screen and an offline mode** (part of section 2).
- - **Gentle eye exercises** (confirmed) during breaks (only ones that sources support, such as focus shifting and full blinks).
- **Posture and water nudges** (optional, off by default).
- **Achievements**, such as 7-day and 30-day streak badges.
- **Dark mode** for evening use.

## Build order

1. Phone install, with a **new app icon**: a simple eye whose pupil is a small mountain-and-sun horizon in the app's forest green and amber, on cream. It shows "look far away" at a glance and stays clear at small sizes. Plus offline mode and the "missed break" message.
2. Kids mode (allowance, PIN, playful breaks, parent summary, sourced tips)
3. Weekly insights and eye exercises
4. Optional accounts with cloud sync (only if you want them)

## Technical notes

- Kids-mode rules (allowance used, PIN check, lock state) go in pure functions next to `eye-timer.ts`, with tests. The PIN is stored as a hash in localStorage, so it is a light deterrent and not real security.
- Phone install: a web app manifest and icons (192, 512, maskable and an Apple touch icon made from the generated artwork). Offline uses vite-plugin-pwa (generateSW, NetworkFirst for pages). It registers only in the published app, never in the preview or an iframe, and `?sw=off` turns it off.
- Cloud sync, if approved: a user settings table and a daily stats table with row-level security. localStorage stays the main store, and changes queue while offline and sync when online. On the first sign-in, existing local history merges into the account.
