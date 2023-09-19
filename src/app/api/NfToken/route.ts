import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    // 현재 세션에서 사용자 정보를 가져옵니다.
    const session = await getAuthSession();
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: '인증되지 않은 사용자입니다.' }), { status: 401 });
    }

    // giveCryptoUser의 userId가 session.user.id와 일치하는 최근 50개의 데이터를 가져옵니다.
    const giveCryptoUserRecords = await db.giveCryptoUser.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        Time: 'desc' // Time을 기준으로 내림차순 정렬
      },
      take: 50 // 최근 50개만 가져옴
    });

    // session.user.id와 일치하는 donateTo의 최근 50개 post 데이터를 가져옵니다.
    const donatedPosts = await db.post.findMany({
        where: {
          donateTo: session.user.id
        },
        orderBy: {
          createdAt: 'desc' // createdAt을 기준으로 내림차순 정렬
        },
        select: {
          donateCoin: true,
          subredditId: true,
          id:true,
          createdAt:true,
          subreddit: {
            select: {
              name: true
            }
          },
          authorId: true,
          title: true,
          author: {
            select: {
              username: true,
              image: true
            }
          }
        },
        take: 50 // 최근 50개만 가져옴
      });
    
   
    return new Response(JSON.stringify({ giveCryptoUserRecords, donatedPosts }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
  }
}
