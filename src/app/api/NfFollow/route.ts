import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ message: '인증되지 않았습니다.' }), { status: 401 });
    }

    const currentUserId = session.user.id;

    const take = 50; // 한 번에 가져올 아이템 수를 50으로 변경

    const userFollows = await db.follow.findMany({
      where: {
        followingId: currentUserId
      },
      select: {
        follower: true,
        following: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: take // 최근 50개만 가져오도록 설정
    });
    
    return new Response(JSON.stringify({ follows: userFollows }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
