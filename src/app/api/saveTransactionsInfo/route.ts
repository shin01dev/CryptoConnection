import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Connection, ParsedInstruction, PublicKey } from '@solana/web3.js';

export async function POST(req: Request) {
  const { tokenAccountAddress, mintAddress } = await req.json();
  const BATCH_SIZE = 1000;
  const solanaConnection = new Connection('https://fragrant-cosmological-ensemble.solana-mainnet.discover.quiknode.pro/4771f857c3d336d109cbd1812a6f7745a198eb15/');
  const TARGET_ADDRESS = tokenAccountAddress;

  const session = await getAuthSession();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const account = await db.account.findFirst({
    where: { userId: userId },
    select: { public_key_for_crypto_transactions: true }
  });
  if (!account?.public_key_for_crypto_transactions) {
    console.error('No public_key_for_crypto_transactions found for the user');
    return new Response('public_key_for_crypto_transactions not found', { status: 400 });
  }
  const connectedWallet = new PublicKey(account.public_key_for_crypto_transactions);

  let transactionList = await solanaConnection.getSignaturesForAddress(new PublicKey(connectedWallet));
  console.log("Number of transactions: " + transactionList.length);

    const relevantTransactions: { TransactionSignature: string; Time: string; Source_Address: any; Destination_Address: any; Amount: any; UI_Amount: any; Mint_Address: any; DidYouGive: string; }[] = [];
  
  // Helper function to process a batch of transactions
  async function processBatch(transactions: any[]) {
    const fetchTransactions = transactions.map(async (tx) => {
      const confirmedTx = await solanaConnection.getParsedConfirmedTransaction(tx.signature);
      if (!confirmedTx) return;
  
      for (const instruction of confirmedTx.transaction.message.instructions) {
        if ('parsed' in instruction) {
          const parsedInstruction: ParsedInstruction = instruction as ParsedInstruction;
          if (parsedInstruction.programId.toString() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' &&
            parsedInstruction.parsed.info.destination === TARGET_ADDRESS &&
            parsedInstruction.parsed.info.authority === connectedWallet.toBase58()) {
            if (!parsedInstruction.parsed.info.tokenAmount) {
              console.error('tokenAmount is undefined');
              return;
            }
            relevantTransactions.push({
              TransactionSignature: tx.signature,
              Time: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : 'Unknown',
              Source_Address: parsedInstruction.parsed.info.authority,
              Destination_Address: parsedInstruction.parsed.info.destination,
              Amount: parsedInstruction.parsed.info.tokenAmount.amount,
              UI_Amount: parsedInstruction.parsed.info.tokenAmount.uiAmount.toString(),
              Mint_Address: mintAddress,
              DidYouGive: "No"
            });
          }
        }
      }
    });
    await Promise.all(fetchTransactions);
  }
  
  // Split the transactions list into batches and process them
  for (let i = 0; i < transactionList.length; i += BATCH_SIZE) {
    const batch = transactionList.slice(i, i + BATCH_SIZE);
    await processBatch(batch);
  }





  // 데이터베이스 트랜잭션 처리
  await db.$transaction(async (prisma) => {
    for (const tokenData of relevantTransactions) {
      const existingTransaction = await prisma.crypto_transactions.findUnique({
        where: { TransactionSignature: tokenData.TransactionSignature }
      });
      if (existingTransaction) continue;

      await prisma.crypto_transactions.create({ data: tokenData });

      const fromAddress = tokenData.Source_Address;
      const sendingAccount = await prisma.account.findFirst({
        where: { public_key_for_crypto_transactions: fromAddress }
      });
      if (!sendingAccount) {
        console.error(`Account with userId ${fromAddress} not found.`);
        continue;
      }
      const updatedCryptoCurrencyValue = parseFloat(sendingAccount.crypto_currency || "0") + parseFloat(tokenData.UI_Amount);
      await prisma.account.update({
        where: { id: sendingAccount.id },
        data: { crypto_currency: updatedCryptoCurrencyValue.toString() }
      });
      await prisma.crypto_transactions.update({
        where: { TransactionSignature: tokenData.TransactionSignature },
        data: { DidYouGive: "Yes" }
      });
    }
  });

  return new Response('OK');
}
