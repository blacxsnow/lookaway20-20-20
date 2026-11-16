import { createFileRoute } from "@tanstack/react-router";
import { Coffee, Eye, Pause, Play, RotateCcw, TimerReset } from "lucide-react";

import { BlinkCue } from "@/components/eye/BlinkCue";
import { BreakOverlay } from "@/components/eye/BreakOverlay";
import { HowItWorks } from "@/components/eye/HowItWorks";
import { SettingsSheet } from "@/components/eye/SettingsSheet";
import { TimerRing } from "@/components/eye/TimerRing";
import { Button } from "@/components/ui/button";
import { useEyeTimer } from "@/hooks/use-eye-timer";
import { formatClock, isPaused, progress } from "@/lib/eye-timer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lookaway — 20-20-20 eye break reminder" },
      {
        name: "description",
        content:
          "A gentle timer for screen-time eye strain: every 20 minutes, look 20 feet away for 20 seconds, with blink reminders.",
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
  const { settings, updateSettings, state, now, remaining, stats, blinkCue, actions, askNotifications } =
    useEyeTimer();

  const paused = isPaused(state);
  const idle = state.phase === "idle";
  const restSeconds = stats.breaks * settings.breakSeconds;

  const label = idle ? formatClock(settings.focusMinutes * 60_000) : formatClock(remaining);
  const caption = idle
    ? "of screen time, then a 20-second eye break"
    : paused
      ? "paused"
      : "until your next eye break";

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Eye className="h-4.5 w-4.5 animate-blink" />
          </span>
          <span className="font-display text-xl">Lookaway</span>
        </div>
        <SettingsSheet settings={settings} onChange={updateSettings} askNotifications={askNotifications} />
      </header>

      <main className="mx-auto grid max-w-5xl gap-14 px-5 pb-24 pt-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:pt-14">
        <section className="flex flex-col items-center text-center lg:sticky lg:top-10 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            20 · 20 · 20 eye care
          </p>
          <h1 className="mt-3 max-w-sm text-4xl font-light leading-[1.1] sm:text-5xl">
            Give your eyes <em className="text-primary">a little distance.</em>
          </h1>

          <TimerRing
            className="mt-8"
            progress={progress(state, now)}
            label={label}
            caption={caption}
            tone={idle ? "idle" : "focus"}
          />

          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
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
                <Play /> Resume
              </Button>
            )}
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
          </div>

          <p className="mt-4 max-w-xs text-xs text-muted-foreground">
            Keep this tab open. We'll chime and pop up an alert when it's time to look away.
          </p>

          <dl className="mt-10 grid w-full max-w-sm grid-cols-3 gap-2">
            {[
              { k: "Breaks today", v: stats.breaks },
              { k: "Skipped", v: stats.skipped },
              { k: "Eyes rested", v: restSeconds >= 60 ? `${Math.floor(restSeconds / 60)}m` : `${restSeconds}s` },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border bg-card px-3 py-4">
                <dd className="font-display tabular text-3xl font-light">{s.v}</dd>
                <dt className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.k}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        <HowItWorks />
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-10 text-xs text-muted-foreground">
        Lookaway is a habit helper, not medical advice. If eye pain, headaches or blurry vision
        persist, see an eye doctor.
      </footer>

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
