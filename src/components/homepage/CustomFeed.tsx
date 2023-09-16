import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import PostFeed from '../PostFeed'
import { notFound } from 'next/navigation'
import { json } from 'stream/consumers'

const CustomFeed = async () => {
  // console.log("Decoded ID: " + decodeURIComponent(props));



  const session = await getAuthSession()
  console.log(session?.user?.id+"유저아이디!@!@")

  // only rendered if session exists, so this will not happen
  if (!session) return notFound()
  console.log(session.user.id+"커스텀")
  const subscribedSubredditIds = await db.subscription.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      subredditId: true,
    },
  });
  

  
  const subscribedSubredditIdsArray = subscribedSubredditIds.map(sub => sub.subredditId);
  const posts = await db.post.findMany({
    where: {
      subreddit: {
        id: {
          in: subscribedSubredditIdsArray,
        },
      },
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
  



  console.log(session.user.id+"커스텀")

  return <PostFeed initialPosts={posts} session={session.user.id} />
}

export default CustomFeed
