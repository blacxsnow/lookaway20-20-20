import { Check, Play } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { EyeSettings } from "@/lib/eye-timer";
import { SOUNDS, playSound, unlockAudio } from "@/lib/sounds";
import { cn } from "@/lib/utils";

import { PanelDialog } from "./PanelDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: EyeSettings;
  onChange: (patch: Partial<EyeSettings>) => void;
}

export function SoundDialog({ open, onOpenChange, settings, onChange }: Props) {
  const on = settings.sound;
  return (
    <PanelDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sound & volume"
      description="Plays when a break starts and ends. Tap a sound to hear it."
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
        <Label htmlFor="snd-on" className="text-sm font-semibold">
          Play a sound
        </Label>
        <Switch id="snd-on" checked={on} onCheckedChange={(v) => onChange({ sound: v })} />
      </div>

      <div className={cn("space-y-5 transition-opacity", !on && "pointer-events-none opacity-40")} aria-disabled={!on}>
        <div role="radiogroup" aria-label="Break sound" className="grid gap-1.5">
          {SOUNDS.map((s) => {
            const selected = settings.soundKind === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!on}
                onClick={() => {
                  unlockAudio();
                  onChange({ soundKind: s.id });
                  playSound(s.id, settings.volume, "start");
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors",
                  selected ? "border-primary bg-secondary" : "bg-card hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {selected ? <Check className="h-4 w-4" /> : <Play className="h-3.5 w-3.5" />}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{s.label}</span>
                  <span className="block text-xs text-muted-foreground">{s.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <Label className="text-sm font-semibold">Volume</Label>
            <span className="font-display tabular text-lg">{settings.volume}%</span>
          </div>
          <Slider
            className="mt-3"
            min={10}
            max={100}
            step={10}
            value={[settings.volume]}
            disabled={!on}
            onValueChange={(v) => onChange({ volume: v[0] ?? settings.volume })}
            onValueCommit={(v) => {
              unlockAudio();
              playSound(settings.soundKind, v[0] ?? settings.volume, "start");
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </PanelDialog>
  );
}
