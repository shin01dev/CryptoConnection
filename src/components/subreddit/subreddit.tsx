import { useRouter } from 'next/navigation';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import SubPostFeed from '../subredditPostFeed/subredditPostFeed';
import { notFound } from 'next/navigation';

// slug 매개변수의 타입을 명시적으로 지정
const SubredditFeed = async ({ slug }: { slug: string }) => {
  const session = await getAuthSession();
  // 현재 경로를 가져오기
  if (typeof window !== 'undefined') {
    const currentURL = window.location.href;
    // 현재 경로에 대한 작업 수행
  }
  // only rendered if session exists, so this will not happen

  const posts = await db.post.findMany({
    where: {
      subreddit: {
        name: slug, // 수정: slug 값을 사용
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

  return <SubPostFeed initialPosts={posts} subredditName={slug} session={session?.user.id} dataKey={undefined}  />;
};

export default SubredditFeed;
