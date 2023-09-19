import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession(); // 세션 정보를 가져옵니다.

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id; // 세션에서 사용자 ID를 가져옵니다.

    const requestBody = await req.json(); // 요청 본문을 JSON 형태로 파싱합니다.
    const { donateTo, donateCoin } = requestBody; // 요청 본문에서 donateTo와 donateCoin 값을 가져옵니다.

    const subredditId = 'cll2820ma00053nck3tlk6wju'; // 검색하려는 subreddit의 id를 여기에 넣어주세요.

    // Post 생성 및 donateTo, donateCoin 값 저장
    const post = await db.post.create({
      data: {
        title: 'Sample Title', // title 필드가 필수이므로 임의의 값으로 설정합니다
        authorId: userId,
        subredditId: subredditId,
        donateTo: donateTo,
        donateCoin: donateCoin,
        
      },
    });

    // 생성된 Post에 대한 응답을 반환합니다.
    return new Response(JSON.stringify(post), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);
    return new Response('Could not perform the operation at this time. Please try later', { status: 500 });
  }
}
