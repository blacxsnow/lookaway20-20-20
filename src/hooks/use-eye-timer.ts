import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { playSound, unlockAudio } from "@/lib/sounds";
import {
  DEFAULT_SETTINGS,
  EMPTY_DAY,
  IDLE,
  computeStreak,
  dayKey,
  formatClock,
  isPaused,
  isWithinWorkHours,
  isWorkDayFn,
  lastDays,
  parseDayKey,
  pause as pauseState,
  remainingMs,
  resume as resumeState,
  snooze as snoozeState,
  startBreak,
  startFocus,
  tick,
  type DayStats,
  type EyeSettings,
  type TimerState,
} from "@/lib/eye-timer";

const SETTINGS_KEY = "lookaway:settings";
const STATS_KEY = "lookaway:stats";

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function notify(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag: "lookaway", silent: false });
  } catch {
    /* some mobile browsers only allow notifications from a service worker */
  }
}

export function useEyeTimer() {
  const [settings, setSettings] = useState<EyeSettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<TimerState>(IDLE);
  const [now, setNow] = useState(() => Date.now());
  const [allStats, setAllStats] = useState<Record<string, DayStats>>({});
  const [blinkCue, setBlinkCue] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  // User chose to keep going outside working hours; cleared when hours begin.
  const [override, setOverride] = useState(false);
  const lastBlinkRef = useRef<number>(Date.now());

  // Load saved settings and stats after hydration.
  useEffect(() => {
    setSettings(readJSON(SETTINGS_KEY, DEFAULT_SETTINGS));
    setAllStats(readJSON<Record<string, DayStats>>(STATS_KEY, {}));
  }, []);

  const updateSettings = useCallback((patch: Partial<EyeSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const bumpStats = useCallback((field: keyof DayStats) => {
    setAllStats((prev) => {
      const key = dayKey(new Date());
      const day = prev[key] ?? EMPTY_DAY;
      const next = { ...prev, [key]: { ...day, [field]: day[field] + 1 } };
      localStorage.setItem(STATS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Heartbeat: fast while counting down, slow otherwise (to notice working hours changing).
  const paused = isPaused(state);
  const fast = state.phase !== "idle" && !paused;
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), fast ? 250 : 1000);
    return () => window.clearInterval(id);
  }, [fast]);

  // Phase transitions.
  useEffect(() => {
    const s = settingsRef.current;
    const r = tick(state, s, now);
    if (!r.event) return;
    setState(r.state);
    if (r.event === "break-start") {
      if (s.sound) playSound(s.soundKind, s.volume, "start");
      notify("Time to look away", `Look at something 20 feet (6 m) away for ${s.breakSeconds} seconds.`);
    } else {
      bumpStats("breaks");
      if (s.sound) playSound(s.soundKind, s.volume, "end");
      notify("Nice — eyes rested", `Next break in ${s.focusMinutes} minutes.`);
      toast.success("Break complete. Your eyes thank you.");
      lastBlinkRef.current = Date.now();
    }
  }, [now, state, bumpStats]);

  // Working hours: pause outside the window, pick back up when it opens.
  const inHours = isWithinWorkHours(settings, new Date(now));
  useEffect(() => {
    if (inHours) setOverride(false);
  }, [inHours]);
  useEffect(() => {
    if (state.phase !== "focus") return;
    if (!inHours && !override && !isPaused(state)) {
      setState((s) => pauseState(s, Date.now()));
      setAutoPaused(true);
      toast("Outside your working hours — reminders are resting.");
    } else if (inHours && autoPaused && isPaused(state)) {
      const t = Date.now();
      lastBlinkRef.current = t;
      setNow(t);
      setState((s) => resumeState(s, t));
      setAutoPaused(false);
      toast("Working hours started — reminders are back on.");
    }
  }, [inHours, override, autoPaused, state]);

  // Gentle blink nudges during focus time.
  useEffect(() => {
    if (!settings.blinkNudges || state.phase !== "focus" || isPaused(state)) return;
    if (now - lastBlinkRef.current >= settings.blinkEveryMinutes * 60_000) {
      lastBlinkRef.current = now;
      setBlinkCue(true);
      window.setTimeout(() => setBlinkCue(false), 6000);
    }
  }, [now, state, settings.blinkNudges, settings.blinkEveryMinutes]);

  // Countdown in the browser tab title so it's visible from other tabs.
  const remaining = remainingMs(state, now);
  useEffect(() => {
    if (state.phase === "idle") document.title = "Lookaway · 20-20-20 eye breaks";
    else if (state.phase === "break") document.title = `👀 Look away · ${Math.ceil(remaining / 1000)}s`;
    else document.title = `${formatClock(remaining)}${isPaused(state) ? " (paused)" : ""} · Lookaway`;
  }, [state, remaining]);

  // Streaks.
  const todayKey = dayKey(new Date(now));
  const stats = allStats[todayKey] ?? EMPTY_DAY;
  const { workHoursEnabled, workDays } = settings;
  const { streak, week } = useMemo(() => {
    const today = parseDayKey(todayKey);
    const isWork = isWorkDayFn({ ...DEFAULT_SETTINGS, workHoursEnabled, workDays });
    return { streak: computeStreak(allStats, today, isWork), week: lastDays(allStats, today, 7, isWork) };
  }, [allStats, todayKey, workHoursEnabled, workDays]);

  const askNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported" as const;
    if (Notification.permission === "default") return Notification.requestPermission();
    return Notification.permission;
  }, []);

  const outsideNow = () => !isWithinWorkHours(settingsRef.current, new Date());

  const actions = {
    start: () => {
      unlockAudio();
      if (settingsRef.current.notifications) void askNotifications();
      const t = Date.now();
      lastBlinkRef.current = t;
      setNow(t);
      setAutoPaused(false);
      if (outsideNow()) setOverride(true);
      setState(startFocus(settingsRef.current, t));
    },
    pause: () => {
      setAutoPaused(false);
      setState((s) => pauseState(s, Date.now()));
    },
    resume: () => {
      unlockAudio();
      const t = Date.now();
      setNow(t);
      setAutoPaused(false);
      if (outsideNow()) setOverride(true);
      setState((s) => resumeState(s, t));
    },
    stop: () => {
      setAutoPaused(false);
      setState(IDLE);
    },
    breakNow: () => {
      unlockAudio();
      const t = Date.now();
      setNow(t);
      setState(startBreak(settingsRef.current, t));
    },
    skipBreak: () => {
      bumpStats("skipped");
      const t = Date.now();
      lastBlinkRef.current = t;
      setNow(t);
      setState(startFocus(settingsRef.current, t));
    },
    snooze: () => {
      const t = Date.now();
      setNow(t);
      setState(snoozeState(settingsRef.current, t));
      toast("Snoozed for 5 minutes");
    },
    dismissBlink: () => setBlinkCue(false),
  };

  return {
    settings,
    updateSettings,
    state,
    now,
    remaining,
    stats,
    streak,
    week,
    inHours,
    autoPaused,
    blinkCue,
    actions,
    askNotifications,
  };
}
