// src/app/api/Follow.js

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const body = await req.json();
    const followUserId = body.userId; // 팔로우할 사용자의 ID를 요청 본문에서 가져옵니다.
    
    const session = await getAuthSession(); // 현재 세션 정보를 가져옵니다.

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id; // 현재 로그인된 사용자의 ID를 가져옵니다.

    if (userId === followUserId) {
      return new Response('Cannot follow yourself', { status: 400 });
    }

    // 데이터베이스에서 팔로우 관계를 생성 또는 확인
  const existingFollow = await db.follow.findUnique({
  where: {
    followerId_followingId: {
      followerId: userId,
      followingId: followUserId
    }
  }
});

    if (existingFollow) {
      return new Response('Already following this user', { status: 400 });
    }

    await db.follow.create({
      data: {
        followerId: userId,
        followingId: followUserId,
        notification : "on"
      }
    });

    return new Response('Followed successfully', { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response('Could not follow user at this time. Please try later', { status: 500 });
  }
}
