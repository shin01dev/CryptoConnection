import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    // 현재 세션에서 사용자 정보를 가져옵니다.
    const session = await getAuthSession();
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: '인증되지 않은 사용자입니다.' }), { status: 401 });
    }

    // session.user.id와 일치하며 notification이 "on"인 post 항목들을 가져옵니다.
    const matchingPosts = await db.post.findMany({
      where: {
        donateTo: session.user.id,
        notification: "on"
      }
    });

    // 가져온 post 항목들의 수를 출력합니다.

    // 일치하는 게시물의 수를 반환합니다.
    return new Response(JSON.stringify({ matchingPostsCount: matchingPosts.length }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
