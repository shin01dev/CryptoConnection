import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import SubPostFeed from '../popularPostFeed';
import { notFound } from 'next/navigation';

const PopularFeed = async () => {
  const session = await getAuthSession();

  // only rendered if session exists, so this will not happen
  if (!session) return notFound();

  const posts = await db.post.findMany({
    where: {
      vote_Sum: {
        gte: 1, // "gte" stands for "greater than or equal to". It will only fetch posts with vote_Sum 1 or more.
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

  return <SubPostFeed  initialPosts={posts} session={session.user.id} />;
};

export default PopularFeed;
