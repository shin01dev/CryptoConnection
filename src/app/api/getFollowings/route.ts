// src/app/api/Followings.js

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const body = await req.json();
    const lastSegment = body.lastSegment; // 팔로우할 사용자의 ID를 요청 본문에서 가져옵니다.
console.log(JSON.stringify(body)+"ZXZXCZXCZXCZXCZXCZXC")

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // 팔로잉 목록 가져오기
    const followingsRelations = await db.follow.findMany({
      where: {
        followerId: lastSegment
      }
    });

    const followingIds = followingsRelations.map(rel => rel.followingId);
    const followings = await db.user.findMany({
      where: {
        id: {
          in: followingIds
        }
      }
    });

    return new Response(JSON.stringify(followings), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error(error);
    return new Response('Could not fetch followings at this time.', { status: 500 });
  }
}
