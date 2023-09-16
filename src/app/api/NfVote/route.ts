import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ message: '인증되지 않았습니다.' }), { status: 401 });
    }

    const currentUserId = session.user.id;
    const userPostsVotes = await db.vote.findMany({
      where: {
        post: {
          authorId: currentUserId
        },
        userId: {
          not: currentUserId
        }
      },
      take: 50,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        userId: true,
        postId: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            createdAt: true,
            title: true,
            subredditId: true,
            subreddit: {
              select: {
                name: true
              }
            }
          }
        },
        user: {
          select: {
            username: true,
            image: true
          }
        }
      }
    });
    
    
    console.log(JSON.stringify(userPostsVotes, null, 2) + "00000000");
 

    return new Response(JSON.stringify({ postsVotes: userPostsVotes } ), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}