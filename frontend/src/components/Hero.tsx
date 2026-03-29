export function Hero() {
  return (
    <section className="border-b border-cardBorder/60 bg-gradient-to-r from-sky-500/10 via-transparent to-violet-500/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:items-center lg:py-20">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center rounded-full border border-accent/40 bg-black/60 px-3 py-1 text-xs font-medium text-accent shadow-glow">
            Liquidity tiers • Creator rewards on every launch
          </span>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            LIQ — liquidity-locked launches
            <span className="block text-accent">with visible floors and creator rewards.</span>
          </h1>
          <p className="max-w-xl text-sm text-muted sm:text-base">
            LIQ turns degen chaos into structured launches. Devs lock their own
            liquidity into tiers, set a stablecoin-backed floor, and a small
            creator tax on exits funds ongoing rewards and ecosystem growth.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#create-launch"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-black shadow-glow hover:bg-sky-400"
            >
              Hit a LIQ
            </a>
            <a
              href="#launches"
              className="rounded-md border border-cardBorder bg-black/60 px-4 py-2 text-sm font-medium text-foreground hover:border-accent/60 hover:bg-accent/5"
            >
              Browse liquidity tiers
            </a>
          </div>
          <div className="flex flex-wrap gap-6 pt-2 text-xs text-muted">
            <div>
              <div className="font-semibold text-foreground">Tiered, locked LP</div>
              <div>Dev liquidity is locked in visible tiers with clear floors.</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Creator tax + rewards</div>
              <div>A small tax on dev exits funds creator income and reputational pools.</div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="rounded-2xl border border-cardBorder bg-black/60 p-4 shadow-glow">
            <div className="mb-3 flex items-center justify-between text-xs text-muted">
              <span>Live launch snapshot</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
                Protocol view
              </span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Token</span>
                <span className="font-medium text-foreground">LIQ / SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Lock tier</span>
                <span className="font-medium text-foreground">Tier 2 • 14 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Current multiple</span>
                <span className="font-mono text-accent">27.4×</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Alignment score</span>
                <span className="font-mono text-emerald-400">92 / 100</span>
              </div>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <p className="text-[11px] text-muted">
                On major catalyst events (like a 100× move), dev exits are
                capped, a creator tax is applied, and part of the upside can be
                routed to long-term holders and creator pools. This interface
                is ready to connect directly to the LIQ program.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
