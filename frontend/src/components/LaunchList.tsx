type Launch = {
  name: string;
  symbol: string;
  tier: string;
  multiple: string;
  timeRemaining: string;
  score: number;
};

const launches: Launch[] = [
  {
    name: 'LIQ Protocol',
    symbol: 'LIQ',
    tier: 'Tier 2 • 14 days',
    multiple: '27.4×',
    timeRemaining: '3d 12h',
    score: 92,
  },
  {
    name: 'Signal Deck',
    symbol: 'SIGL',
    tier: 'Tier 1 • 7 days',
    multiple: '5.1×',
    timeRemaining: '1d 04h',
    score: 81,
  },
  {
    name: 'Vault Arcade',
    symbol: 'VAULT',
    tier: 'Tier 3 • 30 days',
    multiple: '3.8×',
    timeRemaining: '18d 09h',
    score: 88,
  },
  {
    name: 'Orderflow Labs',
    symbol: 'FLOW',
    tier: 'Tier 2 • 14 days',
    multiple: '12.2×',
    timeRemaining: '6d 03h',
    score: 90,
  },
];

export function LaunchList() {
  return (
    <section id="launches" className="bg-slate-950/80">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Featured launches (static preview)
            </h2>
            <p className="mt-1 text-sm text-muted">
              These entries show how LIQ surfaces liquidity tiers, visible
              floors and alignment scores.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-cardBorder bg-black/70">
          <div className="grid grid-cols-6 border-b border-cardBorder/80 bg-slate-950/70 px-3 py-2 text-[11px] text-muted">
            <div className="col-span-2">Token</div>
            <div>Lock tier</div>
            <div className="text-right">Current multiple</div>
            <div className="text-right">Time remaining</div>
            <div className="text-right">Anti-rug score</div>
          </div>
          <div className="divide-y divide-cardBorder/70 text-xs">
            {launches.map((launch) => (
              <div
                key={launch.symbol}
                className="grid grid-cols-6 items-center px-3 py-2 hover:bg-slate-900/60"
              >
                <div className="col-span-2 flex flex-col">
                  <span className="font-medium text-foreground">
                    {launch.name}
                  </span>
                  <span className="text-[11px] text-muted">{launch.symbol}</span>
                </div>
                <div className="text-muted">{launch.tier}</div>
                <div className="text-right font-mono text-accent">
                  {launch.multiple}
                </div>
                <div className="text-right text-muted">
                  {launch.timeRemaining}
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-300">
                    {launch.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
