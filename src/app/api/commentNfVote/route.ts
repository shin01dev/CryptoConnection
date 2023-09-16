import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ message: '인증되지 않았습니다.' }), { status: 401 });
    }

    const currentUserId = session.user.id;
    const userPostsVotes = await db.post.findMany({
      where: { authorId: currentUserId },
      select: {
        id: true, 
        votes: {
          where: { userId: { not: currentUserId } }, // 해당 부분 추가

          select: {
            userId: true,
            postId: true,
            user: {  // 연관된 사용자 정보를 가져옵니다.
              select: {
                username: true,
                image: true // 이 부분을 추가하여 사용자의 이미지 정보를 가져옵니다.
              }
            }
          }
        }
      },
  });
  
      
    if (userPostsVotes.length === 0) {
      return new Response(JSON.stringify({ message: '해당 사용자의 게시물이 없습니다.' }), { status: 404 });
    }

    return new Response(JSON.stringify({ postsVotes: userPostsVotes }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
