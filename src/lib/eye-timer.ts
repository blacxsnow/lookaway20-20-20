// Pure 20-20-20 timer logic. Time is always derived from timestamps so the
// countdown stays correct even when the browser throttles background tabs.

export type Phase = "idle" | "focus" | "break";

export interface EyeSettings {
  /** Minutes of screen time before a break (the first "20"). */
  focusMinutes: number;
  /** Seconds to look away during a break (the last "20"). */
  breakSeconds: number;
  sound: boolean;
  notifications: boolean;
  blinkNudges: boolean;
  /** How often to show a gentle "blink" cue during focus time. */
  blinkEveryMinutes: number;
}

export const DEFAULT_SETTINGS: EyeSettings = {
  focusMinutes: 20,
  breakSeconds: 20,
  sound: true,
  notifications: true,
  blinkNudges: true,
  blinkEveryMinutes: 5,
};

/** The distance to look at during a break: 20 feet ≈ 6 metres. */
export const LOOK_DISTANCE = { feet: 20, metres: 6 } as const;

export interface TimerState {
  phase: Phase;
  /** Timestamp (ms) when the current phase ends; null when idle or paused. */
  endsAt: number | null;
  /** Remaining ms captured when paused; null when running or idle. */
  pausedRemainingMs: number | null;
  /** Total length of the current phase in ms, for progress rings. */
  durationMs: number;
}

export type TimerEvent = "break-start" | "break-end" | null;

export const focusMs = (s: EyeSettings) => s.focusMinutes * 60_000;
export const breakMs = (s: EyeSettings) => s.breakSeconds * 1_000;

export const IDLE: TimerState = { phase: "idle", endsAt: null, pausedRemainingMs: null, durationMs: 0 };

export function startFocus(settings: EyeSettings, now: number, ms = focusMs(settings)): TimerState {
  return { phase: "focus", endsAt: now + ms, pausedRemainingMs: null, durationMs: ms };
}

export function startBreak(settings: EyeSettings, now: number): TimerState {
  const ms = breakMs(settings);
  return { phase: "break", endsAt: now + ms, pausedRemainingMs: null, durationMs: ms };
}

/** Push the next break back by a few minutes. */
export function snooze(settings: EyeSettings, now: number, minutes = 5): TimerState {
  return startFocus(settings, now, minutes * 60_000);
}

export function isPaused(state: TimerState) {
  return state.phase !== "idle" && state.pausedRemainingMs !== null;
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.phase === "idle" || state.endsAt === null) return state;
  return { ...state, endsAt: null, pausedRemainingMs: Math.max(0, state.endsAt - now) };
}

export function resume(state: TimerState, now: number): TimerState {
  if (state.pausedRemainingMs === null) return state;
  return { ...state, endsAt: now + state.pausedRemainingMs, pausedRemainingMs: null };
}

export function remainingMs(state: TimerState, now: number): number {
  if (state.phase === "idle") return 0;
  if (state.pausedRemainingMs !== null) return state.pausedRemainingMs;
  return Math.max(0, (state.endsAt ?? now) - now);
}

/** 0 → just started, 1 → finished. */
export function progress(state: TimerState, now: number): number {
  if (state.phase === "idle" || state.durationMs === 0) return 0;
  return 1 - remainingMs(state, now) / state.durationMs;
}

/** Advance the timer: focus rolls into a break, a break rolls back into focus. */
export function tick(
  state: TimerState,
  settings: EyeSettings,
  now: number,
): { state: TimerState; event: TimerEvent } {
  if (state.phase === "idle" || isPaused(state) || remainingMs(state, now) > 0) {
    return { state, event: null };
  }
  if (state.phase === "focus") return { state: startBreak(settings, now), event: "break-start" };
  return { state: startFocus(settings, now), event: "break-end" };
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface DayStats {
  breaks: number;
  skipped: number;
}

export const EMPTY_DAY: DayStats = { breaks: 0, skipped: 0 };
