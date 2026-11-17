import { afterEach, describe, expect, it, vi } from "vitest";

import { showReminder } from "./notify";

const PageNotification = vi.fn();

function setup(permission: NotificationPermission, reg: unknown) {
  Object.assign(PageNotification, { permission });
  vi.stubGlobal("Notification", PageNotification);
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { getRegistration: vi.fn().mockResolvedValue(reg) },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  PageNotification.mockReset();
});

describe("showReminder", () => {
  it("uses the service worker when one is active", async () => {
    const showNotification = vi.fn().mockResolvedValue(undefined);
    setup("granted", { active: {}, showNotification });
    expect(await showReminder("Time to look away", "Look 20 feet away")).toBe("worker");
    expect(showNotification).toHaveBeenCalledWith(
      "Time to look away",
      expect.objectContaining({ body: "Look 20 feet away", tag: "lookaway" }),
    );
    expect(PageNotification).not.toHaveBeenCalled();
  });

  it("falls back to a page notification when no worker is installed", async () => {
    setup("granted", undefined);
    expect(await showReminder("Time to look away", "x")).toBe("page");
    expect(PageNotification).toHaveBeenCalledTimes(1);
  });

  it("falls back to a page notification when the worker fails", async () => {
    setup("granted", { active: {}, showNotification: vi.fn().mockRejectedValue(new Error("no")) });
    expect(await showReminder("Time to look away", "x")).toBe("page");
  });

  it("shows nothing without notification permission", async () => {
    const showNotification = vi.fn();
    setup("denied", { active: {}, showNotification });
    expect(await showReminder("Time to look away", "x")).toBe("skipped");
    expect(showNotification).not.toHaveBeenCalled();
    expect(PageNotification).not.toHaveBeenCalled();
  });
});
