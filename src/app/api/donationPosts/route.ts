import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function GET(req: Request) {
  const url = new URL(req.url)


  let followedCommunitiesIds: string[] = []



  try {
    const { limit, page, subredditName, session } = z
    .object({
      limit: z.string(),
      page: z.string(),
      subredditName: z.string().nullish().optional(),
      session: z.string().nullish().optional(),
    })
    .parse({
      subredditName: url.searchParams.get('subredditName'),
      limit: url.searchParams.get('limit'),
      page: url.searchParams.get('page'),
      session: url.searchParams.get('session')
    });
  
    let whereClause = {
      donateTo: session// This line ensures we only get posts from the current user
    };

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit), // skip should start from 0 for page 1
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    })

    return new Response(JSON.stringify(posts))
  } catch (error) {
    return new Response('Could not fetch posts', { status: 500 })
  }
}
