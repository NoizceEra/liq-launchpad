use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Mint, TokenAccount, Token};

// NOTE: Replace this with the real vanity program id that ends with "Liq" once generated.
declare_id!("9MHn1sAn5PRVkwswocF4VctSjEz3nrE8vG1ReDTj27Xv");

pub const INITIAL_VIRTUAL_SOL_RESERVES: u64 = 30_000_000_000; // 30 SOL
pub const INITIAL_VIRTUAL_TOKEN_RESERVES: u64 = 1_073_000_000_000_000; // 1.073B tokens (v1)
pub const TOKEN_TOTAL_SUPPLY: u64 = 1_000_000_000_000_000; // 1B tokens (6 decimals assumed, adjust as needed)

#[program]
pub mod liq_program {
    use super::*;

    /// One-time or rare global configuration setup.
    pub fn init_global_config(ctx: Context<InitGlobalConfig>, args: InitGlobalConfigArgs) -> Result<()> {
        let global_config = &mut ctx.accounts.global_config;
        global_config.admin = ctx.accounts.admin.key();
        global_config.liq_treasury = args.liq_treasury;
        global_config.pyth_price_feed = args.pyth_price_feed;
        global_config.pumpswap_program = args.pumpswap_program;
        global_config.migration_fee_lamports = args.migration_fee_lamports;
        global_config.tier_basic = args.tier_basic;
        global_config.tier_committed = args.tier_committed;
        global_config.tier_premium = args.tier_premium;
        Ok(())
    }

    /// Initialize a new LiQ launch: token mint, vaults, and dev SOL lock.
    pub fn init_launch(ctx: Context<InitLaunch>, args: InitLaunchArgs) -> Result<()> {
        let launch = &mut ctx.accounts.launch;
        let clock = Clock::get()?;

        // 1. Set basic info
        launch.creator = ctx.accounts.creator.key();
        launch.token_mint = ctx.accounts.token_mint.key();
        launch.token_decimals = args.token_decimals;
        launch.launch_tier = args.tier;
        launch.tax_mode = args.tax_mode;
        launch.bump = ctx.bumps.launch;

        // 2. Setup Bonding Curve Reserves
        launch.virtual_sol_reserves = INITIAL_VIRTUAL_SOL_RESERVES;
        launch.virtual_token_reserves = INITIAL_VIRTUAL_TOKEN_RESERVES;
        launch.real_sol_reserves = 0;
        launch.real_token_reserves = TOKEN_TOTAL_SUPPLY;
        launch.total_sol_raised = 0;
        launch.total_tokens_sold = 0;

        // 3. Setup Dev SOL Lock (PDA)
        let tier_config = match args.tier {
            Tier::Basic => ctx.accounts.global_config.tier_basic,
            Tier::Committed => ctx.accounts.global_config.tier_committed,
            Tier::Premium => ctx.accounts.global_config.tier_premium,
        };

        launch.dev_sol_vault = ctx.accounts.dev_sol_vault.key();
        launch.dev_sol_lock_start = clock.unix_timestamp;
        launch.dev_sol_locked_lamports = tier_config.required_lock_lamports;
        launch.dev_sol_claimed_lamports = 0;

        // Transfer dev lock SOL to vault
        anchor_lang::solana_program::program::invoke(
            &anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.creator.key(),
                &ctx.accounts.dev_sol_vault.key(),
                tier_config.required_lock_lamports,
            ),
            &[
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.dev_sol_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // 4. Mint the total supply to the launch vault
        let seeds = &[
            b"liq_launch",
            launch.token_mint.as_ref(),
            &[launch.bump],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.launch_token_vault.to_account_info(),
                    authority: launch.to_account_info(),
                },
                signer,
            ),
            TOKEN_TOTAL_SUPPLY,
        )?;

        Ok(())
    }

    /// Optionally switch between CreatorRewards and TraderCashback before migration.
    pub fn configure_tax_mode(_ctx: Context<ConfigureTaxMode>, _new_mode: TaxMode) -> Result<()> {
        // TODO: implement guard rails + mode switch
        Ok(())
    }

    /// Buy tokens from the bonding curve.
    pub fn buy_from_curve(ctx: Context<Trade>, sol_in: u64, min_tokens_out: u64) -> Result<()> {
        let launch = &mut ctx.accounts.launch;
        
        // 1. Constant Product Math: k = x * y
        // (virtual_sol + sol_in) * (virtual_token - tokens_out) = virtual_sol * virtual_token
        let virtual_sol_reserves = launch.virtual_sol_reserves as u128;
        let virtual_token_reserves = launch.virtual_token_reserves as u128;
        let sol_in_u128 = sol_in as u128;

        let new_virtual_sol_reserves = virtual_sol_reserves + sol_in_u128;
        let new_virtual_token_reserves = (virtual_sol_reserves * virtual_token_reserves) / new_virtual_sol_reserves;
        let tokens_out = virtual_token_reserves - new_virtual_token_reserves;

        require!(tokens_out as u64 >= min_tokens_out, LiqError::SlippageExceeded);
        require!(tokens_out as u64 <= launch.real_token_reserves, LiqError::InsufficientLiquidity);

        // 2. Handle 1% Protocol Tax
        let tax_amount = sol_in / 100;
        let sol_to_pool = sol_in - tax_amount;

        // 3. Update State
        launch.virtual_sol_reserves = new_virtual_sol_reserves as u64;
        launch.virtual_token_reserves = new_virtual_token_reserves as u64;
        launch.real_sol_reserves += sol_to_pool;
        launch.real_token_reserves -= tokens_out as u64;
        launch.total_sol_raised += sol_to_pool;
        launch.total_tokens_sold += tokens_out as u64;

        // 4. Execute Transfers
        // Transfer SOL to pool
        anchor_lang::solana_program::program::invoke(
            &anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.user.key(),
                &ctx.accounts.launch_sol_vault.key(),
                sol_to_pool,
            ),
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.launch_sol_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Transfer Tokens to user
        let seeds = &[
            b"liq_launch",
            launch.token_mint.as_ref(),
            &[launch.bump],
        ];
        let signer = &[&seeds[..]];

        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.launch_token_vault.to_account_info(),
                    to: ctx.accounts.user_token_ata.to_account_info(),
                    authority: ctx.accounts.launch.to_account_info(),
                },
                signer,
            ),
            tokens_out as u64,
        )?;

        Ok(())
    }

    /// Sell tokens back to the bonding curve.
    pub fn sell_to_curve(ctx: Context<Trade>, tokens_in: u64, min_sol_out: u64) -> Result<()> {
        let launch = &mut ctx.accounts.launch;
        
        // 1. Math: Reverse Constant Product
        let virtual_sol_reserves = launch.virtual_sol_reserves as u128;
        let virtual_token_reserves = launch.virtual_token_reserves as u128;
        let tokens_in_u128 = tokens_in as u128;

        let new_virtual_token_reserves = virtual_token_reserves + tokens_in_u128;
        let new_virtual_sol_reserves = (virtual_sol_reserves * virtual_token_reserves) / new_virtual_token_reserves;
        let sol_out_raw = virtual_sol_reserves - new_virtual_sol_reserves;

        // 2. Protocol Tax
        let tax_amount = sol_out_raw / 100;
        let sol_to_user = (sol_out_raw - tax_amount) as u64;

        require!(sol_to_user >= min_sol_out, LiqError::SlippageExceeded);
        require!(sol_to_user <= launch.real_sol_reserves, LiqError::InsufficientLiquidity);

        // 3. Update State
        launch.virtual_sol_reserves = new_virtual_sol_reserves as u64;
        launch.virtual_token_reserves = new_virtual_token_reserves as u64;
        launch.real_sol_reserves -= sol_out_raw as u64; // Pool keeps the tax for migration but reduces reserves
        launch.real_token_reserves += tokens_in;
        launch.total_sol_raised -= sol_to_user; // Net SOL raised decreases on sell
        launch.total_tokens_sold -= tokens_in;

        // 4. Transfers
        // Transfer Tokens from user
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.user_token_ata.to_account_info(),
                    to: ctx.accounts.launch_token_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            tokens_in,
        )?;

        // Transfer SOL to user (from vault via PDA)
        // Since launch_sol_vault is a PDA, the program can decrease its lamports
        let sol_to_user_u64 = sol_to_user; 
        
        **ctx.accounts.launch_sol_vault.lamports.borrow_mut() -= sol_to_user_u64;
        **ctx.accounts.user.lamports.borrow_mut() += sol_to_user_u64;

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

#[error_code]
pub enum LiqError {
    #[msg("Slippage tolerance exceeded.")]
    SlippageExceeded,
    #[msg("Insufficient tokens in the curve pool.")]
    InsufficientLiquidity,
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
    pub dev_sol_lock_start: i64,
    pub dev_sol_locked_lamports: u64,
    pub dev_sol_claimed_lamports: u64,

    // Tax
    pub tax_mode: TaxMode,
    pub tax_bps: u16,
    pub reserved: u16, // padding
    pub creator_tax_sol: u64,
    pub protocol_tax_sol: u64,

    // Curve state (Constant Product: x * y = k)
    pub curve_params: CurveParams,
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub real_token_reserves: u64,
    pub total_tokens_sold: u64,
    pub total_sol_raised: u64,

    // Migration
    pub migrated: bool,
    pub pumpswap_pool: Pubkey,
    pub bump: u8,
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
#[instruction(args: InitLaunchArgs)]
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
    /// SPL mint for this launch.
    #[account(
        init,
        payer = creator,
        mint::decimals = args.token_decimals,
        mint::authority = launch,
    )]
    pub token_mint: Account<'info, Mint>,
    /// Token vault holding unsold tokens.
    #[account(
        init,
        payer = creator,
        token::mint = token_mint,
        token::authority = launch,
    )]
    pub launch_token_vault: Account<'info, TokenAccount>,
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
