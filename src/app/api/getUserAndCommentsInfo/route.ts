import { db } from '@/lib/db';

export async function POST(req: any) {
  try {
    const body = await req.json();
    const userId = body.userId;
    const postId = body.postId;

    // userId와 postId의 유효성 검사
    if (typeof userId !== 'string' || typeof postId !== 'string') {
      return new Response(JSON.stringify({ message: '잘못된 요청입니다.' }), { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, image: true }
    });

    const post = await db.post.findUnique({
      where: { id: postId },
      select: {
        subreddit: {
          select: { name: true }
        },
        comments: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            createdAt: true,
            // ... 기타 필요한 필드들 (예: userId, postId 등)
          }
        }
      }
    });

    
if (!post) {
  throw new Error('Post not found.');
}

let subredditName = post.subreddit ? post.subreddit.name : null;

if (!subredditName) {
  throw new Error('Subreddit not found for the post.');
}

return new Response(JSON.stringify({ user, subredditName }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
