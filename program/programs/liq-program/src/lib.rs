use anchor_lang::prelude::*;

// NOTE: Replace this with the real vanity program id that ends with "Liq" once generated.
declare_id!("11111111111111111111111111111111");

#[program]
pub mod liq_program {
    use super::*;

    /// One-time or rare global configuration setup.
    pub fn init_global_config(_ctx: Context<InitGlobalConfig>, _args: InitGlobalConfigArgs) -> Result<()> {
        // TODO: implement admin-only config init
        Ok(())
    }

    /// Initialize a new LiQ launch: token mint, vaults, and dev SOL lock.
    pub fn init_launch(_ctx: Context<InitLaunch>, _args: InitLaunchArgs) -> Result<()> {
        // TODO: implement per spec
        Ok(())
    }

    /// Optionally switch between CreatorRewards and TraderCashback before migration.
    pub fn configure_tax_mode(_ctx: Context<ConfigureTaxMode>, _new_mode: TaxMode) -> Result<()> {
        // TODO: implement guard rails + mode switch
        Ok(())
    }

    /// Buy tokens from the bonding curve.
    pub fn buy_from_curve(_ctx: Context<Trade>, _max_sol_in: u64, _min_tokens_out: u64) -> Result<()> {
        // TODO: implement bonding-curve buy logic + 1% tax
        Ok(())
    }

    /// Sell tokens back to the bonding curve.
    pub fn sell_to_curve(_ctx: Context<Trade>, _max_tokens_in: u64, _min_sol_out: u64) -> Result<()> {
        // TODO: implement bonding-curve sell logic + 1% tax
        Ok(())
    }

    /// Creator claims vested dev SOL according to tier schedule.
    pub fn claim_dev_sol(_ctx: Context<ClaimDevSol>) -> Result<()> {
        // TODO: implement vesting math per tier
        Ok(())
    }

    /// Migrate a successful launch to PumpSwap at ~$69k FDV and charge migration fee.
    pub fn migrate_to_pumpswap(_ctx: Context<MigrateToPumpSwap>) -> Result<()> {
        // TODO: integrate Pyth, check FDV threshold, move liquidity, mark migrated
        Ok(())
    }
}

/// Tax mode selected at launch; immutable after migration.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TaxMode {
    CreatorRewards,
    TraderCashback,
}

/// Commitment tier.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Tier {
    Basic,
    Committed,
    Premium,
}

/// Global per-tier configuration.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct TierConfig {
    /// Required dev SOL lock for this tier (lamports).
    pub required_lock_lamports: u64,
    /// Total lock duration (slots or seconds; choose and be consistent).
    pub lock_duration: u64,
    /// When recoup starts, relative to launch (slots or seconds).
    pub recoup_start: u64,
    /// Recoup duration (for linear schedules; can be 0 for cliff).
    pub recoup_duration: u64,
}

/// Global configuration, set by LiQ admin.
#[account]
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub liq_treasury: Pubkey,
    pub pyth_price_feed: Pubkey,
    pub pumpswap_program: Pubkey,
    pub migration_fee_lamports: u64,
    pub tier_basic: TierConfig,
    pub tier_committed: TierConfig,
    pub tier_premium: TierConfig,
}

/// Per-launch bonding-curve parameters.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct CurveParams {
    pub a_numerator: u64,
    pub a_denominator: u64,
    pub b_numerator: u64,
    pub b_denominator: u64,
}

/// Per-launch state account.
#[account]
pub struct Launch {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub token_decimals: u8,
    pub launch_tier: Tier,

    // Dev SOL lock
    pub dev_sol_vault: Pubkey,
    pub dev_sol_lock_start: u64,
    pub dev_sol_locked_lamports: u64,
    pub dev_sol_claimed_lamports: u64,

    // Tax
    pub tax_mode: TaxMode,
    pub tax_bps: u16,
    pub reserved: u16, // padding
    pub creator_tax_sol: u64,
    pub protocol_tax_sol: u64,

    // Curve state
    pub curve_params: CurveParams,
    pub total_tokens_sold: u64,
    pub total_sol_raised: u64,

    // Migration
    pub migrated: bool,
    pub pumpswap_pool: Pubkey,
}

/// Args for init_global_config.
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitGlobalConfigArgs {
    pub liq_treasury: Pubkey,
    pub pyth_price_feed: Pubkey,
    pub pumpswap_program: Pubkey,
    pub migration_fee_lamports: u64,
    pub tier_basic: TierConfig,
    pub tier_committed: TierConfig,
    pub tier_premium: TierConfig,
}

/// Args for init_launch.
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitLaunchArgs {
    pub tier: Tier,
    pub tax_mode: TaxMode,
    pub token_decimals: u8,
    pub curve_params: CurveParams,
}

// -----------------
// Account Contexts
// -----------------

#[derive(Accounts)]
pub struct InitGlobalConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + std::mem::size_of::<GlobalConfig>(),
        seeds = [b"liq_global"],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitLaunch<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut)]
    pub global_config: Account<'info, GlobalConfig>,
    /// New launch account.
    #[account(
        init,
        payer = creator,
        space = 8 + std::mem::size_of::<Launch>(),
        seeds = [b"liq_launch", token_mint.key().as_ref()],
        bump
    )]
    pub launch: Account<'info, Launch>,
    /// SPL mint for this launch (created before or during this ix).
    #[account(mut)]
    pub token_mint: Account<'info, anchor_spl::token::Mint>,
    /// Token vault holding unsold tokens.
    #[account(mut)]
    pub launch_token_vault: Account<'info, anchor_spl::token::TokenAccount>,
    /// SOL pool used for bonding-curve liquidity.
    /// CHECK: this is a system-owned account (PDA) that holds SOL.
    #[account(mut)]
    pub launch_sol_vault: UncheckedAccount<'info>,
    /// Dev SOL lock vault (PDA).
    /// CHECK: this is a system-owned account (PDA) that holds SOL.
    #[account(mut)]
    pub dev_sol_vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ConfigureTaxMode<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut, has_one = creator)]
    pub launch: Account<'info, Launch>,
}

#[derive(Accounts)]
pub struct Trade<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_ata: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub launch: Account<'info, Launch>,
    #[account(mut)]
    pub launch_token_vault: Account<'info, anchor_spl::token::TokenAccount>,
    /// CHECK: SOL pool PDA
    #[account(mut)]
    pub launch_sol_vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[derive(Accounts)]
pub struct ClaimDevSol<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut, has_one = creator)]
    pub launch: Account<'info, Launch>,
    /// CHECK: SOL vault PDA holding locked dev funds
    #[account(mut)]
    pub dev_sol_vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MigrateToPumpSwap<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,
    #[account(mut)]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub launch: Account<'info, Launch>,
    /// CHECK: SOL vault PDA holding curve liquidity
    #[account(mut)]
    pub launch_sol_vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub launch_token_vault: Account<'info, anchor_spl::token::TokenAccount>,
    /// CHECK: destination PumpSwap pool account (created by external program)
    #[account(mut)]
    pub pumpswap_pool: UncheckedAccount<'info>,
    /// CHECK: Pyth price feed account
    pub pyth_price_feed: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
}
