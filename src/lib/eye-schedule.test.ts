import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  computeStreak,
  isWithinWorkHours,
  isWorkDayFn,
  normalizeSettings,
  type EyeSettings,
} from "./eye-timer";

const work: EyeSettings = { ...DEFAULT_SETTINGS, workHoursEnabled: true };
// 2026-11-16 is a Monday.
const mon = (h: number, m = 0) => new Date(2026, 10, 16, h, m);

describe("working hours", () => {
  it("default window is Mon–Fri 09:00–18:00", () => {
    expect(isWithinWorkHours(work, mon(10))).toBe(true);
    expect(isWithinWorkHours(work, mon(8, 59))).toBe(false);
    expect(isWithinWorkHours(work, mon(18))).toBe(false);
  });

  it("weekends are off by default", () => {
    expect(isWithinWorkHours(work, new Date(2026, 10, 21, 10))).toBe(false); // Saturday
  });

  it("reminders run anytime when working hours are off", () => {
    expect(isWithinWorkHours(DEFAULT_SETTINGS, new Date(2026, 10, 22, 3))).toBe(true);
  });

  it("supports overnight shifts", () => {
    const night = { ...work, workStart: "22:00", workEnd: "06:00" };
    expect(isWithinWorkHours(night, mon(23))).toBe(true);
    expect(isWithinWorkHours(night, new Date(2026, 10, 17, 5))).toBe(true); // Tue 5am, Mon shift
    expect(isWithinWorkHours(night, mon(12))).toBe(false);
  });
});

describe("day streaks", () => {
  const b = { breaks: 1, skipped: 0 };

  it("counts consecutive days with at least one break", () => {
    const all = { "2026-11-14": b, "2026-11-15": b, "2026-11-16": b };
    expect(computeStreak(all, mon(12))).toEqual({ current: 3, best: 3 });
  });

  it("a missed day resets the streak but keeps the best", () => {
    const all = { "2026-11-10": b, "2026-11-11": b, "2026-11-12": b, "2026-11-14": b, "2026-11-15": b, "2026-11-16": b };
    // 13th missed
    expect(computeStreak({ ...all, "2026-11-13": { breaks: 0, skipped: 2 } }, mon(12))).toEqual({ current: 3, best: 3 });
    const longer = { ...all, "2026-11-09": b };
    expect(computeStreak(longer, mon(12))).toEqual({ current: 3, best: 4 });
  });

  it("today without a break yet keeps yesterday's streak alive", () => {
    const all = { "2026-11-14": b, "2026-11-15": b };
    expect(computeStreak(all, mon(8)).current).toBe(2);
  });

  it("non-working days don't break the streak", () => {
    // Fri 13th and Mon 16th; weekend skipped.
    const all = { "2026-11-13": b, "2026-11-16": b };
    expect(computeStreak(all, mon(12), isWorkDayFn(work)).current).toBe(2);
    expect(computeStreak(all, mon(12)).current).toBe(1);
  });

  it("no breaks ever means no streak", () => {
    expect(computeStreak({}, mon(12))).toEqual({ current: 0, best: 0 });
  });
});

describe("saved settings", () => {
  it("an old saved Ocean wave sound falls back to the chime", () => {
    const s = normalizeSettings({ soundKind: "waves" as never, volume: 40 });
    expect(s.soundKind).toBe("chime");
    expect(s.volume).toBe(40);
  });
});
