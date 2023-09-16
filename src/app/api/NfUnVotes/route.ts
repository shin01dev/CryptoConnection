import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    // 현재 세션에서 사용자 정보를 가져옵니다.
    const session = await getAuthSession();
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: '인증되지 않은 사용자입니다.' }), { status: 401 });
    }

    // 요구 사항에 따라 Vote 데이터를 찾고 notification을 'off'로 업데이트합니다.
    await db.vote.updateMany({
      where: {
        notification: "on",
        userId: {
          not: session.user.id
        },
        post: {
          authorId: session.user.id
        },
      },
      data: {
        notification: "off"
      }
    });

    // 주어진 요구 사항에 따라 CommentVote 데이터를 찾고 notification을 'off'로 업데이트합니다.
    await db.commentVote.updateMany({
      where: {
        notification: "on",
        userId: {
          not: session.user.id
        },
        comment: {
          authorId: session.user.id
        },
      },
      data: {
        notification: "off"
      }
    });

    return new Response(JSON.stringify({ message: '성공적으로 업데이트되었습니다.' }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
