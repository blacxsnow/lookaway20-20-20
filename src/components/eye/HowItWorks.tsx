import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const STEPS = [
  { n: "20", unit: "min on screen" },
  { n: "20", unit: "feet away" },
  { n: "20", unit: "seconds" },
];

const TIPS = [
  "Blink fully — we blink up to half as often while staring at screens.",
  "Keep your screen about an arm's length away, slightly below eye level.",
  "Match screen brightness to the room and cut glare from windows.",
  "No window nearby? Look down a hallway or across the room.",
];

export function HowItWorks() {
  return (
    <section className="rounded-3xl border bg-card p-5">
      <ol className="grid grid-cols-3 divide-x text-center">
        {STEPS.map((s) => (
          <li key={s.unit} className="px-2">
            <span className="block font-display text-2xl font-light text-primary">{s.n}</span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {s.unit}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Looking far away relaxes the eye muscles that tense up during close screen work.
      </p>

      <Collapsible className="mt-3">
        <CollapsibleTrigger className="group mx-auto flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-primary hover:bg-secondary">
          Eye-care tips
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-3 space-y-2">
            {TIPS.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {t}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
