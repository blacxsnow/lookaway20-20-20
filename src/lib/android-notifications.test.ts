import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  schedule: vi.fn(),
  cancel: vi.fn(),
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => true,
    getPlatform: () => "android",
  },
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    schedule: mocks.schedule,
    cancel: mocks.cancel,
    checkPermissions: mocks.checkPermissions,
    requestPermissions: mocks.requestPermissions,
  },
}));

import { DEFAULT_SETTINGS, pause, startBreak, startFocus } from "./eye-timer";
import {
  cancelTimerReminder,
  requestNativeNotificationPermission,
  scheduleTimerReminder,
  TIMER_NOTIFICATION_ID,
} from "./android-notifications";

beforeEach(() => {
  mocks.schedule.mockReset().mockResolvedValue({ notifications: [] });
  mocks.cancel.mockReset().mockResolvedValue(undefined);
  mocks.checkPermissions.mockReset().mockResolvedValue({ display: "granted" });
  mocks.requestPermissions.mockReset().mockResolvedValue({ display: "granted" });
});

describe("native timer notifications", () => {
  it("requests notification permission once when it is not denied", async () => {
    mocks.checkPermissions.mockResolvedValue({ display: "prompt" });
    await expect(requestNativeNotificationPermission()).resolves.toBe("granted");
    expect(mocks.requestPermissions).toHaveBeenCalledTimes(1);
  });

  it("does not request permissions again after denial", async () => {
    mocks.checkPermissions.mockResolvedValue({ display: "denied" });
    await expect(requestNativeNotificationPermission()).resolves.toBe("denied");
    expect(mocks.requestPermissions).not.toHaveBeenCalled();
  });

  it("schedules a stable focus reminder deadline", async () => {
    const now = 1_000_000;
    await expect(scheduleTimerReminder(startFocus(DEFAULT_SETTINGS, now), DEFAULT_SETTINGS, now)).resolves.toBe("scheduled");
    expect(mocks.cancel).toHaveBeenCalledWith({ notifications: [{ id: TIMER_NOTIFICATION_ID }] });
    expect(mocks.schedule).toHaveBeenCalledWith({
      notifications: [
        expect.objectContaining({
          id: TIMER_NOTIFICATION_ID,
          title: "Time to look away",
          schedule: expect.objectContaining({ at: new Date(now + 20 * 60_000) }),
        }),
      ],
    });
  });

  it("schedules the break-completion reminder", async () => {
    const now = 2_000_000;
    await scheduleTimerReminder(startBreak(DEFAULT_SETTINGS, now), DEFAULT_SETTINGS, now);
    expect(mocks.schedule).toHaveBeenCalledWith({
      notifications: [expect.objectContaining({ title: "Break complete", id: TIMER_NOTIFICATION_ID })],
    });
  });

  it("cancels reminders for pause, idle or disabled notifications", async () => {
    await cancelTimerReminder();
    expect(mocks.cancel).toHaveBeenCalled();
    await expect(scheduleTimerReminder(
      pause(startFocus(DEFAULT_SETTINGS, 1_000), 2_000),
      DEFAULT_SETTINGS,
      1_000,
    )).resolves.toBe("cancelled");
  });
});
