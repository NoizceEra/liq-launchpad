export const IDL = {
  "version": "0.1.0",
  "name": "liq_program",
  "instructions": [
    {
      "name": "init_global_config",
      "accounts": [
        { "name": "admin", "isMut": true, "isSigner": true },
        { "name": "global_config", "isMut": true, "isSigner": false },
        { "name": "system_program", "isMut": false, "isSigner": false }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitGlobalConfigArgs"
          }
        }
      ]
    },
    {
      "name": "init_launch",
      "accounts": [
        { "name": "creator", "isMut": true, "isSigner": true },
        { "name": "global_config", "isMut": true, "isSigner": false },
        { "name": "launch", "isMut": true, "isSigner": false },
        { "name": "token_mint", "isMut": true, "isSigner": true },
        { "name": "launch_token_vault", "isMut": true, "isSigner": false },
        { "name": "launch_sol_vault", "isMut": true, "isSigner": false },
        { "name": "dev_sol_vault", "isMut": true, "isSigner": false },
        { "name": "system_program", "isMut": false, "isSigner": false },
        { "name": "token_program", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitLaunchArgs"
          }
        }
      ]
    },
    {
      "name": "buy_from_curve",
      "accounts": [
        { "name": "user", "isMut": true, "isSigner": true },
        { "name": "user_token_ata", "isMut": true, "isSigner": false },
        { "name": "launch", "isMut": true, "isSigner": false },
        { "name": "launch_token_vault", "isMut": true, "isSigner": false },
        { "name": "launch_sol_vault", "isMut": true, "isSigner": false },
        { "name": "system_program", "isMut": false, "isSigner": false },
        { "name": "token_program", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "sol_in", "type": "u64" },
        { "name": "min_tokens_out", "type": "u64" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "global_config",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "admin", "type": "publicKey" },
          { "name": "liq_treasury", "type": "publicKey" },
          { "name": "pyth_price_feed", "type": "publicKey" },
          { "name": "pumpswap_program", "type": "publicKey" },
          { "name": "migration_fee_lamports", "type": "u64" },
          { "name": "tier_basic", "type": { "defined": "TierConfig" } },
          { "name": "tier_committed", "type": { "defined": "TierConfig" } },
          { "name": "tier_premium", "type": { "defined": "TierConfig" } }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitGlobalConfigArgs",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "liq_treasury", "type": "publicKey" },
          { "name": "pyth_price_feed", "type": "publicKey" },
          { "name": "pumpswap_program", "type": "publicKey" },
          { "name": "migration_fee_lamports", "type": "u64" },
          { "name": "tier_basic", "type": { "defined": "TierConfig" } },
          { "name": "tier_committed", "type": { "defined": "TierConfig" } },
          { "name": "tier_premium", "type": { "defined": "TierConfig" } }
        ]
      }
    },
    {
      "name": "InitLaunchArgs",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "tier", "type": { "defined": "Tier" } },
          { "name": "tax_mode", "type": { "defined": "TaxMode" } },
          { "name": "token_decimals", "type": "u8" }
        ]
      }
    },
    {
      "name": "Tier",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Basic" },
          { "name": "Committed" },
          { "name": "Premium" }
        ]
      }
    },
    {
      "name": "TaxMode",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "CreatorRewards" },
          { "name": "TraderCashback" }
        ]
      }
    },
    {
      "name": "TierConfig",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "required_lock_lamports", "type": "u64" },
          { "name": "lock_duration", "type": "u64" },
          { "name": "recoup_start", "type": "u64" },
          { "name": "recoup_duration", "type": "u64" }
        ]
      }
    }
  ]
};
