"use client";

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function LiqHeaderWalletButton() {
  return (
    <WalletMultiButton className="rounded-md border border-cardBorder bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent hover:bg-accent/10" />
  );
}
