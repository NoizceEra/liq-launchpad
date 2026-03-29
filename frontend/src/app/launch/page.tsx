"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { LaunchForm } from '@/components/LaunchForm';

export default function LaunchPage() {
  const { connected } = useWallet();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 max-w-xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Launch a Lick
        </h1>
        <p className="text-sm text-muted sm:text-base">
          Choose your tier, lock your liquidity, and configure creator taxes
          for your launch. Lick enforces the rules on-chain so holders can see
          exactly how committed you are.
        </p>
      </div>

      {!connected ? (
        <div className="rounded-2xl border border-cardBorder bg-black/70 p-6 text-sm text-muted">
          <p className="mb-2 font-semibold text-foreground">Connect your wallet</p>
          <p>
            To create a Lick, connect a Solana wallet using the button in the
            top navigation. Once connected, you&apos;ll be able to configure and
            submit your launch parameters.
          </p>
        </div>
      ) : (
        <LaunchForm />
      )}
    </div>
  );
}
