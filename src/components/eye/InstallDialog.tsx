import { useEffect, useState } from "react";
import { Share, MoreVertical, PlusSquare } from "lucide-react";

import { PanelDialog } from "@/components/eye/PanelDialog";
import { Button } from "@/components/ui/button";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function useInstallPrompt() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  return { event, installed };
}

export function InstallDialog({ open, onOpenChange, event }: { open: boolean; onOpenChange: (o: boolean) => void; event: InstallPromptEvent | null }) {
  const [ios, setIos] = useState(false);
  useEffect(() => setIos(/iphone|ipad|ipod/i.test(navigator.userAgent)), []);

  const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
    <li className="flex gap-3 rounded-2xl border bg-card p-3 text-sm">
      <span className="font-display text-lg leading-none text-primary">{n}</span>
      <span className="flex flex-wrap items-center gap-1">{children}</span>
    </li>
  );

  return (
    <PanelDialog open={open} onOpenChange={onOpenChange} title="Install on your phone"
      description="Lookaway gets its own icon, opens full screen and works without internet after the first visit.">
      {event && (
        <Button variant="hero" className="w-full" onClick={async () => { await event.prompt(); onOpenChange(false); }}>
          <PlusSquare /> Install now
        </Button>
      )}
      <div className="space-y-4">
        <section className={ios ? "order-first" : ""}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">iPhone / iPad</h3>
          <ol className="space-y-2">
            <Step n={1}>Open this page in <b>Safari</b></Step>
            <Step n={2}>Tap <Share className="h-4 w-4" /> <b>Share</b></Step>
            <Step n={3}>Choose <b>Add to Home Screen</b></Step>
          </ol>
        </section>
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Android</h3>
          <ol className="space-y-2">
            <Step n={1}>Open this page in <b>Chrome</b></Step>
            <Step n={2}>Tap the <MoreVertical className="h-4 w-4" /> menu</Step>
            <Step n={3}>Choose <b>Install app</b> or <b>Add to Home screen</b></Step>
          </ol>
        </section>
        <section className="rounded-2xl border bg-card p-3 text-xs text-muted-foreground">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Reminders on Android</h3>
          <ul className="list-disc space-y-1 pl-4">
            <li>Pop-up reminders work best while Lookaway is open on screen.</li>
            <li>When the screen locks or you switch apps, Android may pause Lookaway within minutes, so reminders can be late or missing.</li>
            <li>After you swipe Lookaway away, it can't send reminders. The timer is still correct when you reopen it.</li>
            <li>Battery saver (for example on OnePlus) can stop it sooner. Setting Chrome's battery use to <b>Unrestricted</b> can help, but isn't guaranteed.</li>
          </ul>
        </section>
        <p className="text-xs text-muted-foreground">
          iPhone pauses apps like this too, so keep Lookaway open for reminders. If a break was missed, it'll tell you when you come back.
        </p>
      </div>
    </PanelDialog>
  );
}
