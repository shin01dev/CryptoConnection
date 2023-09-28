import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import CommunityPostFeed from '../communityPostFeed/communityPostFeed'
import { notFound } from 'next/navigation'
import { json } from 'stream/consumers'

const CustomFeed = async () => {



  const session = await getAuthSession()

  // only rendered if session exists, so this will not happen
  const subscribedSubredditIds = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    select: {
      subredditId: true,
    },
  });
  

  
  const subscribedSubredditIdsArray = subscribedSubredditIds.map(sub => sub.subredditId);
  const posts = await db.post.findMany({
    where: {
      AND: [
        {
          subreddit: {
            id: {
              in: subscribedSubredditIdsArray,
            },
          },
        },
        {
          subreddit: {
            name: {
              not: encodeURIComponent("토큰 후원"),
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
  });
  




  return <CommunityPostFeed initialPosts={posts} session={session?.user.id} />
}

export default CustomFeed
