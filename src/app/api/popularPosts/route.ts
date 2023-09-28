import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  try {
    const { limit, page } = z
      .object({
        limit: z.string(),
        page: z.string(),
      })
      .parse({
        limit: url.searchParams.get('limit'),
        page: url.searchParams.get('page'),
      });

    // We assume vote_Sum is of type String, so we use the "startsWith" filter for efficiency
    // This will fetch posts with vote_Sum values starting from "1" to "9", "10", "11" and so on
    const validPosts = await db.post.findMany({
      where: {
        vote_Sum: {
          gte: 10, 
        },
      },
      orderBy: {
        createdAt: 'desc',
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
