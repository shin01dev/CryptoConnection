import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: any) {
    const body = await req.json()

  try {
    if (!body.slug) {
      return new Response(JSON.stringify({ error: 'Slug is required' }), { status: 400 });
    }

    const slug = body.slug;

    const session = await getAuthSession(); // `req` 파라미터를 전달합니다.
    const userId = session?.user?.id;
    console.log(userId)

    const decodedSlug = decodeURIComponent(slug);
console.log(decodedSlug+"3")
    const subreddit = await db.subreddit.findFirst({
      where: { name: slug },
      include: {
        posts: {
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
        },
      },
    });
    // console.log(JSON.stringify(subreddit)+"123123123")

    if (!subreddit) {
      return new Response(JSON.stringify({ error: 'Subreddit not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({
      subreddit,
      userId
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
