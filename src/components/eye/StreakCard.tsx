import { Check, Flame } from "lucide-react";

import type { DayDot, Streak } from "@/lib/eye-timer";
import { cn } from "@/lib/utils";

export function StreakCard({ streak, week }: { streak: Streak; week: DayDot[] }) {
  const doneToday = week.at(-1)?.done ?? false;
  return (
    <section className="rounded-3xl bg-secondary p-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            streak.current > 0 ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground",
          )}
        >
          <Flame className="h-5 w-5" />
        </span>
        <div className="flex-1 text-left">
          <p className="font-display text-2xl leading-none">
            {streak.current} <span className="text-base">day streak</span>
          </p>
          <p className="mt-1 text-xs text-secondary-foreground/80">
            {doneToday
              ? `Today counts! Best: ${streak.best} ${streak.best === 1 ? "day" : "days"}`
              : "Finish one eye break today to keep it going"}
          </p>
        </div>
      </div>

      <ol className="mt-4 grid grid-cols-7 gap-1">
        {week.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-1">
            <span
              aria-label={`${d.key}: ${d.done ? "done" : d.restDay ? "rest day" : "no break"}`}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs",
                d.done && "bg-primary text-primary-foreground",
                !d.done && d.isToday && "border-2 border-dashed border-primary",
                !d.done && !d.isToday && d.restDay && "bg-muted text-muted-foreground",
                !d.done && !d.isToday && !d.restDay && "border bg-card",
              )}
            >
              {d.done ? <Check className="h-4 w-4" /> : d.restDay && !d.isToday ? "–" : null}
            </span>
            <span className={cn("text-[10px] font-semibold", d.isToday ? "text-primary" : "text-muted-foreground")}>
              {d.letter}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
