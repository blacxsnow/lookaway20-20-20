import { useState } from "react";
import { Info, Star } from "lucide-react";
import { toast } from "sonner";

import { Item } from "@/components/eye/EyeCareGuide";
import { PanelDialog } from "@/components/eye/PanelDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { KIDS_LIMITS_NOTE, KIDS_TIPS } from "@/lib/eye-care-guide";
import { formatDuration, type DayStats } from "@/lib/eye-timer";
import {
  ALLOWANCE_MAX,
  ALLOWANCE_MIN,
  addBonus,
  allowanceLeftMs,
  clampAllowance,
  hashPin,
  isValidPin,
  type KidsSettings,
} from "@/lib/kids-mode";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  kids: KidsSettings;
  onChange: (patch: Partial<KidsSettings>) => void;
  todayKey: string;
  stats: DayStats;
}

/** Parent-only panel. When Kids mode is on, the caller asks for the PIN before opening it. */
export function KidsDialog({ open, onOpenChange, kids, onChange, todayKey, stats }: Props) {
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [allowance, setAllowance] = useState(kids.allowanceMinutes);

  const turnOn = async () => {
    if (!kids.pinHash) {
      if (!isValidPin(pin)) { toast.error("Choose a 4-digit PIN."); return; }
      if (pin !== pin2) { toast.error("The two PINs don't match."); return; }
    }
    const pinHash = kids.pinHash ?? (await hashPin(pin));
    onChange({ enabled: true, allowanceMinutes: clampAllowance(allowance), pinHash });
    setPin("");
    setPin2("");
    onOpenChange(false);
    toast.success("Kids mode is on.");
  };

  const left = allowanceLeftMs(kids, todayKey, stats.screenMs);

  return (
    <PanelDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Kids mode"
      description="A daily screen-time allowance, playful eye breaks and a parent PIN."
    >
      <div className="space-y-5">
        {kids.enabled && (
          <section className="rounded-2xl bg-secondary p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Today</p>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <dd className="font-display text-xl">{formatDuration(stats.screenMs)}</dd>
                <dt className="text-[10px] uppercase text-muted-foreground">Screen time</dt>
              </div>
              <div>
                <dd className="font-display text-xl">{formatDuration(left)}</dd>
                <dt className="text-[10px] uppercase text-muted-foreground">Left</dt>
              </div>
              <div>
                <dd className="flex items-center justify-center gap-1 font-display text-xl">
                  {stats.breaks} <Star className="h-4 w-4 fill-accent text-accent" />
                </dd>
                <dt className="text-[10px] uppercase text-muted-foreground">Breaks · {stats.skipped} skipped</dt>
              </div>
            </dl>
            <Button
              variant="soft"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                const next = addBonus(kids, todayKey);
                onChange(next);
                toast.success("Added 15 minutes for today.");
              }}
            >
              Add 15 minutes today
            </Button>
          </section>
        )}

        <div>
          <div className="flex items-baseline justify-between">
            <Label className="text-sm font-semibold">Daily allowance</Label>
            <span className="font-display tabular text-lg">{formatDuration(allowance * 60_000)}</span>
          </div>
          <Slider
            className="mt-3"
            min={ALLOWANCE_MIN}
            max={ALLOWANCE_MAX}
            step={15}
            value={[allowance]}
            onValueChange={(v) => {
              const m = v[0] ?? allowance;
              setAllowance(m);
              if (kids.enabled) onChange({ allowanceMinutes: clampAllowance(m) });
            }}
            aria-label="Daily allowance"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Counts while this app is open on screen. When it runs out, a "time's up" screen appears.
          </p>
        </div>

        {!kids.enabled && !kids.pinHash && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="pin1" className="text-xs font-semibold">Parent PIN</Label>
              <Input id="pin1" inputMode="numeric" type="password" maxLength={4} value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className="mt-1 rounded-xl text-center tracking-[0.4em]" />
            </div>
            <div>
              <Label htmlFor="pin2" className="text-xs font-semibold">Repeat PIN</Label>
              <Input id="pin2" inputMode="numeric" type="password" maxLength={4} value={pin2}
                onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} className="mt-1 rounded-xl text-center tracking-[0.4em]" />
            </div>
          </div>
        )}

        {kids.enabled ? (
          <Button variant="soft" className="w-full" onClick={() => { onChange({ enabled: false }); onOpenChange(false); toast("Kids mode is off."); }}>
            Turn off Kids mode
          </Button>
        ) : (
          <Button variant="hero" className="w-full" onClick={turnOn}>
            Turn on Kids mode
          </Button>
        )}
        {kids.pinHash && !kids.enabled && (
          <button type="button" className="w-full text-xs text-muted-foreground underline"
            onClick={() => { onChange({ pinHash: null }); toast("PIN cleared. Choose a new one."); }}>
            Choose a new PIN
          </button>
        )}

        <p className="flex gap-2 rounded-2xl border bg-card p-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 text-primary" /> {KIDS_LIMITS_NOTE}
        </p>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">For parents</h3>
          <ul className="space-y-2">
            {KIDS_TIPS.map((t) => (
              <Item key={t.title} item={t} />
            ))}
          </ul>
        </section>
      </div>
    </PanelDialog>
  );
}
