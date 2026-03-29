use anchor_lang::prelude::*;

// NOTE: Program ID will be updated after we grind a vanity key ending with "Liq".
declare_id!("11111111111111111111111111111111");

#[program]
pub mod liq_program {
    use super::*;

    /// Initialize a new LIQ launch.
    ///
    /// This is a skeleton matching the LIQ V1 spec. It will be expanded with:
    /// - tier validation (Tier 1/2/3 ranges)
    /// - seed SOL handling
    /// - trading tax mode selection
    /// - bonding curve/pool wiring
    pub fn init_launch(_ctx: Context<InitLaunch>, _params: InitLaunchParams) -> Result<()> {
        // TODO: implement according to LIQ spec
        Ok(())
    }

    /// Buy developer allocation up to 5% (50M tokens) capped at contract level.
    pub fn buy_dev_allocation(_ctx: Context<BuyDevAllocation>, _amount: u64) -> Result<()> {
        // TODO: enforce 5% cap per wallet and perform swap on curve
        Ok(())
    }

    /// Perform a scheduled recoup at an unlock point (e.g., day 2/5/10).
    pub fn recoup_unlock(_ctx: Context<RecoupUnlock>) -> Result<()> {
        // TODO: fetch Pyth price, compute required tokens to recoup, sell, and update state
        Ok(())
    }

    /// Burn remaining locked tokens after recoup is complete.
    pub fn burn_remaining(_ctx: Context<BurnRemaining>) -> Result<()> {
        // TODO: burn tokens according to spec, mark burn_done
        Ok(())
    }
}

/// Parameters for initializing a LIQ launch, derived from the LIQ V1 spec.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct InitLaunchParams {
    /// Human-readable name (e.g., "LIQ Protocol").
    pub name: String,
    /// Token symbol (e.g., "LIQ").
    pub symbol: String,
    /// Tier: 1 (Basic), 2 (Committed), 3 (Premium).
    pub tier: u8,
    /// Trading tax mode chosen at launch.
    pub tax_mode: u8,
}

/// Skeleton account for a LIQ launch.
#[account]
pub struct Launch {
    pub deployer: Pubkey,
    pub tier: u8,
    pub tax_mode: u8,
    pub seed_sol_lamports: u64,
    pub lock_start_ts: i64,
    pub lock_end_ts: i64,
    pub recouped_sol_lamports: u64,
    pub remaining_locked_tokens: u64,
    pub recoup_flags: u8, // bitflags for tier-specific unlocks (e.g., 50%/100%)
}

#[derive(Accounts)]
pub struct InitLaunch<'info> {
    #[account(mut)]
    pub deployer: Signer<'info>,
    /// New launch account for this token.
    #[account(
        init,
        payer = deployer,
        space = 8 + std::mem::size_of::<Launch>()
    )]
    pub launch: Account<'info, Launch>,
    /// System program.
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyDevAllocation<'info> {
    #[account(mut)]
    pub dev: Signer<'info>,
    #[account(mut)]
    pub launch: Account<'info, Launch>,
    // TODO: add pool + token accounts once curve integration is defined
}

#[derive(Accounts)]
pub struct RecoupUnlock<'info> {
    #[account(mut)]
    pub launch: Account<'info, Launch>,
    // TODO: add oracle + pool + authority accounts
}

#[derive(Accounts)]
pub struct BurnRemaining<'info> {
    #[account(mut)]
    pub launch: Account<'info, Launch>,
    // TODO: add token mint + burn destination
}
