import { cn } from "@/lib/utils";

interface Props {
  progress: number;
  label: string;
  caption: string;
  tone?: "focus" | "idle";
  className?: string;
}

const R = 140;
const C = 2 * Math.PI * R;

export function TimerRing({ progress, label, caption, tone = "focus", className }: Props) {
  const dash = C * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[320px]", className)}>
      <div className="absolute inset-6 rounded-full bg-card shadow-soft" />
      <svg viewBox="0 0 320 320" className="relative h-full w-full -rotate-90">
        <circle cx="160" cy="160" r={R} fill="none" className="stroke-track" strokeWidth="10" />
        <circle
          cx="160"
          cy="160"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={dash}
          className={cn(
            "transition-[stroke-dashoffset] duration-300 ease-linear",
            tone === "idle" ? "stroke-track" : "stroke-primary",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display tabular text-6xl font-light text-foreground sm:text-7xl">
          {label}
        </span>
        <span className="mt-2 max-w-[11rem] text-sm text-muted-foreground">{caption}</span>
      </div>
    </div>
  );
}
