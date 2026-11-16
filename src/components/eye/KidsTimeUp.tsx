import { Star } from "lucide-react";

import horizon from "@/assets/distant-horizon.jpg";
import { Button } from "@/components/ui/button";
import { starsFor } from "@/lib/kids-mode";

export function KidsTimeUp({ breaks, onParent }: { breaks: number; onParent: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Screen time is up"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-night text-night-foreground">
      <img src={horizon} alt="" width={1024} height={1536} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-night-veil" />
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-6xl" aria-hidden>🌳</p>
        <h2 className="mt-4 font-display text-4xl font-light leading-tight">Screen time is done for today!</h2>
        <p className="mt-3 max-w-xs text-lg text-night-foreground/90">Great job. Time to play outside and look at things far away.</p>
        {breaks > 0 && (
          <p className="mt-6 flex flex-wrap justify-center gap-1" aria-label={`${breaks} stars today`}>
            {Array.from({ length: starsFor(breaks) }, (_, i) => (
              <Star key={i} className="h-6 w-6 fill-accent text-accent" />
            ))}
          </p>
        )}
        <Button variant="veil" size="sm" className="mt-10" onClick={onParent}>Parent options</Button>
      </div>
    </div>
  );
}
