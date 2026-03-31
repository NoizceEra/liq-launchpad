"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { 
  getLiqProgram, 
  getLaunchAddress, 
  getGlobalConfigAddress,
  PROGRAM_ID
} from '@/utils/anchorClient';

const lockTiers = [
  { id: 'tier1', label: 'Taster Pack (Tier 1 • 7 days)', tierValue: { basic: {} } },
  { id: 'tier2', label: 'Candy Jar (Tier 2 • 14 days)', tierValue: { committed: {} } },
  { id: 'tier3', label: 'Premium Box (Tier 3 • 30 days)', tierValue: { premium: {} } },
];

const stablecoins = ['USDC', 'USDT', 'DAI'];

export function LaunchForm() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!publicKey || !wallet) {
      alert("Please connect your wallet first!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('tokenName') as string;
      const symbol = formData.get('tokenSymbol') as string;
      const tierId = formData.get('lockTier') as string;
      
      const tier = lockTiers.find(t => t.id === tierId)?.tierValue || { committed: {} };

      // 1. Prepare Keypairs for new accounts
      const tokenMint = Keypair.generate();
      const launchTokenVault = Keypair.generate();
      
      // 2. Derive PDAs
      const launch = getLaunchAddress(tokenMint.publicKey);
      const globalConfig = getGlobalConfigAddress();
      
      // Derive SOL pool vault (this matches the seeds in lib.rs)
      const [launchSolVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('liq_sol_pool'), tokenMint.publicKey.toBuffer()],
        PROGRAM_ID
      );

      // Derive Dev SOL vault
      const [devSolVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('liq_dev_lock'), tokenMint.publicKey.toBuffer()],
        PROGRAM_ID
      );

      // 3. Initialize Program
      const program = getLiqProgram(connection, wallet.adapter);

      // 4. Build Transaction
      const tx = await program.methods
        .initLaunch({
          tier: tier,
          taxMode: { creatorRewards: {} },
          tokenDecimals: 6,
        })
        .accounts({
          creator: publicKey,
          globalConfig: globalConfig,
          launch: launch,
          tokenMint: tokenMint.publicKey,
          launchTokenVault: launchTokenVault.publicKey,
          launchSolVault: launchSolVault,
          devSolVault: devSolVault,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        } as any)
        .signers([tokenMint, launchTokenVault])
        .rpc();

      setTxSig(tx);
    } catch (err) {
      console.error("Launch failed:", err);
      alert("Launch failed: " + (err as any).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="create-launch" className="border-b border-cardBorder/40 bg-card/60 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-pink-500/10 blur-[150px] rounded-full -translate-y-1/2 -z-10" />
      
      <div className="mx-auto max-w-6xl px-4 py-20 relative z-10">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-emerald-400 font-semibold tracking-wider uppercase text-xs">Hit a LIQ</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Launch your candy
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted/90">
              Pick a jar tier, set your token data, and let LIQ run the show. 
              The on-chain mechanics stay serious, while the storefront stays sweet.
            </p>
          </div>
          <WalletMultiButton className="!rounded-full !bg-pink-500/10 !border !border-pink-400/30 !text-pink-400 !font-bold !text-xs !shadow-glow hover:!bg-pink-500/20" />
        </div>
        
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-[2rem] border border-white/10 bg-black/40 p-6 shadow-glow md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-8 backdrop-blur-3xl"
        >
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <label className="text-muted/90 font-medium" htmlFor="tokenName">
                  Candy Name (Token)
                </label>
                <input
                  id="tokenName"
                  name="tokenName"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-pink-500/40 focus:border-pink-500 focus:ring-1 text-foreground transition-all focus:bg-white/10"
                  placeholder="Candy Land Token"
                />
              </div>
              <div className="space-y-2 text-sm">
                <label className="text-muted/90 font-medium" htmlFor="tokenSymbol">
                  Ticker
                </label>
                <input
                  id="tokenSymbol"
                  name="tokenSymbol"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-pink-500/40 focus:border-pink-500 focus:ring-1 text-foreground transition-all focus:bg-white/10"
                  placeholder="CANDY"
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <label className="text-muted/90 font-medium" htmlFor="liquidity">
                  Seed Liquidity (Stablecoin)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                  <input
                    id="liquidity"
                    name="liquidity"
                    type="number"
                    min={0}
                    step="100"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-3 outline-none ring-pink-500/40 focus:border-pink-500 focus:ring-1 text-foreground transition-all focus:bg-white/10"
                    placeholder="5000"
                  />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <label className="text-muted/90 font-medium" htmlFor="stablecoin">
                  Pairing
                </label>
                <select
                  id="stablecoin"
                  name="stablecoin"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-pink-500/40 focus:border-pink-500 focus:ring-1 text-foreground transition-all appearance-none"
                  defaultValue={stablecoins[0]}
                >
                  {stablecoins.map((s) => (
                    <option key={s} value={s} className="bg-card text-foreground">{s}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <label className="text-muted/90 font-medium" htmlFor="lockTier">
                  Choose your Jar (Lock Tier)
                </label>
                <select
                  id="lockTier"
                  name="lockTier"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-pink-500/40 focus:border-pink-500 focus:ring-1 text-foreground transition-all appearance-none"
                  defaultValue={lockTiers[1].id}
                >
                  {lockTiers.map((tier) => (
                    <option key={tier.id} value={tier.id} className="bg-card text-foreground">
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 text-sm">
                <label className="text-muted/90 font-medium" htmlFor="chain">
                  Chain
                </label>
                <select
                  id="chain"
                  name="chain"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-pink-500/40 focus:border-pink-500 focus:ring-1 text-muted transition-all appearance-none pointer-events-none opacity-50"
                  defaultValue="Solana"
                >
                  <option value="Solana" className="bg-card text-foreground">Solana</option>
                </select>
              </div>
            </div>
            
            <div className="rounded-xl bg-purple-500/10 p-4 border border-purple-500/20">
              <p className="text-xs text-purple-200 leading-relaxed italic text-center">
                On launch, your liquidity is locked according to the selected tier. Every trade on the curve supports the LIQ floor.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`mt-4 w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-3.5 text-sm font-bold tracking-tight text-white shadow-[0_0_30px_rgba(244,114,182,0.3)] transition-all hover:-translate-y-0.5 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_50px_rgba(244,114,182,0.5)]'}`}
            >
              {loading ? 'Launching Sweets...' : 'Hit a LIQ'}
            </button>
          </div>
          
          <div className="space-y-5 rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 text-sm">
            <h3 className="text-base font-bold text-foreground border-b border-white/5 pb-3">
              Store Receipt 🛒
            </h3>
            
            <div className="space-y-4 text-muted/80">
              <div className="flex gap-3">
                <span className="text-emerald-400 bg-emerald-400/10 h-6 w-6 rounded flex items-center justify-center shrink-0">1</span>
                <p className="text-xs leading-relaxed"><span className="text-foreground font-semibold">Principal protection:</span> The schedule respects your chosen Jar.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 bg-emerald-400/10 h-6 w-6 rounded flex items-center justify-center shrink-0">2</span>
                <p className="text-xs leading-relaxed"><span className="text-foreground font-semibold">Creator tax:</span> 1% Protocol tax applied to curve trades.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 bg-emerald-400/10 h-6 w-6 rounded flex items-center justify-center shrink-0">3</span>
                <p className="text-xs leading-relaxed"><span className="text-foreground font-semibold">Visible profile:</span> Your sweets are now live on the shelf.</p>
              </div>
            </div>
            
            {txSig && (
              <div className="mt-6 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-emerald-200 animate-in fade-in slide-in-from-bottom-2">
                <p className="font-bold text-sm">🎉 Sweets Launched!</p>
                <p className="mt-1 text-xs break-all leading-tight">
                  Signature: <a href={`https://solscan.io/tx/${txSig}?cluster=devnet`} target="_blank" className="underline font-mono">{txSig}</a>
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
