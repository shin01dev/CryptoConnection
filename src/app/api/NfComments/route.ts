import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ message: '인증되지 않았습니다.' }), { status: 401 });
    }

    const currentUserId = session.user.id;

    // 다른 사람이 현재 사용자의 게시물이나 댓글에 단 댓글만 가져옵니다.
    const page = req.body.page || 0; // 페이지 정보를 가져옵니다.
    const limit = 50; // 한 번에 반환할 아이템의 수를 50으로 변경
    const offset = page * limit; // 해당 페이지의 시작 아이템 인덱스

    const userComments = await db.comment.findMany({
      where: {
        NOT: { authorId: currentUserId },
        OR: [
          { post: { authorId: currentUserId } },
          { replyTo: { authorId: currentUserId } }
        ]
      },
      orderBy: {
        createdAt: 'desc' // 최신 댓글이 먼저 오도록 설정
      },
      take: 50, // 최대 50개의 댓글만 가져오도록 설정
      select: {
        id: true,
        text: true,
        createdAt: true,
        authorId: true,
        post: true,
        postId: true,
        replyToId: true,
        replyTo: true,
        replies: true,
        notification: true,
        donationInput: true,
      },
    });

    return new Response(JSON.stringify({ comments: userComments }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
