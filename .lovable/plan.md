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

## Safeguards (added)

- **Start-up guard:** the timer is not saved until restoring has finished (a "restored" flag), so the empty start state can never overwrite a saved timer.
- **12-hour rule uses the save time:** every save records when it was written. If the last valid save is more than 12 hours old, the timer resets to the start screen, for running and paused timers alike.
- All existing behaviour (stats, Kids mode, working hours, snooze, skip, pause, resume) is preserved; no redesign, no database, no Capacitor.

## Final implementation sequence

Step 1 - Timer persistence (separate change, testable alone)
1. Add pure `serializeTimer` / `restoreTimer` (with save timestamp, validation, 12-hour rule) to `eye-timer.ts`.
2. Add `timer-restore.test.ts`; run it plus all existing tests.
3. Wire into `use-eye-timer.ts` with the start-up guard; save on change, clear on Stop.
4. Browser check: start, reload, time continues; pause, reload, still paused; Stop, reload, start screen.

Step 2 - Service-worker notifications (separate change)
1. Add `src/lib/notify.ts` (service worker first, page fallback) and swap the call in the hook.
2. Add `public/sw-notify.js` tap handler and `importScripts` in `vite.config.ts`.
3. Add the honest Android note to the install guide.
4. Run all tests again; check the preview still works (worker stays off there).

Step 3 - Record rules in `AGENTS.md`.

## Remaining technical risks

- Phone clock changes (manual time change, time zone travel) can make restored time look early or late; the 12-hour rule and "never negative" checks limit the effect.
- Two open tabs could both save the timer; the last one to change wins. Rare for a phone app.
- Background notifications on OnePlus remain best-effort; only a native app fixes that.
- The worker update reaches installed phones only after a publish and the next app open.
- If the saved timer format changes later, old saves are ignored rather than migrated.
