import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const body = await req.json();
    const targetUserId = body.targetUserId;
    console.log(targetUserId + "  아이디가 정상적으로 엔드포인트로 전송 완료 . ");

    if (!targetUserId) {
      return new Response(JSON.stringify({ message: 'Missing targetUserId in the request body.' }), { status: 400 });
    }

    const session = await getAuthSession(); 

    if (!session?.user) {
      return new Response(JSON.stringify({ isFollowing: false, message: 'Unauthorized' }), { status: 401 });
    }

    const currentUserId = session.user.id;

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      return new Response(JSON.stringify({ isFollowing: true, message: 'User is following the target user.' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ isFollowing: false, message: 'User is not following the target user.' }), { status: 200 });
    }

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ isFollowing: false, message: 'Internal server error.' }), { status: 500 });
  }
}
