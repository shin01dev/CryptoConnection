import { db } from '@/lib/db'
import PostFeed from '../PostFeed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth' // Import getAuthSession

const GeneralFeed = async () => {
  const session = await getAuthSession() // Get the session

  const posts = await db.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLL_PAGINATION_RESULTS, // 4 to demonstrate infinite scroll, should be higher in production
  })

  return <PostFeed initialPosts={posts} session={session?.user.id} />
}

export default GeneralFeed
