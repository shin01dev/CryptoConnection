

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    // 현재 세션에서 사용자 정보를 가져옵니다.
    const session = await getAuthSession();
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: '인증되지 않은 사용자입니다.' }), { status: 401 });
    }

    // session.user.id와 일치하며 notification이 "on"인 giveCryptoUser 항목들의 값을 "off"로 업데이트합니다.
    const updatedCount = await db.giveCryptoUser.updateMany({
      where: {
        userId: session.user.id,
        notification: "on"
      },
      data: {
        notification: "off"
      }
    });


    return new Response(JSON.stringify({ updatedCount: updatedCount.count }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
