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


    // subredditName으로 필터링
    if (parsedData.subredditName) {
      whereClause.subreddit = {
        name: encodeURIComponent(parsedData.subredditName)
      };
    }

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

    const responseBody = JSON.stringify(posts);
    const clonedResponse = new Response(responseBody);

    // 여기서 응답의 body를 읽거나 조작할 수 있습니다.
    // 예: clonedResponse.text() 또는 clonedResponse.json()

    return clonedResponse;
  } catch (error) {
    return new Response('Could not fetch posts', { status: 500 })
  }
}
