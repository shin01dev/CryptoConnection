import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: any) {


  

    const session = await getAuthSession(); // `req` 파라미터를 전달합니다.
    const userId = session?.user?.id;
    console.log(userId)
    try {
        const latestPosts = await db.post.findMany({
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
    // 투표 수가 10 이상인 게시물 필터링
    const filteredPosts = latestPosts.filter((post: any) => {
        const votesAmt = post.votes.reduce((acc: number, vote: any) => {
          if (vote.type === 'UP') return acc + 1;
          if (vote.type === 'DOWN') return acc - 1;
          return acc;
        }, 0);
        return votesAmt >= 1;
      });
  
      return new Response(JSON.stringify({
        filteredPosts,
        userId
      }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }