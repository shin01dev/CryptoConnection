import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ message: '인증되지 않았습니다.' }), { status: 401 });
    }

    const currentUserId = session.user.id;

    // follow의 notification 값이 "on"인 데이터를 찾아 "off"로 바꾸는 쿼리
    const updatedUserFollows = await db.follow.updateMany({
      where: {
        AND: [
          { followingId: currentUserId },
          { notification: 'on' }
        ]
      },
      data: {
        notification: 'off'
      }
    });

  
    return new Response(JSON.stringify({ message: `${updatedUserFollows.count} 개의 팔로우 알림이 'off' 상태로 변경되었습니다.` }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
