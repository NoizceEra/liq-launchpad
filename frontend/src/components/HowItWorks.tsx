const steps = [
  {
    icon: '🫙',
    title: '1. Pick your candy jar',
    body: 'Dev teams choose a LIQ tier (Taster Pack, Candy Jar, or Premium Box) with a specific SOL amount and lock duration.',
  },
  {
    icon: '🍬',
    title: '2. Put it on the shelf',
    body: 'LIQ mints your token and exposes a visible floor. Trading runs on the usual rails while LIQ tracks your tier and behaviour.',
  },
  {
    icon: '🔥',
    title: '3. Recoup + burn',
    body: 'Scheduled exits allow devs to recoup gracefully. Performance-based burns build a public dev profile traders love, wrapped in a sweet UI.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-cardBorder/40 bg-card/40 backdrop-blur-3xl relative overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 max-w-2xl text-center mx-auto">
          <span className="text-pink-400 font-semibold tracking-wider uppercase text-xs">The Flow</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            How a <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">LIQ</span> works
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted/90">
            Three simple steps to build trust. Seed real SOL, lock liquidity, and let the protocol handle the messy exits.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="group relative rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm transition-all hover:bg-white/10 hover:-translate-y-1 shadow-glow"
            >
              <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 text-2xl shadow-inner">
                {step.icon}
              </div>
              <h3 className="mb-3 text-lg font-bold text-foreground tracking-tight">{step.title}</h3>
              <p className="text-muted/80 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
