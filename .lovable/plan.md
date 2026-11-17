# Lookaway: timer that survives closing, and better phone notifications

Nothing in the design or existing features changes. Only how the timer is remembered and how reminders are shown.

## What I found

- The running timer lives only in memory (`useState(IDLE)` in `use-eye-timer.ts`), so swiping the app away resets it. Settings, stats and Kids mode are already saved on the device.
- Notifications use `new Notification(...)` from the page. On Android Chrome this is unreliable or blocked for installed apps; Android expects notifications to come from the service worker.
- The service worker is auto-generated (offline caching only) and registered from `src/lib/pwa.ts`, which correctly refuses the editor preview.
- Permission is requested when you press Start, if notifications are on.

## A. Timer that survives refresh and closing

- Save the full timer state (phase, end time, paused time left, length) on the device every time it changes; clear it on Stop.
- On reopen, restore it and work out what happened from the clock:
  - Focus still running: continue with the correct time left.
  - Paused: stay paused with the same time left.
  - Focus ended while closed: start the break now with the existing "Welcome back, a break was due X min ago" message.
  - A break that ended while closed: return to focus quietly and **do not count it** as a completed break (you weren't there to take it). Breaks are counted only when the break finishes while the app is open, exactly as now.
  - Very long absence (over 12 hours, e.g. next day): go back to the start screen instead of popping an old break.
- Restored state is checked for broken or old data and safely ignored if invalid.
- Working hours, snooze, skip, stats and Kids mode "time's up" keep working as before (time's up still stops the timer).
- Screen time is not counted for the time the app was closed (already true).

## B. Notifications through the service worker

- Show reminders via the service worker (`registration.showNotification`), falling back to the current method on desktop.
- Tapping a notification opens or focuses Lookaway.
- Notifications fire only while Android keeps the app alive. Honest limits shown in the install guide:
  - When the screen locks or the app is in the background, Android may pause it within minutes; reminders can be late or missing.
  - Once swiped away, a web app cannot send scheduled reminders. Your timer will still be correct when you reopen it.
  - Battery saver on OnePlus can stop it sooner; setting Chrome's battery use to "Unrestricted" helps but isn't guaranteed.
- Chrome's experimental "scheduled notifications" feature was dropped, so I won't rely on it. Web Push would need a server and still isn't exact; not included.
- In the editor preview the service worker is off, so the old method is used there; test on the published app.

## C. Future native Android version (assessment only, nothing installed)

- Capacitor wraps the same app in a real Android app. Its Local Notifications plugin lets Android schedule the next break alert in advance, so it rings even if the app is closed or the phone is locked.
- Needs: exact-alarm and notification permissions (Android 12–14 rules), a Play Store listing, and building with Android Studio outside Lovable from the GitHub repo.
- Today's code is ready for it: the timer already knows the exact end time, so each change would simply "schedule at end time / cancel on stop or pause".
- Limits: some phones (including OnePlus) still delay alarms under aggressive battery saving.

## Files to change

- `src/lib/eye-timer.ts`: add `serializeTimer`, `restoreTimer(saved, settings, now)` returning the state plus whether a missed break should be announced; no change to existing functions.
- `src/hooks/use-eye-timer.ts`: load/save timer under `lookaway:timer`; use the restore result on start-up; route notifications through the new helper.
- `src/lib/notify.ts` (new): service-worker notification with page fallback.
- `vite.config.ts`: add a small `importScripts` file to the generated worker for notification taps (stays generateSW).
- `public/sw-notify.js` (new): `notificationclick` handler only.
- `src/components/eye/InstallDialog.tsx`: short honest "Reminders on Android" note.
- `AGENTS.md`: record the timer-persistence rule.

## Tests

- `eye-timer.test.ts` / new `timer-restore.test.ts`: running focus restores with right time left; paused restores unchanged; overdue focus becomes a break with missed notice; expired break returns to focus without counting; over 12 hours resets to idle; invalid/corrupt data is ignored.
- Existing tests all re-run.
- Browser check: start timer, reload page, confirm the time continues; pause, reload, still paused.

## Risks

- Stale saved timer from an older version: handled by validation.
- Service-worker change only affects the published app; returning users get it after the auto-update.
- Notifications in background remain best-effort on Android.
