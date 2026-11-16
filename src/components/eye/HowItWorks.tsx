const STEPS = [
  { n: "20", unit: "minutes", text: "Every 20 minutes of looking at a screen…" },
  { n: "20", unit: "feet", text: "…look at something about 20 feet (6 m) away…" },
  { n: "20", unit: "seconds", text: "…for at least 20 seconds. That's it." },
];

const TIPS = [
  "Blink fully — we blink up to half as often while staring at screens.",
  "Keep your screen about an arm's length away, slightly below eye level.",
  "Match screen brightness to the room and cut glare from windows.",
  "No window nearby? Look down a hallway or across the room.",
];

export function HowItWorks() {
  return (
    <section className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">The rule</p>
        <h2 className="mt-2 text-3xl font-normal">Why 20-20-20?</h2>
        <p className="mt-3 text-muted-foreground">
          Focusing up close keeps the tiny muscles in your eyes tensed. Looking far away lets them
          relax, easing tired, dry or blurry eyes from screen time.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.unit} className="rounded-3xl border bg-card p-5 animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-light text-primary">{s.n}</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {s.unit}
              </span>
            </div>
            <p className="mt-2 text-sm">{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="rounded-3xl bg-secondary p-6">
        <h3 className="text-xl font-normal">Small habits that help</h3>
        <ul className="mt-4 space-y-3">
          {TIPS.map((t) => (
            <li key={t} className="flex gap-3 text-sm text-secondary-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
