import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'; // 해당 경로로부터 INFINITE_SCROLL_PAGINATION_RESULTS 를 임포트해야 합니다.

export async function GET(req: Request) {
  const session = await getAuthSession();
  

  // only rendered if session exists, so this will not happen
  if (!session) return notFound(); // notFound 함수가 정의되어 있지 않으므로, 해당 함수를 구현하거나 다른 에러 처리 메커니즘을 사용해야 합니다.


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

  return new Response(JSON.stringify(posts));
}
function notFound() {
    throw new Error('Function not implemented.');
}

