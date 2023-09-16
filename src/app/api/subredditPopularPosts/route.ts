import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: any) {
    const body = await req.json();

    console.log('넌 할 수 있어:', body.slug);


    const session = await getAuthSession(); // `req` 파라미터를 전달합니다.
    const userId = session?.user?.id;

    // console.log(slug+"ㄹㄹㅎㅎ!@#!@#!@#!@#!@#")
    try {
        const latestPosts = await db.post.findMany({
            where: {
                subreddit: {
                  name: body.slug, // Match the slug to the one provided in the request
                }
              },
          include: {
            author: true,
            votes: true,
            comments: true,
            subreddit: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: INFINITE_SCROLL_PAGINATION_RESULTS, // 이 값은 필요에 따라 수정하세요.
        });
    
        if (!latestPosts) {
          return new Response(JSON.stringify({ error: 'Posts not found' }), { status: 404 });
        }
    // 투표 수가 2 이상인 게시물 필터링
    const filteredPosts = latestPosts.filter((post: any) => {
        const votesAmt = post.votes.reduce((acc: number, vote: any) => {
          if (vote.type === 'UP') return acc + 1;
          if (vote.type === 'DOWN') return acc - 1;
          return acc;
        }, 0);
        return votesAmt >= 10;
      });
  
      return new Response(JSON.stringify({
        filteredPosts,
        userId
      }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }