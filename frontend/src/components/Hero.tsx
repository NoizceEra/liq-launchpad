export function Hero() {
  return (
    <section className="border-b border-cardBorder/60 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/40 via-background to-background relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/20 blur-[120px] rounded-[100%] pointer-events-none" />
      
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-20 lg:flex-row lg:items-center relative z-10">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-pink-400 uppercase backdrop-blur-md">
            🍬 The Candy Store
          </span>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground drop-shadow-sm">
            Launch a candy.<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 drop-shadow-sm">
              Let LIQ run the jar.
            </span>
          </h1>
          <p className="max-w-md text-base text-muted/90 sm:text-lg leading-relaxed">
            Pick a tier, lock your liquidity, and let LIQ handle the scheduled recoup and burn. Serious on-chain mechanics, wrapped in a sweet candy shell.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#create-launch"
              className="group relative rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-3.5 text-sm font-bold text-white shadow-glow hover:shadow-[0_0_60px_rgba(244,114,182,0.5)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Hit a LIQ
              <span className="absolute inset-0 rounded-full border border-white/20"></span>
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors duration-300"
            >
              How it works
            </a>
          </div>
          <div className="flex flex-wrap gap-8 pt-6 text-sm text-muted/80">
            <div className="flex items-start gap-2">
              <span className="text-xl">🫙</span>
              <div>
                <div className="font-semibold text-foreground">Locked gracefully</div>
                <div className="text-xs mt-0.5">Visibly locked until recoup.</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🔥</span>
              <div>
                <div className="font-semibold text-foreground">Performance burns</div>
                <div className="text-xs mt-0.5">Schedules you can trust.</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 lg:pl-10">
          <div className="relative rounded-[2rem] border border-white/10 bg-card/60 p-6 shadow-glow backdrop-blur-xl transition-transform duration-500 hover:-translate-y-2 group">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="mb-6 flex items-center justify-between text-xs font-semibold tracking-wider text-muted uppercase">
              <span className="flex items-center gap-1.5"><span className="text-base">🍓</span> Example Launch</span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] text-emerald-400 border border-emerald-500/20">
                Live Preview
              </span>
            </div>
            
            <div className="space-y-4 text-sm relative z-10">
              <div className="flex justify-between items-center rounded-xl bg-white/5 p-3">
                <span className="text-muted font-medium">Candy</span>
                <span className="font-bold text-foreground">LIQ / SOL</span>
              </div>
              <div className="flex justify-between items-center rounded-xl bg-white/5 p-3">
                <span className="text-muted font-medium">Jar tier</span>
                <span className="font-bold text-accent">Tier 2 (Candy Jar)</span>
              </div>
              <div className="flex justify-between items-center rounded-xl bg-white/5 p-3">
                <span className="text-muted font-medium">Locked dev SOL</span>
                <span className="font-mono font-bold text-purple-400">8.0 ◎</span>
              </div>
              <div className="flex justify-between items-center rounded-xl bg-white/5 p-3">
                <span className="text-muted font-medium">Next recoup</span>
                <span className="font-mono font-bold text-emerald-400">in 5 days</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-[12px] text-muted/80 leading-relaxed italic text-center">
                  "LIQ tracks your lock, recoup, and burn schedule so traders see exactly how committed you are."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
