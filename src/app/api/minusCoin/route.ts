// src/app/api/minusCoin

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const coinNumber = body.coinNumber; // 요청 본문에서 coinNumber를 가져옵니다.
    const session = await getAuthSession(); // 세션 정보를 가져옵니다.

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id; // 세션에서 사용자 ID를 가져옵니다.

    // userId에 일치하는 계정의 crypto_currency 가져오기
    const account = await db.account.findFirst({ where: { userId: userId } });

    if (!account || typeof account.crypto_currency !== 'string') {
      return new Response('Account not found or crypto currency is invalid', { status: 400 });
    }

    const updatedValue = (parseFloat(account.crypto_currency) - coinNumber).toString();

    // 업데이트
    await db.account.updateMany({
      where: { userId: userId },
      data: { crypto_currency: updatedValue },
    });

    return new Response('Crypto currency updated successfully');
  } catch (error) {
    console.error(error);
    return new Response('Could not update crypto currency at this time. Please try later', { status: 500 });
  }
}
