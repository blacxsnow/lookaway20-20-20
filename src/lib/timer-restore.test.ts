import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  IDLE,
  MAX_RESTORE_AGE_MS,
  pause,
  remainingMs,
  restoreTimer,
  serializeTimer,
  startBreak,
  startFocus,
  tick,
} from "./eye-timer";

const T0 = 10_000_000;
const S = DEFAULT_SETTINGS;
const MIN = 60_000;

describe("restoreTimer", () => {
  it("running focus continues with the correct time left", () => {
    const saved = serializeTimer(startFocus(S, T0), T0);
    const { state } = restoreTimer(saved, S, T0 + 5 * MIN);
    expect(state.phase).toBe("focus");
    expect(remainingMs(state, T0 + 5 * MIN)).toBe(15 * MIN);
  });

  it("paused timer stays paused with the same time left", () => {
    const p = pause(startFocus(S, T0), T0 + 8 * MIN);
    const { state } = restoreTimer(serializeTimer(p, T0 + 8 * MIN), S, T0 + 3 * 60 * MIN);
    expect(state.pausedRemainingMs).toBe(12 * MIN);
    expect(remainingMs(state, T0 + 999 * MIN)).toBe(12 * MIN);
  });

  it("keeps the working-hours auto-pause flag for paused timers", () => {
    const p = pause(startFocus(S, T0), T0);
    expect(restoreTimer(serializeTimer(p, T0, true), S, T0 + MIN).autoPaused).toBe(true);
  });

  it("overdue focus becomes a break on the next tick", () => {
    const saved = serializeTimer(startFocus(S, T0), T0);
    const now = T0 + 30 * MIN;
    const { state } = restoreTimer(saved, S, now);
    expect(tick(state, S, now).event).toBe("break-start");
  });

  it("a break that ended while closed returns to focus without a break-end event", () => {
    const saved = serializeTimer(startBreak(S, T0), T0);
    const now = T0 + 2 * MIN;
    const { state } = restoreTimer(saved, S, now);
    expect(state.phase).toBe("focus");
    expect(remainingMs(state, now)).toBe(20 * MIN);
    expect(tick(state, S, now).event).toBeNull();
  });

  it("resets to idle after more than 12 hours since the last save, even when paused", () => {
    const p = pause(startFocus(S, T0), T0);
    expect(restoreTimer(serializeTimer(p, T0), S, T0 + MAX_RESTORE_AGE_MS + 1).state).toEqual(IDLE);
    expect(restoreTimer(serializeTimer(startFocus(S, T0), T0), S, T0 + 13 * 60 * MIN).state).toEqual(IDLE);
  });

  it("ignores missing, corrupt or future-dated data", () => {
    expect(restoreTimer(null, S, T0).state).toEqual(IDLE);
    expect(restoreTimer("junk", S, T0).state).toEqual(IDLE);
    expect(restoreTimer({ v: 1, savedAt: T0, state: { phase: "focus" } }, S, T0).state).toEqual(IDLE);
    expect(restoreTimer(serializeTimer(IDLE, T0), S, T0).state).toEqual(IDLE);
    expect(restoreTimer(serializeTimer(startFocus(S, T0), T0 + 10 * MIN), S, T0).state).toEqual(IDLE);
  });
});
