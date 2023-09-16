// src/app/api/Followers.js

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

    // 팔로워 목록 가져오기
    const followersRelations = await db.follow.findMany({
      where: {
        followingId: lastSegment
      }
    });

    const followerIds = followersRelations.map(rel => rel.followerId);
    const followers = await db.user.findMany({
      where: {
        id: {
          in: followerIds
        }
      }
    });

    return new Response(JSON.stringify(followers), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error(error);
    return new Response('Could not fetch followers at this time.', { status: 500 });
  }
}
