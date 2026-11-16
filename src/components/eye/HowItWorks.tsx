const STEPS = [
  { n: "20", unit: "min on screen" },
  { n: "20", unit: "feet away" },
  { n: "20", unit: "seconds" },
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
    </section>
  );
}
