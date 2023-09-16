import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function GET(req: Request) {
  const url = new URL(req.url)


  let followedCommunitiesIds: string[] = []



  try {
 const parsedData = z
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
    session: url.searchParams.get('session'),
  });

let whereClause: any = {};

  whereClause.donateTo = parsedData.session;


const posts = await db.post.findMany({
    take: parseInt(parsedData.limit),
    skip: (parseInt(parsedData.page) - 1) * parseInt(parsedData.limit),
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
  });
  

    return new Response(JSON.stringify(posts))
  } catch (error) {
    return new Response('Could not fetch posts', { status: 500 })
  }
}
