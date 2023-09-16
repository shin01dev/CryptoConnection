//src/app/api/getTransactionsInfo

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request, connectedWallet: string) { // connectedWallet 매개변수 추가
    try {
      const session = await getAuthSession();
  
      if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
      }
  
      // 데이터베이스에서 DidYouGive 값이 "No"인 모든 트랜잭션 정보 찾기
      const transactions = await db.crypto_transactions.findMany({
        where: { DidYouGive: "No" },
      });
  
      if (!transactions ) {
        return new Response("No transactions found", { status: 404 });
      }
  
      for (const transaction of transactions) {
        const accountId = transaction.Source_Address; // accountId를 connectedWallet 값으로 설정
      
        // 해당 계정의 현재 crypto_currency 값 가져오기
        const account = await db.account.findFirst({
          where: { public_key: accountId },
        });
      
        if (!account) {
          console.error(`Account with userId ${accountId} not found.`);
          continue; // 계정을 찾지 못한 경우, 다음 트랜잭션으로 진행
        }
      
        // 현재 값에 UI_Amount만큼 더하기
        const updatedCryptoCurrencyValue = parseFloat(account.crypto_currency || "0") + parseFloat(transaction.UI_Amount);
      
        // 계정의 crypto_currency 업데이트
        await db.account.update({
          where: { id: account.id }, // 여기에서 'id'를 사용합니다.
          data: { crypto_currency: updatedCryptoCurrencyValue.toString() },
        });
      
        // DidYouGive 값을 "Yes"로 업데이트
        await db.crypto_transactions.update({
          where: { TransactionSignature: transaction.TransactionSignature },
          data: { DidYouGive: "Yes" },
        });
      }

    return new Response("Updated successfully");
  } catch (error) {
    console.error(error);
    return new Response("Could not update data at this time. Please try later", { status: 500 });
  }
}
