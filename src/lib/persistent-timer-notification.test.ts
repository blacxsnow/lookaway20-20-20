import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  cancel: vi.fn(),
  checkPermissions: vi.fn(),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => true,
    getPlatform: () => "android",
  },
  registerPlugin: () => ({
    update: mocks.update,
    cancel: mocks.cancel,
  }),
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: { checkPermissions: mocks.checkPermissions },
}));

import { DEFAULT_SETTINGS, pause, startBreak, startFocus, resume } from "./eye-timer";
import { syncPersistentTimerNotification } from "./persistent-timer-notification";

beforeEach(() => {
  mocks.update.mockReset().mockResolvedValue(undefined);
  mocks.cancel.mockReset().mockResolvedValue(undefined);
  mocks.checkPermissions.mockReset().mockResolvedValue({ display: "granted" });
});

describe("persistent timer notification", () => {
  it("uses the current focus deadline and configured duration", async () => {
    const now = 1_000_000;
    const settings = { ...DEFAULT_SETTINGS, focusMinutes: 37 };
    await syncPersistentTimerNotification(startFocus(settings, now), settings, now);

    expect(mocks.update).toHaveBeenCalledWith({
      phase: "focus",
      paused: false,
      remainingMs: 37 * 60_000,
      endsAt: now + 37 * 60_000,
      focusDurationMs: 37 * 60_000,
      breakDurationMs: settings.breakSeconds * 1_000,
    });
  });

  it("shows a paused timer as static remaining time", async () => {
    const now = 1_000_000;
    const state = pause(startFocus(DEFAULT_SETTINGS, now), now + 5_000);
    await syncPersistentTimerNotification(state, DEFAULT_SETTINGS, now + 5_000);

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "focus",
        paused: true,
        remainingMs: 20 * 60_000 - 5_000,
        endsAt: null,
      }),
    );
  });

  it("restarts the countdown from the resumed deadline", async () => {
    const now = 1_000_000;
    const paused = pause(startFocus(DEFAULT_SETTINGS, now), now + 5_000);
    const resumed = resume(paused, now + 15_000);
    await syncPersistentTimerNotification(resumed, DEFAULT_SETTINGS, now + 15_000);

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ paused: false, endsAt: now + 15_000 + 20 * 60_000 - 5_000 }),
    );
  });

  it("updates the notification for break, snooze, and skip timer states", async () => {
    const now = 1_000_000;
    await syncPersistentTimerNotification(startBreak(DEFAULT_SETTINGS, now), DEFAULT_SETTINGS, now);
    expect(mocks.update).toHaveBeenLastCalledWith(expect.objectContaining({ phase: "break" }));

    const snoozed = startFocus(DEFAULT_SETTINGS, now, 5 * 60_000);
    await syncPersistentTimerNotification(snoozed, DEFAULT_SETTINGS, now);
    expect(mocks.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ phase: "focus", endsAt: now + 5 * 60_000 }),
    );

    const skipped = startFocus({ ...DEFAULT_SETTINGS, focusMinutes: 37 }, now);
    await syncPersistentTimerNotification(skipped, { ...DEFAULT_SETTINGS, focusMinutes: 37 }, now);
    expect(mocks.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ phase: "focus", endsAt: now + 37 * 60_000 }),
    );
  });

  it("cancels the notification when the timer stops", async () => {
    await syncPersistentTimerNotification(
      { phase: "idle", endsAt: null, pausedRemainingMs: null, durationMs: 0 },
      DEFAULT_SETTINGS,
    );
    expect(mocks.cancel).toHaveBeenCalledTimes(1);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("does not post the notification without OS permission", async () => {
    mocks.checkPermissions.mockResolvedValue({ display: "denied" });
    await syncPersistentTimerNotification(
      startFocus(DEFAULT_SETTINGS, 1_000),
      DEFAULT_SETTINGS,
      1_000,
    );
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("drops outdated asynchronous updates", async () => {
    let resolvePermission!: (value: { display: string }) => void;
    mocks.checkPermissions.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePermission = resolve;
        }),
    );

    const now = 1_000_000;
    const stale = syncPersistentTimerNotification(
      startFocus(DEFAULT_SETTINGS, now),
      DEFAULT_SETTINGS,
      now,
    );
    await vi.waitFor(() => expect(mocks.checkPermissions).toHaveBeenCalledTimes(1));
    const latest = syncPersistentTimerNotification(
      startBreak(DEFAULT_SETTINGS, now),
      DEFAULT_SETTINGS,
      now,
    );
    resolvePermission({ display: "granted" });
    await Promise.all([stale, latest]);

    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ phase: "break" }));
  });
});
