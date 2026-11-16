import { AlertCircle, ExternalLink } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  FACTS,
  HABITS,
  MYTHS,
  SEE_A_DOCTOR,
  SOURCES,
  sourceNumber,
  type GuideItem,
} from "@/lib/eye-care-guide";

function SourceTags({ ids }: { ids: string[] }) {
  return (
    <span className="mt-2 flex flex-wrap gap-1">
      {ids.map((id) => {
        const s = SOURCES.find((x) => x.id === id);
        if (!s) return null;
        return (
          <a
            key={id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${s.publisher} — ${s.title}`}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground hover:bg-secondary/70"
          >
            [{sourceNumber(id)}] {s.short}
          </a>
        );
      })}
    </span>
  );
}

function Item({ item, index }: { item: GuideItem; index?: number }) {
  return (
    <li className="flex gap-3 rounded-2xl border bg-card p-4">
      {index !== undefined && (
        <span className="font-display text-xl font-light leading-none text-primary">{index + 1}</span>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold">{item.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
        <SourceTags ids={item.sources} />
      </div>
    </li>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-primary">{children}</h3>;
}

export function EyeCareGuide({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[90vh] max-w-xl overflow-y-auto rounded-t-3xl bg-background">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl font-normal">Eye-care tips</SheetTitle>
          <SheetDescription>
            From eye-doctor organisations and published research. Tap a source tag to read the original.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8 pb-4">
          <section>
            <Heading>What the evidence says</Heading>
            <ul className="space-y-2">
              {FACTS.map((f) => (
                <Item key={f.title} item={f} />
              ))}
            </ul>
          </section>

          <section>
            <Heading>Habits that help</Heading>
            <ol className="space-y-2">
              {HABITS.map((h, i) => (
                <Item key={h.title} item={h} index={i} />
              ))}
            </ol>
          </section>

          <section>
            <Heading>Common myths</Heading>
            <ul className="space-y-2">
              {MYTHS.map((m) => (
                <Item key={m.title} item={m} />
              ))}
            </ul>
          </section>

          <section className="flex gap-3 rounded-2xl bg-accent/25 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
            <div>
              <p className="text-sm font-semibold">{SEE_A_DOCTOR.title}</p>
              <p className="mt-1 text-sm">{SEE_A_DOCTOR.body}</p>
              <SourceTags ids={SEE_A_DOCTOR.sources} />
            </div>
          </section>

          <section>
            <Heading>References</Heading>
            <ol className="space-y-3">
              {SOURCES.map((s, i) => (
                <li key={s.id} className="flex gap-2 text-xs">
                  <span className="font-semibold text-primary">[{i + 1}]</span>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="group min-w-0">
                    <span className="font-semibold group-hover:underline">{s.title}</span>
                    <ExternalLink className="ml-1 inline h-3 w-3 text-muted-foreground" />
                    <span className="block text-muted-foreground">
                      {s.publisher} · {s.detail}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              General information, not a diagnosis. For personal advice, see an ophthalmologist or optometrist.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
