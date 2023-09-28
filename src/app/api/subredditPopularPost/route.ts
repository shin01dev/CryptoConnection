import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  try {
    const { limit, page, subredditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subredditName: z.string().nullish().optional(),
      })
      .parse({
        subredditName: url.searchParams.get('subredditName'),
        limit: url.searchParams.get('limit'),
        page: url.searchParams.get('page'),
      });

    const validPosts = await db.post.findMany({
      where: {
        vote_Sum: {
          gte: 10  // `vote_Sum` 값이 1 이상인 포스트만 가져옵니다.
        },
        subreddit: subredditName ? { name: encodeURIComponent(subredditName) } : undefined,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
    });

    return new Response(JSON.stringify(validPosts));

  } catch (error) {
    return new Response('Could not fetch posts', { status: 500 });
  }
}
