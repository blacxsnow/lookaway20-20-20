import { Settings2, Volume2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { playChime, unlockAudio } from "@/lib/chime";
import type { EyeSettings } from "@/lib/eye-timer";

interface Props {
  settings: EyeSettings;
  onChange: (patch: Partial<EyeSettings>) => void;
  askNotifications: () => Promise<NotificationPermission | "unsupported">;
}

function Row({ id, title, hint, children }: { id: string; title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
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

export function SettingsSheet({ settings, onChange, askNotifications }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="soft" size="icon" aria-label="Settings">
          <Settings2 />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl font-normal">Your rhythm</SheetTitle>
          <SheetDescription>
            The defaults follow the 20-20-20 rule. Adjust only if you need to.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          <div>
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-semibold">Screen time before a break</Label>
              <span className="font-display tabular text-xl">{settings.focusMinutes} min</span>
            </div>
            <Slider
              className="mt-4"
              min={5}
              max={60}
              step={5}
              value={[settings.focusMinutes]}
              onValueChange={(v) => onChange({ focusMinutes: v[0] ?? 20 })}
              aria-label="Screen time before a break"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-semibold">Look-away time</Label>
              <span className="font-display tabular text-xl">{settings.breakSeconds} sec</span>
            </div>
            <Slider
              className="mt-4"
              min={20}
              max={60}
              step={5}
              value={[settings.breakSeconds]}
              onValueChange={(v) => onChange({ breakSeconds: v[0] ?? 20 })}
              aria-label="Look-away time"
            />
          </div>

          <div className="divide-y rounded-2xl border bg-card px-4">
            <Row id="sound" title="Chime" hint="A soft sound when a break starts and ends">
              <Switch id="sound" checked={settings.sound} onCheckedChange={(v) => onChange({ sound: v })} />
            </Row>
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
              <Switch
                id="blink"
                checked={settings.blinkNudges}
                onCheckedChange={(v) => onChange({ blinkNudges: v })}
              />
            </Row>
          </div>

          {settings.blinkNudges && (
            <div>
              <div className="flex items-baseline justify-between">
                <Label className="text-sm font-semibold">Blink nudge every</Label>
                <span className="font-display tabular text-xl">{settings.blinkEveryMinutes} min</span>
              </div>
              <Slider
                className="mt-4"
                min={2}
                max={10}
                step={1}
                value={[settings.blinkEveryMinutes]}
                onValueChange={(v) => onChange({ blinkEveryMinutes: v[0] ?? 5 })}
                aria-label="Blink nudge interval"
              />
            </div>
          )}

          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={() => {
              unlockAudio();
              playChime("break");
            }}
          >
            <Volume2 /> Play the chime
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
