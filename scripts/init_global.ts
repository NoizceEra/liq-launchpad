import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IDL } from "../frontend/src/utils/liq_idl";
import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import * as fs from 'fs';

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // 1. Load Wallet
  const walletPath = 'C:\\Users\\vclin_jjufoql\\.config\\solana\\deployer.json';
  const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  const wallet = new anchor.Wallet(walletKeypair);

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  anchor.setProvider(provider);

  const PROGRAM_ID = new PublicKey('9MHn1sAn5PRVkwswocF4VctSjEz3nrE8vG1ReDTj27Xv');
  const program = new Program(IDL as any, provider);

  // 2. Derive Global Config PDA
  const [globalConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("liq_global")],
    PROGRAM_ID
  );

  console.log("Global Config PDA:", globalConfig.toBase58());

  // 3. Initialize Global Config
  try {
    const tx = await program.methods
      .initGlobalConfig({
        liqTreasury: wallet.publicKey,
        pythPriceFeed: new PublicKey("H6ARHf6Y2SNrQv921Wv9z5gma6YG"), // Placeholder Devnet Feed
        pumpswapProgram: PROGRAM_ID, // Placeholder
        migrationFeeLamports: new anchor.BN(100_000_000), // 0.1 SOL
        tierBasic: {
          requiredLockLamports: new anchor.BN(500_000_000), // 0.5 SOL
          lockDuration: new anchor.BN(100), // seconds
          recoupStart: new anchor.BN(50), 
          recoupDuration: new anchor.BN(50),
        },
        tierCommitted: {
          requiredLockLamports: new anchor.BN(2_000_000_000), // 2 SOL
          lockDuration: new anchor.BN(200),
          recoupStart: new anchor.BN(100),
          recoupDuration: new anchor.BN(100),
        },
        tierPremium: {
          requiredLockLamports: new anchor.BN(5_000_000_000), // 5 SOL
          lockDuration: new anchor.BN(300),
          recoupStart: new anchor.BN(150),
          recoupDuration: new anchor.BN(150),
        },
      })
      .accounts({
        admin: wallet.publicKey,
        globalConfig: globalConfig,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Global config initialized! Tx:", tx);
  } catch (err) {
    console.error("Initialization failed:", err);
  }
}

main();
