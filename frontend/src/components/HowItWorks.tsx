const steps = [
  {
    title: '1. Pick a liquidity tier & lock',
    body: 'Dev teams choose a LIQ tier with a specific amount and lock duration. More locked liquidity means better placement and a stronger visible floor.',
  },
  {
    title: '2. Launch & build reputation',
    body: 'Trading runs on the usual rails while LIQ tracks tiers, floors, and dev behaviour. Clean exits and consistent locks build a public dev profile over time.',
  },
  {
    title: '3. Dev exits with creator tax & rewards',
    body: 'When a dev sells back their principal or triggers a catalyst event, a small creator tax is applied. Part of that tax becomes residual income and can be routed to holder pools, LIQ, or curated creator programs.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-cardBorder/60 bg-slate-950/60"
    >
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            How LIQ works
          </h2>
          <p className="mt-2 text-sm text-muted">
            LIQ doesn\'t fight markets; it reshapes incentives. Devs lock
            liquidity up front into tiers, earn reputation over multiple
            launches, and share upside through a small creator tax on exits.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-cardBorder bg-black/60 p-4 text-sm"
            >
              <h3 className="mb-2 text-foreground">{step.title}</h3>
              <p className="text-muted text-xs sm:text-sm">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
