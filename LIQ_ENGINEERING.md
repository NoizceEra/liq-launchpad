# LIQ Launchpad — Engineering Overview

This document explains how the LIQ Launchpad is structured both on-chain (Solana program) and off-chain (Next.js frontend), using the **"candy store"** metaphor as the user-facing theme.

The theme/UI is candy‑store cute (jars, flavors, emojis), but the **on-chain mechanics remain serious**: locked dev SOL, deterministic recoup schedules, and performance‑based burns.

---

## 1. High-Level Architecture

LIQ is split into two main parts:

- **Frontend** (`frontend/`)
  - Next.js 14 (App Router) + Tailwind.
  - Handles wallet connection, launch configuration, and display of tiers/launches.
  - Presents LIQ as a **candy store** where each launch is a "candy" in a jar.

- **Program** (`program/`)
  - Anchor-based Solana program (scaffolded in `program/programs/liq-program`).
  - Encodes the real rules: liquidity tiers, lock durations, recoup math, and burns.
  - The candy naming is **purely UI**; on-chain it is tiers, lamports, timestamps, and token amounts.

The two are connected via an Anchor client (`useLiqProgram()` in the frontend), which calls instructions like `init_launch`, `buy_dev_allocation`, and `recoup_unlock`.

---

## 2. Frontend (Candy Store UI)

**Stack:** Next.js 14, TypeScript, Tailwind, `@solana/wallet-adapter-*`.

Key components:

### 2.1 `Hero.tsx`

- Presents LIQ as a candy store:
  - "Launch a candy. Let LIQ run the jar."
  - Primary CTA **"Hit a LIQ"** jumps to the launch configuration section.
- Uses pastel gradients (pink, purple, green, white) and emojis:
  - `🍬` for the candy store
  - `🫙` for jars
  - `🔥` for scheduled burns
- Right-hand card shows an **example LIQ launch**:
  - Candy (token pair), jar tier, locked dev SOL, next recoup.
  - This is a **static preview**, but the real app will mirror live data from the program.

### 2.2 `HowItWorks.tsx`

- Explains LIQ mechanics as a 3-step candy flow:
  1. **Pick your candy jar** — choose tier / lock duration.
  2. **Put it on the shelf** — LIQ mints and exposes a visible floor.
  3. **Recoup + burn** — scheduled exits and performance-based burn.
- Backed by Tailwind cards with subtle borders and pastel backgrounds.

### 2.3 `LaunchList.tsx`

- A **sample "candy shelf"** showing how real launches will be surfaced:
  - `Candy` (project name + symbol)
  - `Jar tier` (Tier 1/2/3 with candy-themed labels)
  - `Flavor` (purely cosmetic, e.g. `🍓 Strawberry floor`)
  - Multiple, time left, and a **Sweetness score** (alignment/anti-rug score).
- Today it's static demo data; in the full implementation it should be fed by:
  - On-chain indexed data (Helius/other indexer) or
  - A small REST API that reads program accounts and decorates them with flavor metadata.

### 2.4 Wallet + Program Integration (planned)

- `LiqWalletProvider.tsx` wires up:
  - Solana cluster RPC (devnet/mainnet).
  - Wallet adapters (Phantom, Solflare, etc.).
- `anchorClient.ts` will expose `useLiqProgram()`:
  - Creates an Anchor `Program<LIQ>` client using the IDL + program ID.
  - Used by the "Hit a LIQ" flow to send `init_launch` transactions.

**Note:** All candy metaphors live purely here; the program does not know about "flavors" or emojis.

---

## 3. On-Chain Program (LIQ Mechanics)

Directory: `program/programs/liq-program/`

### 3.1 State: `Launch` account

Planned (scaffold exists, details to be implemented):

```rust
#[account]
pub struct Launch {
    pub deployer: Pubkey,              // dev wallet
    pub tier: u8,                      // 1, 2, 3
    pub tax_mode: u8,                  // trading tax mode as per V1 spec
    pub seed_sol_lamports: u64,        // initial locked SOL
    pub lock_start_ts: i64,            // when the lock begins
    pub lock_end_ts: i64,              // final unlock time
    pub recouped_sol_lamports: u64,    // how much SOL has been recouped so far
    pub remaining_locked_tokens: u64,  // tokens still reserved for recoup/burn
    pub recoup_flags: u8,              // bitflags for tier-specific unlocks (e.g., 50%/100% for Tier 3)
}
```

The candy tiers map to real tiers like this:

- **Taster Pack (Tier 1)** — smallest SOL range, shortest lock.
- **Candy Jar (Tier 2)** — mid-range SOL, mid lock.
- **Premium Box (Tier 3)** — largest SOL, 2-stage unlock.

These ranges and lock durations are defined by the LIQ V1 spec and enforced at `init_launch` time.

### 3.2 Instructions (scaffolded)

Current function signatures exist in `lib.rs` as TODOs:

```rust
pub fn init_launch(ctx: Context<InitLaunch>, params: InitLaunchParams) -> Result<()> { /* ... */ }

pub fn buy_dev_allocation(ctx: Context<BuyDevAllocation>, amount: u64) -> Result<()> { /* ... */ }

pub fn recoup_unlock(ctx: Context<RecoupUnlock>) -> Result<()> { /* ... */ }

pub fn burn_remaining(ctx: Context<BurnRemaining>) -> Result<()> { /* ... */ }
```

Where:

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct InitLaunchParams {
    pub name: String,   // e.g., "LIQ Protocol"
    pub symbol: String, // "LIQ"
    pub tier: u8,       // 1, 2, 3
    pub tax_mode: u8,   // trading tax mode
}
```

**What they are meant to do:**

- `init_launch`
  - Validate `tier` and `seed_sol_lamports` against the V1 spec ranges.
  - Initialize `Launch` account.
  - Set `lock_start_ts` and `lock_end_ts` depending on the tier.
  - Wire in bonding-curve/pool setup (Pump.fun-style curve or a compatible AMM integration).

- `buy_dev_allocation`
  - Enforce 5% cap (50M tokens) per dev wallet.
  - Execute swaps on the pool to give the dev their capped allocation.

- `recoup_unlock`
  - At an unlock point (2d/5d/10d as per tier):
    - Fetch Pyth SOL/USD price.
    - Calculate tokens needed to recoup the correct fraction of `seed_sol_lamports`.
    - Perform the recoup swap.
    - Update `recouped_sol_lamports`, `remaining_locked_tokens`, and `recoup_flags`.

- `burn_remaining`
  - After final recoup:
    - Burn all `remaining_locked_tokens`.
    - Mark the launch as fully recouped/burned.

**Important:** none of this logic cares about UI flavors or emojis. It only cares about SOL amounts, timestamps, and token balances.

---

## 4. Does the Candy Theme Affect the Smart Contract?

**No.** The candy store theme is purely:

- Tailwind CSS classes
- Copy
- Emojis and labels in React components

The Solana program:

- Works with **tiers**, **lamports**, **lock durations**, **bonding curves**, **Pyth prices**, and **token accounts**.
- Does not know that a Tier 2 launch is being shown as a "Candy Jar" or that the UI calls the alignment score a "Sweetness score".

You can change the theme (dark, serious, meme-heavy, candy store) without redeploying or changing the on-chain program, as long as the client still calls the same instructions with the same accounts.

---

## 5. Where Subagents / Deep Refactors Are Needed

There are a few areas where deeper coding/refactoring would benefit from a dedicated agent or multi-agent run (Claude Code teams, oh-my-claudecode, or a coding subagent):

1. **Program logic completion (high priority)**
   - Implement `init_launch`, `buy_dev_allocation`, `recoup_unlock`, and `burn_remaining` fully according to the LIQ V1 spec.
   - Ensure Pyth integration, tier validation, and burn math are correct.

2. **Anchor client wiring + transaction UX**
   - Implement `useLiqProgram()` and the `Hit a LIQ` transaction flow.
   - Add error handling, network/cluster toggles (devnet/mainnet), and clean loading states.

3. **Indexing and launch list backend**
   - Build a small server or indexer that:
     - Reads program accounts (Launch accounts).
     - Computes/updates alignment scores.
     - Serves data to the frontend for the "Candy shelf".

4. **Security review + simplification**
   - Have an agent go over:
     - Account initialization patterns.
     - Authority checks.
     - Edge cases around recoup timings and price sources.
   - Aim to make the program **as small and auditable as possible** so normies/devs can trust it.

These are ideal places to point multi-agent tooling (oh-my-claudecode `/team`, Codex/Gemini agents, or a dedicated coding-agent subagent) rather than doing everything by hand.

---

## 6. Normie Adoption Considerations

To make LIQ easy for non-crypto-native users:

- **Keep the UI vocabulary soft and concrete**:
  - "Jar", "Candy", "Floor", "Time left" instead of heavy finance jargon.
- **One action per screen**:
  - Hero: Hit a LIQ.
  - Launch form: pick tier + set a few knobs.
  - Launch list: browse jars.
- **Progressive disclosure**:
  - Show advanced details (exact recoup/burn math, Pyth details) in expandable sections.
- **Clear warnings and confirmations**:
  - Explain lock durations and recoup schedules in simple language before signing a transaction.

The engineering side (this repo) should support that by:

- Keeping the program API surface small and well-documented.
- Building a clear, typed client in the frontend.
- Avoiding hidden behaviors; everything important should be visible in the UI.

---

This file is meant as a living document. As the LIQ program logic and frontend wiring are implemented, update this overview to reflect the final instruction set, account layouts, and any changes to the candy-themed UX.
