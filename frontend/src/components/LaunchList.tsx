type Launch = {
  name: string;
  symbol: string;
  tier: string;
  flavor: string;
  multiple: string;
  timeRemaining: string;
  score: number;
};

const launches: Launch[] = [
  {
    name: 'LIQ Protocol',
    symbol: 'LIQ',
    tier: 'Tier 2 (Candy Jar)',
    flavor: '🍓 Strawberry Floor',
    multiple: '27.4×',
    timeRemaining: '3d 12h',
    score: 92,
  },
  {
    name: 'Lollipop Finance',
    symbol: 'LOLLY',
    tier: 'Tier 1 (Taster Pack)',
    flavor: '🍋 Lemon Zest',
    multiple: '5.1×',
    timeRemaining: '1d 04h',
    score: 81,
  },
  {
    name: 'Gummy Yields',
    symbol: 'GUM',
    tier: 'Tier 3 (Premium Box)',
    flavor: '🍇 Grape Vine',
    multiple: '3.8×',
    timeRemaining: '18d 09h',
    score: 88,
  },
  {
    name: 'Sour Drops',
    symbol: 'DROP',
    tier: 'Tier 2 (Candy Jar)',
    flavor: '🍏 Green Apple',
    multiple: '12.2×',
    timeRemaining: '6d 03h',
    score: 90,
  },
];

export function LaunchList() {
  return (
    <section id="launches" className="bg-background relative py-20 px-4">
      {/* Glow effects */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-cardBorder/50 pb-6">
          <div>
             <span className="text-purple-400 font-semibold tracking-wider uppercase text-xs">The Candy Shelf</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground drop-shadow-sm">
              Featured Sweets
            </h2>
            <p className="mt-3 text-sm text-muted/90 max-w-xl">
              Browse the candy store. Check the jars, smell the flavors, and read the Anti-rug sweetness scores designed to protect liquidity.
            </p>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-glow">
          <div className="grid grid-cols-7 border-b border-white/10 bg-black/40 px-6 py-4 text-xs font-semibold tracking-wider uppercase text-muted">
            <div className="col-span-2">Candy</div>
            <div className="col-span-1">Jar tier</div>
            <div className="col-span-1">Flavor</div>
            <div className="text-right">Multiplier</div>
            <div className="text-right">Time left</div>
            <div className="text-right">Sweetness score</div>
          </div>
          <div className="divide-y divide-white/5 text-sm">
            {launches.map((launch) => (
              <div
                key={launch.symbol}
                className="grid grid-cols-7 items-center px-6 py-5 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="col-span-2 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/5 text-lg group-hover:scale-110 transition-transform">
                    🍬
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground tracking-tight drop-shadow-sm">
                      {launch.name}
                    </span>
                    <span className="text-xs font-mono text-muted/70">{launch.symbol}</span>
                  </div>
                </div>
                <div className="text-muted/90 font-medium col-span-1">{launch.tier}</div>
                <div className="text-muted/90 italic col-span-1 text-xs">{launch.flavor}</div>
                <div className="text-right font-mono font-bold text-pink-400">
                  {launch.multiple}
                </div>
                <div className="text-right font-medium text-muted/80">
                  {launch.timeRemaining}
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/20">
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
