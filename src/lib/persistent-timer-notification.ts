import { Capacitor, registerPlugin } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

import type { EyeSettings, TimerState } from "./eye-timer";
import { breakMs, focusMs, isPaused, remainingMs } from "./eye-timer";

interface PersistentTimerUpdate {
  phase: "focus" | "break";
  paused: boolean;
  remainingMs: number;
  endsAt: number | null;
  focusDurationMs: number;
  breakDurationMs: number;
}

interface PersistentTimerPlugin {
  update(options: PersistentTimerUpdate): Promise<void>;
  cancel(): Promise<void>;
}

const PersistentTimer = registerPlugin<PersistentTimerPlugin>("PersistentTimer");

let latestRevision = 0;
let updateQueue: Promise<void> = Promise.resolve();

export function syncPersistentTimerNotification(
  state: TimerState,
  settings: EyeSettings,
  now = Date.now(),
): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    return Promise.resolve();
  }

  const revision = ++latestRevision;
  const operation = updateQueue.then(async () => {
    if (revision !== latestRevision) return;

    if (state.phase === "idle") {
      await PersistentTimer.cancel();
      return;
    }

    const permission = await LocalNotifications.checkPermissions();
    if (revision !== latestRevision || permission.display !== "granted") return;

    await PersistentTimer.update({
      phase: state.phase,
      paused: isPaused(state),
      remainingMs: remainingMs(state, now),
      endsAt: state.endsAt,
      focusDurationMs: focusMs(settings),
      breakDurationMs: breakMs(settings),
    });
  });

  updateQueue = operation.catch((error: unknown) => {
    console.error("Unable to update the persistent timer notification.", error);
  });
  return updateQueue;
}
