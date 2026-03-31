import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { IDL } from './liq_idl';

export const PROGRAM_ID = new PublicKey('9MHn1sAn5PRVkwswocF4VctSjEz3nrE8vG1ReDTj27Xv');

export function getLiqProgram(connection: Connection, wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  return new Program(IDL as Idl, provider);
}

export const getLaunchAddress = (mint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('liq_launch'), mint.toBuffer()],
    PROGRAM_ID
  )[0];
};

export const getSolVaultAddress = (mint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('liq_sol_pool'), mint.toBuffer()],
    PROGRAM_ID
  )[0];
};

export const getGlobalConfigAddress = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('liq_global')],
    PROGRAM_ID
  )[0];
};
