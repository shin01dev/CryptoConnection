import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Connection, ParsedInstruction, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import Redis from 'ioredis';

export async function POST(req: Request) {
  const { tokenAccountAddress, mintAddress, ConnectedWalletNow } = await req.json();
const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST;

  const BATCH_SIZE = 1000;
  const solanaConnection = new Connection('https://fragrant-cosmological-ensemble.solana-mainnet.discover.quiknode.pro/4771f857c3d336d109cbd1812a6f7745a198eb15/');
  const TARGET_ADDRESS = tokenAccountAddress;
  const targetPubKey = new PublicKey(TARGET_ADDRESS);

  let connectedWallet: PublicKey;

  try {
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

    connectedWallet = new PublicKey(account.public_key_for_crypto_transactions);
  } catch (error) {
    console.error(error);
    return new Response('An error occurred', { status: 500 });
  }

  let transactionList = await solanaConnection.getSignaturesForAddress(targetPubKey);
  const relevantTransactions: { TransactionSignature: string; Time: string; Source_Address: any; Destination_Address: any; Amount: any; UI_Amount: any; Mint_Address: any; DidYouGive: string; }[] = [];

  // 병렬로 Solana에서 트랜잭션 데이터 가져오기
  const allPromises = transactionList.map(async (tx) => {
    const confirmedTx = await solanaConnection.getParsedConfirmedTransaction(tx.signature);
    if (!confirmedTx) return;

    for (const instruction of confirmedTx.transaction.message.instructions) {
      if ('parsed' in instruction) {
        const parsedInstruction: ParsedInstruction = instruction as ParsedInstruction;
        const programId = parsedInstruction.programId.toString();
        const transferInfo = parsedInstruction.parsed.info;
        const destinationAddress = transferInfo.destination;
        const sendingAddress = transferInfo.authority;

        if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' && destinationAddress === TARGET_ADDRESS && sendingAddress === connectedWallet.toBase58()) {
          if (!transferInfo.tokenAmount) {
            console.error('tokenAmount is undefined');
            return;
          }
          const amount = transferInfo.tokenAmount.amount;
          const uiAmount = transferInfo.tokenAmount.uiAmount;
          relevantTransactions.push({
            TransactionSignature: tx.signature,
            Time: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : 'Unknown',
            Source_Address: transferInfo.authority,
            Destination_Address: destinationAddress,
            Amount: amount,
            UI_Amount: uiAmount.toString(),
            Mint_Address: mintAddress,
            DidYouGive: "No"
          });
        }
      }
    }
  });

  await Promise.all(allPromises);


  
// 불필요한 데이터베이스 호출을 줄이기 위해 미리 session을 가져옵니다.
const session = await getAuthSession();
if (!session?.user) {
  return new Response('Unauthorized', { status: 401 });
}
const userId = session.user.id;

// 트랜잭션을 사용하여 일관성을 유지하고 성능을 향상시킵니다.
await db.$transaction(async (prisma) => {
  for (const tokenData of relevantTransactions) {
    const existingTransaction = await prisma.crypto_transactions.findUnique({
      where: { TransactionSignature: tokenData.TransactionSignature }
    });

    if (existingTransaction) {
      console.log('Transaction already exists in the database.');
      continue;
    }

    // 데이터베이스에 거래 정보 저장
    await prisma.crypto_transactions.create({ data: tokenData });

    const fromAddress = tokenData.Source_Address;
    const account = await prisma.account.findFirst({
      where: { public_key_for_crypto_transactions: fromAddress }
    });

    if (!account) {
      console.error(`Account with userId ${fromAddress} not found.`);
      continue;
    }

    const updatedCryptoCurrencyValue = parseFloat(account.crypto_currency || "0") + parseFloat(tokenData.UI_Amount);
    console.log("충전된 커뮤니티 코인 값 : " + updatedCryptoCurrencyValue);

    // 한번의 쿼리로 계정과 거래를 업데이트합니다.
    await prisma.account.update({
      where: { id: account.id },
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
