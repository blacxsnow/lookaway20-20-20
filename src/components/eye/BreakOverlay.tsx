import { useEffect, useState } from "react";
import { SkipForward } from "lucide-react";

import horizon from "@/assets/distant-horizon.jpg";
import { Button } from "@/components/ui/button";

const PROMPTS = [
  "Find something about 20 feet (6 m) away",
  "Let your eyes go soft and relaxed",
  "Blink slowly, a few times",
  "Breathe out. Unclench your jaw",
];

interface Props {
  secondsLeft: number;
  totalSeconds: number;
  onSkip: () => void;
}

export function BreakOverlay({ secondsLeft, totalSeconds, onSkip }: Props) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % PROMPTS.length), 5000);
    return () => window.clearInterval(id);
  }, []);

  const pct = Math.max(0, Math.min(100, (1 - secondsLeft / totalSeconds) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Eye break"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-night text-night-foreground animate-in fade-in duration-500"
    >
      <img
        src={horizon}
        alt=""
        width={1024}
        height={1536}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-night-veil" />

      <div className="relative flex flex-1 flex-col items-center justify-end px-6 pb-10 text-center sm:justify-center sm:pb-0">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-night-foreground/70">
          Eye break
        </p>
        <h2 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">
          Look into the distance
        </h2>

        <div className="relative my-10 flex h-44 w-44 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-night-foreground/40 animate-ripple" />
          <span
            className="absolute inset-0 rounded-full border border-night-foreground/30 animate-ripple"
            style={{ animationDelay: "2s" }}
          />
          <span className="absolute inset-4 rounded-full bg-night-foreground/10 backdrop-blur-sm animate-breathe" />
          <span className="relative font-display tabular text-7xl font-light">{secondsLeft}</span>
        </div>

        <p key={i} className="min-h-[3.5rem] max-w-xs text-lg text-night-foreground/90 animate-rise">
          {PROMPTS[i]}
        </p>

        <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-night-foreground/20">
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>

        <Button variant="veil" size="sm" className="mt-8" onClick={onSkip}>
          <SkipForward /> Skip this break
        </Button>
      </div>
    </div>
  );
}
