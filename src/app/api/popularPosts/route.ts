import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function GET(req: Request) {
  const url = new URL(req.url)

  const session = await getAuthSession()

  let followedCommunitiesIds: string[] = []


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
      })
      console.log(subredditName+"9")

  

      const getVoteDifference = async (postId: string) => {
        const upVotes = await db.vote.count({
          where: {
            postId: postId,
            type: 'UP'   // 'UP'은 실제 UP 투표를 나타내는 값으로 바꿔야 합니다.
          }
        });
      
        const downVotes = await db.vote.count({
          where: {
            postId: postId,
            type: 'DOWN'   // 'DOWN'은 실제 DOWN 투표를 나타내는 값으로 바꿔야 합니다.
          }
        });
      
        return upVotes - downVotes;
      };
      
      const allPostIds = await db.vote.findMany({
        select: {
          postId: true
        },
        distinct: ['postId']
      });
      
      const validPostIds = [];
      for (const { postId } of allPostIds) {
        const difference = await getVoteDifference(postId);
        if (difference >= 1) {
          validPostIds.push(postId);
        }
      }
      
      const validPosts = await db.post.findMany({
        where: {
          id: {
            in: validPostIds
          }
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
    return new Response('Could not fetch posts', { status: 500 })
  }
}
