import { PanelDialog } from "@/components/eye/PanelDialog";
import { formatDuration, type weekInsights } from "@/lib/eye-timer";
import { cn } from "@/lib/utils";

type Insights = ReturnType<typeof weekInsights>;

export function InsightsDialog({ open, onOpenChange, insights }: { open: boolean; onOpenChange: (o: boolean) => void; insights: Insights }) {
  const max = Math.max(1, ...insights.days.map((d) => d.breaks + d.skipped));
  return (
    <PanelDialog open={open} onOpenChange={onOpenChange} title="Your week" description="The last 7 days of eye breaks.">
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          { k: "Breaks taken", v: insights.breaks },
          { k: "Finished", v: insights.finishRate === null ? "–" : `${insights.finishRate}%` },
          { k: "Screen time", v: formatDuration(insights.screenMs) },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border bg-card px-2 py-3">
            <dd className="font-display tabular text-2xl font-light">{s.v}</dd>
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.k}</dt>
          </div>
        ))}
      </dl>
      <div className="mt-2 flex h-36 items-end gap-2" aria-label="Breaks per day">
        {insights.days.map((d) => (
          <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 flex-col justify-end overflow-hidden rounded-lg bg-muted">
              <div className="bg-accent" style={{ height: `${(d.skipped / max) * 100}%` }} title={`${d.skipped} skipped`} />
              <div className="bg-primary" style={{ height: `${(d.breaks / max) * 100}%` }} title={`${d.breaks} taken`} />
            </div>
            <span className={cn("text-xs", d.isToday ? "font-bold text-primary" : "text-muted-foreground")}>{d.letter}</span>
          </div>
        ))}
      </div>
      <p className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Taken</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Skipped</span>
      </p>
      <p className="text-sm text-muted-foreground">
        {insights.activeDays === 0
          ? "Take your first break to start your week."
          : `You rested your eyes on ${insights.activeDays} of the last 7 days.`}
      </p>
    </PanelDialog>
  );
}
