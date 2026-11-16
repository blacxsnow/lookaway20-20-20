import { describe, expect, it } from "vitest";
import { IDLE, MISSED_BREAK_GRACE_MS, overdueMs, screenTimeDelta, startFocus, DEFAULT_SETTINGS, weekInsights } from "./eye-timer";

describe("missed breaks and screen time", () => {
  it("flags a break as missed only after a minute late", () => {
    const s = startFocus(DEFAULT_SETTINGS, 0);
    const end = 20 * 60_000;
    expect(overdueMs(s, end + 30_000)).toBeLessThan(MISSED_BREAK_GRACE_MS);
    expect(overdueMs(s, end + 5 * 60_000)).toBe(5 * 60_000);
    expect(overdueMs(IDLE, 1e9)).toBe(0);
  });
  it("ignores long gaps when the phone was asleep", () => {
    expect(screenTimeDelta(0, 1000, true)).toBe(1000);
    expect(screenTimeDelta(0, 60_000, true)).toBe(0);
    expect(screenTimeDelta(0, 1000, false)).toBe(0);
  });
  it("weekly finish rate is breaks taken over all breaks", () => {
    const w = weekInsights(
      { "2026-11-16": { breaks: 3, skipped: 1, screenMs: 0 }, "2026-11-09": { breaks: 9, skipped: 0, screenMs: 0 } },
      new Date(2026, 10, 16),
    );
    expect(w.breaks).toBe(3);
    expect(w.finishRate).toBe(75);
  });
});
