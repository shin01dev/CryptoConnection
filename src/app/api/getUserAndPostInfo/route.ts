import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const body = await req.json();
    const userId = body.userId; // 팔로우할 사용자의 ID를 요청 본문에서 가져옵니다.
    const postId = body.postId; // 팔로우할 사용자의 ID를 요청 본문에서 가져옵니다.

    // userId와 postId의 유효성 검사
    if (typeof userId !== 'string' || typeof postId !== 'string') {
      return new Response(JSON.stringify({ message: '잘못된 요청입니다.' }), { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    });

    const post = await db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        subreddit: {
          select: { name: true }
        }
      }
    });

    return new Response(JSON.stringify({ user, post }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
