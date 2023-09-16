import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const donateTo = body.donateTo; // 요청 본문에서 donateTo를 가져옵니다.
    const donateCoin = body.donateCoin; // 요청 본문에서 donateCoin를 가져옵니다.
    const session = await getAuthSession(); // 세션 정보를 가져옵니다.

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id; // 세션에서 사용자 ID를 가져옵니다.

    // userId에 일치하는 Post의 donateTo 및 donateCoin 업데이트
    await db.post.updateMany({
      where: { authorId: userId },
      data: { donateTo: donateTo, donateCoin: donateCoin },
    });

    console.log('Donate information updated successfully for userId:', userId);
    return new Response('Donate information updated successfully');
  } catch (error) {
    console.error(error);
    return new Response('Could not update donate information at this time. Please try later', { status: 500 });
  }
}
