import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { playChime, unlockAudio } from "@/lib/chime";
import {
  DEFAULT_SETTINGS,
  EMPTY_DAY,
  IDLE,
  dayKey,
  formatClock,
  isPaused,
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
  const [stats, setStats] = useState<DayStats>(EMPTY_DAY);
  const [blinkCue, setBlinkCue] = useState(false);
  const lastBlinkRef = useRef<number>(Date.now());

  // Load saved settings and today's stats after hydration.
  useEffect(() => {
    setSettings(readJSON(SETTINGS_KEY, DEFAULT_SETTINGS));
    const all = readJSON<Record<string, DayStats>>(STATS_KEY, {});
    setStats(all[dayKey(new Date())] ?? EMPTY_DAY);
  }, []);

  const updateSettings = useCallback((patch: Partial<EyeSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const bumpStats = useCallback((field: keyof DayStats) => {
    setStats((prev) => {
      const next = { ...prev, [field]: prev[field] + 1 };
      const all = readJSON<Record<string, DayStats>>(STATS_KEY, {});
      all[dayKey(new Date())] = next;
      localStorage.setItem(STATS_KEY, JSON.stringify(all));
      return next;
    });
  }, []);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Heartbeat while running.
  const running = state.phase !== "idle" && !isPaused(state);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);

  // Phase transitions.
  useEffect(() => {
    const s = settingsRef.current;
    const r = tick(state, s, now);
    if (!r.event) return;
    setState(r.state);
    if (r.event === "break-start") {
      if (s.sound) playChime("break");
      notify("Time to look away", `Look at something ${20} feet (6 m) away for ${s.breakSeconds} seconds.`);
    } else {
      bumpStats("breaks");
      if (s.sound) playChime("focus");
      notify("Nice — eyes rested", `Next break in ${s.focusMinutes} minutes.`);
      toast.success("Break complete. Your eyes thank you.");
      lastBlinkRef.current = Date.now();
    }
  }, [now, state, bumpStats]);

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

  const askNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported" as const;
    if (Notification.permission === "default") return Notification.requestPermission();
    return Notification.permission;
  }, []);

  const begin = useCallback(() => {
    unlockAudio();
    if (settingsRef.current.notifications) void askNotifications();
    const t = Date.now();
    lastBlinkRef.current = t;
    setNow(t);
    setState(startFocus(settingsRef.current, t));
  }, [askNotifications]);

  const actions = {
    start: begin,
    pause: () => setState((s) => pauseState(s, Date.now())),
    resume: () => {
      const t = Date.now();
      setNow(t);
      setState((s) => resumeState(s, t));
    },
    stop: () => setState(IDLE),
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

  return { settings, updateSettings, state, now, remaining, stats, blinkCue, actions, askNotifications };
}
