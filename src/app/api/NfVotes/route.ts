import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    // 현재 세션에서 사용자 정보를 가져옵니다.
    const session = await getAuthSession();
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: '인증되지 않은 사용자입니다.' }), { status: 401 });
    }

    // 요구 사항에 따라 Vote 데이터를 찾습니다.
    const votesByOthers = await db.vote.findMany({
        where: {
          notification: "on",
          userId: {not:
             session.user.id}
          ,
          post: {
            authorId: session.user.id
          },
        },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              image: true,
              username: true,
            }
          },
          post: {
            select: {
              id: true,
              authorId: true,
              subreddit: {
                select: {
                  name: true
                }
              }
            }
          },
          type: true,
          notification: true,
          createdAt: true // Vote 모델의 createdAt 추가
        }
    });

    // 주어진 요구 사항에 따라 CommentVote 데이터를 찾습니다.
    const commentVotesByOthers = await db.commentVote.findMany({
        where: {
          notification: "on",
          userId: {not:
            session.user.id}
         ,
          comment: {
            authorId: session.user.id
          },
        },
        select: {
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
              id: true,
              authorId: true
            }
          },
          type: true,
          notification: true,
          createdAt: true // CommentVote 모델의 createdAt 추가
        }
    });

    // 두 데이터셋을 합치고 시간순으로 정렬합니다.
    const combinedData = [...votesByOthers, ...commentVotesByOthers];
    combinedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return new Response(JSON.stringify({ notificationsCount: combinedData.length }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
