import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Clock, Coffee, Eye, Pause, Play, RotateCcw, Settings2, TimerReset } from "lucide-react";

import { BlinkCue } from "@/components/eye/BlinkCue";
import { BreakOverlay } from "@/components/eye/BreakOverlay";
import { EyeCareGuide } from "@/components/eye/EyeCareGuide";
import { HowItWorks } from "@/components/eye/HowItWorks";
import { SettingsSheet } from "@/components/eye/SettingsSheet";
import { SoundDialog } from "@/components/eye/SoundDialog";
import { StreakCard } from "@/components/eye/StreakCard";
import { TimerRing } from "@/components/eye/TimerRing";
import { WorkHoursDialog } from "@/components/eye/WorkHoursDialog";
import { Button } from "@/components/ui/button";
import { useEyeTimer } from "@/hooks/use-eye-timer";
import { formatClock, formatTime12, isPaused, progress, workHoursSummary } from "@/lib/eye-timer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lookaway — 20-20-20 eye break reminder" },
      {
        name: "description",
        content:
          "A gentle timer for screen-time eye strain: every 20 minutes, look 20 feet away for 20 seconds, with streaks and working hours.",
      },
      { property: "og:title", content: "Lookaway — 20-20-20 eye break reminder" },
      {
        property: "og:description",
        content: "Every 20 minutes, look 20 feet away for 20 seconds. Rest tired eyes with gentle reminders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const {
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
  } = useEyeTimer();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workHoursOpen, setWorkHoursOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const paused = isPaused(state);
  const idle = state.phase === "idle";
  const restSeconds = stats.breaks * settings.breakSeconds;

  const label = idle ? formatClock(settings.focusMinutes * 60_000) : formatClock(remaining);
  const caption = idle
    ? `of screen time, then a ${settings.breakSeconds}-second eye break`
    : autoPaused
      ? `resting until ${formatTime12(settings.workStart)}`
      : paused
        ? "paused"
        : "until your next eye break";

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Eye className="h-4.5 w-4.5 animate-blink" />
          </span>
          <span className="font-display text-xl">Lookaway</span>
        </div>
        <Button variant="soft" size="icon" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
          <Settings2 />
        </Button>
      </header>

      <main className="mx-auto flex max-w-md flex-col items-center gap-6 px-5 pb-16 pt-6 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">20 · 20 · 20 eye care</p>
          <h1 className="mt-2 text-3xl font-light leading-tight sm:text-4xl">
            Give your eyes <em className="text-primary">a little distance.</em>
          </h1>
        </div>

        <TimerRing
          progress={progress(state, now)}
          label={label}
          caption={caption}
          tone={idle ? "idle" : "focus"}
          className="max-w-[280px]"
        />

        <div className="flex w-full max-w-xs flex-col gap-3">
          {idle && (
            <Button variant="hero" size="xl" onClick={actions.start}>
              <Play /> Start screen time
            </Button>
          )}
          {!idle && !paused && (
            <Button variant="hero" size="xl" onClick={actions.pause}>
              <Pause /> Pause
            </Button>
          )}
          {!idle && paused && (
            <Button variant="hero" size="xl" onClick={actions.resume}>
              <Play /> {autoPaused ? "Keep going anyway" : "Resume"}
            </Button>
          )}
          <button
            type="button"
            onClick={() => setWorkHoursOpen(true)}
            className="flex w-full items-center gap-3 rounded-full border bg-card py-2 pl-2 pr-4 text-left transition-colors hover:bg-muted"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Clock className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                Working hours
                {settings.workHoursEnabled && (
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", inHours ? "bg-primary" : "bg-accent")}
                    aria-label={inHours ? "In working hours" : "Outside working hours"}
                  />
                )}
              </span>
              <span className="block truncate text-xs text-muted-foreground">{workHoursSummary(settings)}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          {!idle && (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="soft" onClick={actions.breakNow}>
                <Coffee /> Break
              </Button>
              <Button variant="soft" onClick={actions.snooze}>
                <TimerReset /> +5 min
              </Button>
              <Button variant="soft" onClick={actions.stop}>
                <RotateCcw /> Stop
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Keep this tab open. We'll play a sound and pop up an alert when it's time to look away.
          </p>
        </div>

        <div className="w-full space-y-3">
          <StreakCard streak={streak} week={week} />

          <dl className="grid grid-cols-3 gap-2">
            {[
              { k: "Breaks today", v: stats.breaks },
              { k: "Skipped", v: stats.skipped },
              { k: "Eyes rested", v: restSeconds >= 60 ? `${Math.floor(restSeconds / 60)}m` : `${restSeconds}s` },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border bg-card px-2 py-3">
                <dd className="font-display tabular text-2xl font-light">{s.v}</dd>
                <dt className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.k}
                </dt>
              </div>
            ))}
          </dl>

          <HowItWorks />

          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="flex w-full items-center gap-4 rounded-3xl bg-primary p-5 text-left text-primary-foreground shadow-soft transition-transform active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl">Eye-care tips</span>
              <span className="block text-xs opacity-80">Backed by eye doctors and published research</span>
            </span>
            <ChevronRight className="h-5 w-5 opacity-80" />
          </button>
        </div>
      </main>

      <footer className="mx-auto max-w-md px-5 pb-10 text-center text-xs text-muted-foreground">
        A habit helper, not medical advice. If eye pain, headaches or blurry vision persist, see an eye doctor.
      </footer>

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onChange={updateSettings}
        askNotifications={askNotifications}
        onOpenWorkHours={() => setWorkHoursOpen(true)}
        onOpenSound={() => setSoundOpen(true)}
      />
      <WorkHoursDialog
        open={workHoursOpen}
        onOpenChange={setWorkHoursOpen}
        settings={settings}
        onChange={updateSettings}
      />
      <SoundDialog open={soundOpen} onOpenChange={setSoundOpen} settings={settings} onChange={updateSettings} />
      <EyeCareGuide open={guideOpen} onOpenChange={setGuideOpen} />

      {state.phase === "break" && (
        <BreakOverlay
          secondsLeft={Math.ceil(remaining / 1000)}
          totalSeconds={state.durationMs / 1000}
          onSkip={actions.skipBreak}
        />
      )}
      {blinkCue && state.phase === "focus" && <BlinkCue onClose={actions.dismissBlink} />}
    </div>
  );
}
