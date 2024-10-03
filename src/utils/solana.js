// src/utils/solana.js

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl} from '@solana/web3.js';

export const transferUSDC = async (fromTorus, toPublicKey, amount) => {
  try {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(fromTorus.provider.publicKey),
        toPubkey: new PublicKey(toPublicKey),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signedTransaction = await fromTorus.provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(signature);
    console.log('Transaction confirmed with signature:', signature);
  } catch (error) {
    console.error('Error during transfer:', error);
  }
};
