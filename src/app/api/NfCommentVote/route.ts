import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    // 현재 세션에서 사용자 정보를 가져옵니다.
    const session = await getAuthSession(); // req를 getAuthSession에 전달합니다.
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: '인증되지 않은 사용자입니다.' }), { status: 401 });
    }

    // 세션의 userId와 일치하지 않으면서 comment의 authorId가 session.user.id와 일치하고 type이 "UP"인 CommentVote를 찾습니다.
    const votesByOthers = await db.commentVote.findMany({
        where: {
          userId: {
            not: session.user.id
          },
          comment: {
            authorId: session.user.id
          },
          type: "UP"
        },
        orderBy: {
          createdAt: 'desc' // CommentVote의 createdAt 필드를 기준으로 내림차순 정렬
        },
        take:50,
        select: {
          createdAt: true, 
          userId: true,
          user: {
            select: {
              id: true,
              image: true,
              username: true,
            }
          },
          comment: {
            select: {
              text: true,
              postId: true,
              authorId: true,
              createdAt: true,
              post: {
                select: {
                  subreddit: {
                    select: {
                      name: true
                    }
                  }
                }
              },
            }
          },
          type: true
        }
      });
    

    console.log(JSON.stringify(votesByOthers) + "QWQWQZZZZz");
    return new Response(JSON.stringify({ votesByOthers }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
