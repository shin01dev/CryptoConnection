import { useRouter } from 'next/navigation';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import MyPostFeed from '../myPostFeed';
import { notFound } from 'next/navigation';

// slug 매개변수의 타입을 명시적으로 지정
const PopularMyFeed = async ({ slug }: { slug: string }) => {
  const session = await getAuthSession();

  // only rendered if session exists, so this will not happen
  // if (!session) return notFound();

  const posts = await db.post.findMany({
    where: {
      authorId: slug, // `Post`의 `authorId`가 `slug`와 일치하는 것만 검색합니다.
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
  
  const user = await db.user.findUnique({
    where: {
      id: slug
    },
    select: {
      username: true,
      _count: {
        select: {
          followers: true,
          following: true
        }
      }
    }
});

if (!user) {
    throw new Error("User not found"); // or handle this error in a way that's appropriate for your application
}

const followerCount = user._count?.followers;
const followingCount = user._count?.following;


const existingFollow = await db.follow.findUnique({
  where: {
    followerId_followingId: {
      followerId: session?.user.id || 'defaultUserId',
      followingId: slug,
    },
  },
});

return <MyPostFeed initialPosts={posts} session={slug} username={user?.username} followersCount={followerCount}   

followingCount={followingCount} // existingFollow가 있으면 followingCount, 없으면 0

yourUserId={session?.user.id} existingFollow={existingFollow} />;
};

export default PopularMyFeed;
