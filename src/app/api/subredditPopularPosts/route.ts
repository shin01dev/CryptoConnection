import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
export async function POST(req: any) {
  const body = await req.json();
  console.log('넌 할 수 있어:', body.slug);

  const session = await getAuthSession();
  const userId = session?.user?.id;

  try {
    const latestPosts = await db.post.findMany({
      where: {
        subreddit: {
          name: body.slug,
        },
        vote_Sum: {
          gte: 1  
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
      take: INFINITE_SCROLL_PAGINATION_RESULTS,
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
