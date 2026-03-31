import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LiqProgram } from "../target/types/liq_program";
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { assert } from "chai";

describe("liq-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LiqProgram as Program<LiqProgram>;
  const creator = provider.wallet.publicKey;

  it("Is initialized!", async () => {
    // Add your test here.
  });
});
