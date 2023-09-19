import { db } from '@/lib/db';

export async function POST(req: any) {
  try {
    const body = await req.json();
    const sessionValue = body.session; // 요청 본문에서 publicKey를 가져옵니다.


    const user = await db.user.findUnique({
      where: {
        id: sessionValue
      },
      select: {
        username: true
      }
    });
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    return new Response(JSON.stringify({ username: user.username }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Could not fetch username at this time. Please try later', { status: 500 });
  }
}
