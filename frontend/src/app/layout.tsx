import type { Metadata } from 'next';
import './globals.css';
import { LiqWalletProvider } from '@/components/LiqWalletProvider';
import { LiqHeaderWalletButton } from '@/components/LiqHeaderWalletButton';

export const metadata: Metadata = {
  title: 'LIQ — Liquidity-Locked Launchpad',
  description:
    'LIQ is a dev-aligned launchpad with stablecoin-backed floors, liquidity tiers, and creator rewards on every launch.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <LiqWalletProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-cardBorder/80 bg-black/40 backdrop-blur-sm">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-accent/20 ring-2 ring-accent/60" />
                  <span className="text-lg font-semibold tracking-tight">
                    LIQ
                  </span>
                </div>
                <nav className="flex items-center gap-6 text-sm text-muted">
                  <a href="#how-it-works" className="hover:text-foreground">
                    How LIQ works
                  </a>
                  <a href="#launches" className="hover:text-foreground">
                    Launches
                  </a>
                  <a href="/launch" className="hover:text-foreground">
                    Launch
                  </a>
                  <LiqHeaderWalletButton />
                </nav>
              </div>
            </header>
            <main className="flex-1 bg-gradient-to-b from-black via-slate-950 to-black">
              {children}
            </main>
            <footer className="border-t border-cardBorder/80 bg-black/60">
              <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
                <span>
                  LIQ — dev-aligned launchpad for hitting a LIQ the right
                  way.
                </span>
                <span className="text-[11px]">
                  Chain integration is being wired directly into the LIQ
                  program.
                </span>
              </div>
            </footer>
          </div>
        </LiqWalletProvider>
      </body>
    </html>
  );
}
