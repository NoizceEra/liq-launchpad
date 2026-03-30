# LIQ V1 Implementation Checklist

Source spec: **LIQ_V1_Technical_Spec_v3_2** (PDF)

This file tracks how much of the LIQ V1 spec is implemented and what remains. Treat it as the single truth for “are we actually doing what the spec says?”

Status keys:
- [ ] not started
- [~] in progress / scaffolded
- [x] implemented

---

## 1. Platform Overview

- [ ] SOL pair only (no other quote assets in V1)
- [ ] 0 SOL creation fee (only network fees)
- [ ] Pump.fun-style exponential virtual constant product bonding curve
- [ ] Total supply 1,000,000,000 tokens per launch
- [ ] ~800,000,000 tradeable
- [ ] ~200,000,000 burned at migration
- [ ] Vanity program address ends with `Liq` (`solana-keygen grind --ends-with Liq:1`)

**Current:**
- Bonding curve + exact supply split **not implemented yet** in the Anchor program.
- Program ID is still a placeholder in `program/programs/liq-program/src/lib.rs`.

---

## 2. Liquidity Tiers

Spec table:

- **Tier 1 — Basic**
  - Min liquidity: $300–$499 SOL
  - Lock duration: 2 days
  - Recoup: 100% at day 2
  - Migration fee: 0.2 SOL
  - Badge: Basic, basic listing

- **Tier 2 — Committed**
  - Min liquidity: $500–$1,499 SOL
  - Lock duration: 5 days
  - Recoup: 100% at day 5
  - Migration fee: 0.2 SOL
  - Badge: Committed, priority feed

- **Tier 3 — Premium**
  - Min liquidity: $1,500–$3,000 SOL
  - Lock duration: 10 days
  - Recoup: 50% at day 5, 50% at day 10
  - Migration fee: 0.2 SOL
  - Badge: Premium, homepage featured

Implementation items:

- [~] `Launch.tier: u8` exists in the program scaffold.
- [ ] Enforce tier-specific SOL ranges at `init_launch`.
- [ ] Store `lock_start_ts` and `lock_end_ts` per tier.
- [ ] Encode Tier 3’s two-stage unlock schedule (flags or extra timestamps).
- [ ] Represent migration fee 0.2 SOL and routing (0.1 treasury, 0.1 buy+burn).

---

## 3. Dev 5% Allocation (50M tokens)

Spec requirements:

- Max 5% allocation (50,000,000 tokens) per wallet.
- Enforced at contract level (rejects attempts to exceed cap).
- Dev wallet = deployer wallet.
- Allocation is fully unlocked (can sell anytime).
- UI must show live cost to buy any percentage up to 5% using current curve + Pyth price.
- Dev wallet and current holdings % must be displayed publicly.

Implementation items:

- [~] `InitLaunchParams` includes `name` and `symbol`; `Launch.deployer` exists.
- [ ] Implement `buy_dev_allocation` instruction with 5% cap logic.
- [ ] Track dev holdings for on-chain or indexer-based display.
- [ ] Frontend: build live cost estimator using pool state + Pyth SOL/USD.
- [ ] Frontend: show dev wallet + % holdings on the launch page.

---

## 4. Recoup Mechanic

Spec requirements:

- At each unlock point:
  - Call Pyth SOL/USD oracle for current price.
  - Use constant product curve math to compute tokens needed to return original SOL.
  - Sell **only** that amount.
- Tier behavior:
  - Tier 1: single sell at day 2 for 100% recoup.
  - Tier 2: single sell at day 5 for 100% recoup.
  - Tier 3: day 5 sells enough for 50%, day 10 sells enough for remaining 50%.
- Excess tokens beyond recoup are burned on-chain:
  - Tier 1 & 2: burn immediately after recoup.
  - Tier 3: burn after day 10 final unlock.
- Dev cannot manually pull liquidity at any time.
- UI shows recoup sell amounts and burn amounts; only scheduled recoup/burn markers on chart.

Implementation items:

- [~] `Launch` account has `seed_sol_lamports`, `recouped_sol_lamports`, `remaining_locked_tokens`, `recoup_flags` fields scaffolded.
- [ ] Implement `recoup_unlock` instruction:
  - Time checks per tier.
  - Pyth price integration.
  - Curve math to calculate tokens to sell.
- [ ] Implement `burn_remaining` instruction with correct timing per tier.
- [ ] Enforce no manual LP pulls outside of LIQ’s scheduled flow.
- [ ] Frontend: show recoup/burn schedule and amounts per launch.

---

## 5. Burn Math (Performance-Based)

Spec examples (Tier 3 max):

- Flat price: ~0% of locked tokens burned (all needed to recoup SOL).
- 2× MCAP: ~62% of locked burned.
- 5× MCAP: ~88% burned.
- 10× MCAP: ~94% burned.

Implementation items:

- [ ] Confirm exact curve math implementation (virtual constant product) produces these behaviors.
- [ ] Add tests that simulate price paths and confirm burn percentages match spec within tolerance.

---

## 6. Trading Tax — 1.0% Total, Two Modes

Spec requirements:

- Total tax: 1.0% on trades.
- Developer selects mode at launch; immutable afterwards.
- Splits (from spec):
  - Dev wallet: 0.35% per tx (immediate).
  - LIQ treasury: 0.55% per tx.
  - Burn: 0.10% auto buy & burn.
  - Trader cashback variant uses 0.80% + 0.20% burn (details in full spec).
- V1: no claims UI for creator/trader rewards.

Implementation items:

- [~] `tax_mode: u8` exists in `Launch` scaffold.
- [ ] Implement tax routing logic in the program or in the AMM integration layer.
- [ ] Ensure `tax_mode` is immutable after `init_launch`.
- [ ] Frontend: show selected mode clearly when configuring a launch.

---

## 7. Bonding Curve & Pump.fun Parity

Spec requirements:

- Exponential virtual constant-product bonding curve identical in slope/behavior to Pump.fun.
- Same curve across all tiers; no variation.
- UI shows:
  - Live Pyth-calculated MCAP.
  - Starting MCAP (after dev seed).
  - Migration MCAP target ($69,000) separately.

Implementation items:

- [ ] Choose or implement curve integration (custom program vs. existing Pump-like AMM).
- [ ] Expose curve state so frontend can display:
  - Current MCAP.
  - Starting MCAP.
  - Migration target MCAP.
- [ ] Frontend: add MCAP and target visualizations to launch detail view.

---

## 8. Vanity Program Address

Spec requirements:

- Program address must end with `Liq` (capital L, lowercase i, lowercase q).
- Use `solana-keygen grind --ends-with Liq:1`.

Implementation items:

- [ ] Run keygen grind and create deployer keypair with the vanity suffix.
- [ ] Update `declare_id!` in `program/programs/liq-program/src/lib.rs`.
- [ ] Record the final program ID here once deployed.

---

## 9. UI-Specific Requirements

From the spec:

- [ ] Show live cost for buying any % up to 5% dev allocation (using Pyth).
- [x] Display tiers, locks, and basic launch cards (candy store UI in `frontend/`).
- [ ] Show dev wallet address + current holdings % on the launch page.
- [ ] Show scheduled recoup + burn markers on a simple chart or timeline.

**Note:** The candy store theme (jars, flavors, emojis) is **on top of** these requirements; it does not change the mechanics, just how they’re explained.

---

## 10. Subagent / Multi-Agent Targets

These parts are complex enough that they should be tackled by specialized coding/refactor agents or Claude Code teams:

1. **Program instruction implementation (core logic)**
   - `init_launch`, `buy_dev_allocation`, `recoup_unlock`, `burn_remaining`.
   - Tax routing and curve integration.

2. **Curve & burn math validation**
   - Tests that simulate different price paths and confirm recoup/burn percentages.

3. **Pyth oracle integration**
   - Robust integration with stale-price checks and sensible failure modes.

4. **Frontend cost calculators & charts**
   - Live dev allocation cost UI.
   - Recoup/burn schedule visualization.

Use this file as the checklist when instructing subagents or Claude Code teams, and update the checkboxes as features land.
