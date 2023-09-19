import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: any) {
    const session = await getAuthSession(); // `req` 파라미터를 전달합니다.
    const userId = session?.user?.id;
    console.log(userId);

    try {
        const latestPosts = await db.post.findMany({
          where: {
            vote_Sum: {
              gte: 1, // vote_Sum이 1 이상인 게시물만 가져옵니다.
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
    
        if (!latestPosts || latestPosts.length === 0) {
          return new Response(JSON.stringify({ error: 'Posts not found' }), { status: 404 });
        }
  
        return new Response(JSON.stringify({
          filteredPosts: latestPosts,
          userId
      }), { status: 200 });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
