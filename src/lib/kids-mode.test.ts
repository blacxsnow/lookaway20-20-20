import { describe, expect, it } from "vitest";
import {
  DEFAULT_KIDS,
  addBonus,
  allowanceLeftMs,
  checkPin,
  clampAllowance,
  hashPin,
  isTimeUp,
  isValidPin,
} from "./kids-mode";

const DAY = "2026-11-16";
const on = { ...DEFAULT_KIDS, enabled: true, allowanceMinutes: 60 };

describe("kids mode", () => {
  it("default allowance is 1 hour", () => {
    expect(DEFAULT_KIDS.allowanceMinutes).toBe(60);
  });
  it("time is up once the daily allowance is used", () => {
    expect(isTimeUp(on, DAY, 59 * 60_000)).toBe(false);
    expect(isTimeUp(on, DAY, 60 * 60_000)).toBe(true);
  });
  it("never locks when kids mode is off", () => {
    expect(isTimeUp({ ...on, enabled: false }, DAY, 999 * 60_000)).toBe(false);
  });
  it("parent bonus adds 15 minutes for today only", () => {
    const k = addBonus(on, DAY);
    expect(allowanceLeftMs(k, DAY, 60 * 60_000)).toBe(15 * 60_000);
    expect(allowanceLeftMs(k, "2026-11-17", 60 * 60_000)).toBe(0);
  });
  it("PIN must be 4 digits", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("12a4")).toBe(false);
    expect(isValidPin("123")).toBe(false);
  });
  it("checks the PIN against its hash", async () => {
    const h = await hashPin("4821");
    expect(await checkPin("4821", h)).toBe(true);
    expect(await checkPin("4822", h)).toBe(false);
  });
  it("allowance stays between 15 minutes and 3 hours", () => {
    expect(clampAllowance(5)).toBe(15);
    expect(clampAllowance(500)).toBe(180);
  });
});
