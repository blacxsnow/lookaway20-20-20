import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DAY_LETTER, type EyeSettings } from "@/lib/eye-timer";
import { cn } from "@/lib/utils";

import { PanelDialog } from "./PanelDialog";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: EyeSettings;
  onChange: (patch: Partial<EyeSettings>) => void;
}

export function WorkHoursDialog({ open, onOpenChange, settings, onChange }: Props) {
  const toggleDay = (d: number) => {
    const has = settings.workDays.includes(d);
    onChange({ workDays: has ? settings.workDays.filter((x) => x !== d) : [...settings.workDays, d] });
  };
  const on = settings.workHoursEnabled;

  return (
    <PanelDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Working hours"
      description="Reminders only run during these times. Outside them, the timer rests."
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
        <Label htmlFor="wh-on" className="text-sm font-semibold">
          Only during working hours
        </Label>
        <Switch id="wh-on" checked={on} onCheckedChange={(v) => onChange({ workHoursEnabled: v })} />
      </div>

      <div className={cn("space-y-4 transition-opacity", !on && "pointer-events-none opacity-40")} aria-disabled={!on}>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border bg-card p-3">
            <Label htmlFor="wh-start" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Start
            </Label>
            <Input
              id="wh-start"
              type="time"
              value={settings.workStart}
              disabled={!on}
              onChange={(e) => e.target.value && onChange({ workStart: e.target.value })}
              className="mt-1 h-9 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="rounded-2xl border bg-card p-3">
            <Label htmlFor="wh-end" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              End
            </Label>
            <Input
              id="wh-end"
              type="time"
              value={settings.workEnd}
              disabled={!on}
              onChange={(e) => e.target.value && onChange({ workEnd: e.target.value })}
              className="mt-1 h-9 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Work days</p>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {DAY_ORDER.map((d) => {
              const active = settings.workDays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  aria-label={DAY_NAMES[d]}
                  disabled={!on}
                  onClick={() => toggleDay(d)}
                  className={cn(
                    "aspect-square w-full rounded-full text-xs font-semibold transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {DAY_LETTER[d]}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Days off won't break your streak.</p>
        </div>
      </div>
    </PanelDialog>
  );
}
