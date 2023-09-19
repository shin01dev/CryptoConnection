//src/app/api/ConnectedWallet
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const publicKey = body.accountId; // 요청 본문에서 publicKey를 가져옵니다.
    const session = await getAuthSession(); // 세션 정보를 가져옵니다.

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id; // 세션에서 사용자 ID를 가져옵니다.

    // userId에 일치하는 계정의 public_key 업데이트
    await db.account.updateMany({
      where: { userId: userId },
      data: { public_key: publicKey },
    });


    return new Response('Public key updated successfully');
  } catch (error) {
    console.error(error);
    return new Response('Could not update public key at this time. Please try later', { status: 500 });
  }
}
