import { Check, Play } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DAY_LETTER, type EyeSettings } from "@/lib/eye-timer";
import { SOUNDS, playSound, unlockAudio } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: EyeSettings;
  onChange: (patch: Partial<EyeSettings>) => void;
  askNotifications: () => Promise<NotificationPermission | "unsupported">;
}

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-primary">{title}</h3>
      {children}
    </section>
  );
}

function Row({ id, title, hint, children }: { id: string; title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <Label htmlFor={id} className="text-sm font-semibold">
          {title}
        </Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function SliderField(props: {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label className="text-sm font-semibold">{props.label}</Label>
        <span className="font-display tabular text-lg">
          {props.value} {props.suffix}
        </span>
      </div>
      <Slider
        className="mt-3"
        min={props.min}
        max={props.max}
        step={props.step}
        value={[props.value]}
        onValueChange={(v) => props.onChange(v[0] ?? props.value)}
        aria-label={props.label}
      />
    </div>
  );
}

export function SettingsSheet({ open, onOpenChange, settings, onChange, askNotifications }: Props) {
  const toggleDay = (d: number) => {
    const has = settings.workDays.includes(d);
    onChange({ workDays: has ? settings.workDays.filter((x) => x !== d) : [...settings.workDays, d] });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl font-normal">Your rhythm</SheetTitle>
          <SheetDescription>The defaults follow the 20-20-20 rule. Adjust only if you need to.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-9 pb-6">
          <Group title="Timing">
            <div className="space-y-6">
              <SliderField
                label="Screen time before a break"
                value={settings.focusMinutes}
                suffix="min"
                min={5}
                max={60}
                step={5}
                onChange={(v) => onChange({ focusMinutes: v })}
              />
              <SliderField
                label="Look-away time"
                value={settings.breakSeconds}
                suffix="sec"
                min={20}
                max={60}
                step={5}
                onChange={(v) => onChange({ breakSeconds: v })}
              />
            </div>
          </Group>

          <Group title="Working hours">
            <div className="rounded-2xl border bg-card px-4">
              <Row id="workhours" title="Only during working hours" hint="Reminders rest outside these times">
                <Switch
                  id="workhours"
                  checked={settings.workHoursEnabled}
                  onCheckedChange={(v) => onChange({ workHoursEnabled: v })}
                />
              </Row>
              {settings.workHoursEnabled && (
                <div className="space-y-4 border-t pb-4 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="ws" className="text-xs text-muted-foreground">
                        Starts
                      </Label>
                      <Input
                        id="ws"
                        type="time"
                        value={settings.workStart}
                        onChange={(e) => e.target.value && onChange({ workStart: e.target.value })}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="we" className="text-xs text-muted-foreground">
                        Ends
                      </Label>
                      <Input
                        id="we"
                        type="time"
                        value={settings.workEnd}
                        onChange={(e) => e.target.value && onChange({ workEnd: e.target.value })}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Work days</p>
                    <div className="mt-2 flex justify-between gap-1">
                      {DAY_ORDER.map((d) => {
                        const on = settings.workDays.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            aria-pressed={on}
                            aria-label={DAY_NAMES[d]}
                            onClick={() => toggleDay(d)}
                            className={cn(
                              "h-9 w-9 rounded-full text-xs font-semibold transition-colors",
                              on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary",
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
              )}
            </div>
          </Group>

          <Group title="Sound">
            <div className="rounded-2xl border bg-card px-4">
              <Row id="sound" title="Play a sound" hint="When a break starts and ends">
                <Switch id="sound" checked={settings.sound} onCheckedChange={(v) => onChange({ sound: v })} />
              </Row>
            </div>
            {settings.sound && (
              <div className="mt-3 space-y-4">
                <div role="radiogroup" aria-label="Break sound" className="grid gap-2">
                  {SOUNDS.map((s) => {
                    const on = settings.soundKind === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => {
                          unlockAudio();
                          onChange({ soundKind: s.id });
                          playSound(s.id, settings.volume, "start");
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                          on ? "border-primary bg-secondary" : "bg-card hover:bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {on ? <Check className="h-4 w-4" /> : <Play className="h-3.5 w-3.5" />}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">{s.label}</span>
                          <span className="block text-xs text-muted-foreground">{s.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <SliderField
                  label="Volume"
                  value={settings.volume}
                  suffix="%"
                  min={10}
                  max={100}
                  step={10}
                  onChange={(v) => onChange({ volume: v })}
                />
                <p className="text-xs text-muted-foreground">Tap a sound to hear it.</p>
              </div>
            )}
          </Group>

          <Group title="Reminders">
            <div className="divide-y rounded-2xl border bg-card px-4">
              <Row id="notify" title="Pop-up alerts" hint="Get reminded even when this tab is hidden">
                <Switch
                  id="notify"
                  checked={settings.notifications}
                  onCheckedChange={async (v) => {
                    onChange({ notifications: v });
                    if (v) {
                      const p = await askNotifications();
                      if (p === "denied") toast.error("Alerts are blocked in your browser settings.");
                      if (p === "unsupported") toast("This browser doesn't support pop-up alerts.");
                    }
                  }}
                />
              </Row>
              <Row id="blink" title="Blink nudges" hint="A quiet reminder to blink fully">
                <Switch id="blink" checked={settings.blinkNudges} onCheckedChange={(v) => onChange({ blinkNudges: v })} />
              </Row>
            </div>
            {settings.blinkNudges && (
              <div className="mt-4">
                <SliderField
                  label="Blink nudge every"
                  value={settings.blinkEveryMinutes}
                  suffix="min"
                  min={2}
                  max={10}
                  step={1}
                  onChange={(v) => onChange({ blinkEveryMinutes: v })}
                />
              </div>
            )}
          </Group>
        </div>
      </SheetContent>
    </Sheet>
  );
}
