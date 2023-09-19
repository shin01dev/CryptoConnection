import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ message: '인증되지 않았습니다.' }), { status: 401 });
    }

    const currentUserId = session.user.id;

    // follow의 notification 값이 "on"인 데이터만 가져오는 쿼리
    const userFollows = await db.follow.findMany({
      where: {
        AND: [
          {followingId: currentUserId},
          { notification: 'on' }
        ]
      },
      select: {
        followerId: true,
        followingId: true,
        follower: {
          select: {
            username: true,
            image: true
          }
        },
        following: {
          select: {
            username: true,
            image: true
          }
        },
        notification: true
      }
    });
  

    return new Response(JSON.stringify({ follows: userFollows }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
