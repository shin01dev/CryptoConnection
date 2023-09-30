import CommentsSection from '@/components/CommentsSection'
import EditorOutput from '@/components/EditorOutput'
import PostVoteServer from '@/components/post-vote/PostVoteServer'
import { buttonVariants } from '@/components/ui/Button'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { formatTimeToNow } from '@/lib/utils'
import { CachedPost } from '@/types/redis'
import { Post, User, Vote } from '@prisma/client'
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Layout from '../../layout'
import { getAuthSession } from '@/lib/auth'
import { format } from 'date-fns'
import Link from 'next/link'
import { BASE_URL } from '@/components/BASE_URL'
import SubscribeLeaveToggle from '@/components/SubscribeLeaveToggle'
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SubRedditPostPageProps {
  params: {
    postId: string
  }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
function PostVoteShell() {
  return (
    <div className='flex items-center justify-center space-x-2 pr-6 '>
      {/* upvote */}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigUp className='h-01 w-5 text-zinc-700' />
      </div>

      {/* score */}
      <div className='text-center font-medium text-sm text-zinc-900'>
        <Loader2 className='h-3 w-3 animate-spin' />
      </div>

      {/* downvote */}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigDown className='h-5 w-5 text-zinc-700' />
      </div>
    </div>
  )
}

const SubRedditPostPage = async ({ params }: SubRedditPostPageProps) => {
  const cachedPost = (await redis.hgetall(
    `post:${params.postId}`
  )) as CachedPost

  let post: (Post & { votes: Vote[]; author: User }) | null = null

  const session = await getAuthSession()
  const subreddit = await db.subreddit.findFirst({
    where: {
      posts: {
        some: {
          id: params.postId, // params.postId를 직접 id와 비교
        },
      },
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });
  

  const subscription = !session?.user
  ? undefined
  : await db.subscription.findFirst({
      where: {
        subreddit: {
          posts: {
            some: {
              id: params.postId, // params.postId를 직접 id와 비교
            },
          },
        },
        user: {
          id: session.user.id,
        },
      },
    });

const isSubscribed = !!subscription;

if (!subreddit) return notFound();

const memberCount = await db.subscription.count({
  where: {
    subreddit: {
      posts: {
        some: {
          id: params.postId, // params.postId를 직접 id와 비교
        },
      },
    },
  },
});

  
  {
    post = await db.post.findFirst({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
        author: true,
      }
    })
  }

  if (!post && !cachedPost) return notFound()




  let formattedTime = formatDistanceToNow(new Date(post?.createdAt ?? cachedPost.createdAt), { addSuffix: true, locale: ko });
  formattedTime = formattedTime.replace('약 ', ''); // "약 " 제거


  return (
    <div className="flex justify-end">
    {/* 왼쪽 컨텐츠 */}
      <div className="flex-1">
        {/* 포스트 상세 가로 길이 */}
        <div className="lg:ml-20 ml-2 mr-2  justify-end sm:w-4/5 sm:flex-1 sm:bg-white sm:p-4 sm:rounded-sm sm:max-w-[100%]">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500 flex items-center">
            {post?.author.username ?? cachedPost.authorUsername}
            {" | "}
            <span className="truncate ml-1">{formattedTime}</span>
            {post?.donateCoin && post?.donateCoin > "0" && (
              <span className="flex items-center ml-2">
                <img src={"/favicon.ico"} alt="Donate Image" width="20" height="20" />
                <div className="mr-1 ml-1">  ·  </div>
                {post?.donateCoin}
              </span>
            )}
          </p>
          <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
            {post?.title ?? cachedPost.title}
          </h1>
          <EditorOutput content={post?.content ?? cachedPost?.content} />
          <Suspense fallback={<PostVoteShell />}>
            <div className="border-t mt-4 pt-4 flex justify-center">
              <div>
                <Suspense fallback={<PostVoteShell />}>
                  {/* @ts-expect-error server component */}
                  <PostVoteServer
                    postId={post?.id ?? cachedPost.id}
                    getData={async () => {
                      return await db.post.findUnique({
                        where: {
                          id: params.postId,
                        },
                        include: {
                          votes: true,
                        },
                      });
                    }}
                  />
                </Suspense>
              </div>
            </div>
          </Suspense>
          <Suspense
            fallback={
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            }>
            {/* @ts-expect-error Server Component */}
            <CommentsSection postId={post?.id ?? cachedPost.id} />
          </Suspense>
        </div>
      </div>

      
      {/* 오른쪽 컨텐츠 */}
   
 <div className="flex-2 ">
<div className="h-fit rounded-lg border border-gray-200 md:block hidden flex justify-start mr-20 ml-20 ">
  <div className="px-6 py-4">
    <p className="font-semibold py-3">{decodeURIComponent(subreddit.name)}</p>
  </div>
  <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
    <div className="flex justify-between gap-x-4 py-3">
      <dt className="text-gray-500">Created</dt>
      <dd className="text-gray-700">
        <time dateTime={subreddit.createdAt.toDateString()}>
          {format(subreddit.createdAt, 'MMMM d, yyyy')}
        </time>
      </dd>
    </div>
    <div className="flex justify-between gap-x-4 py-3">
      <dt className="text-gray-500">Members</dt>
      <dd className="flex items-start gap-x-2">
        <div className="text-gray-900">{memberCount}</div>
      </dd>
    </div>
    {subreddit.creatorId === session?.user?.id ? (
      <div className="flex justify-between gap-x-4 py-3">
        <dt className="text-gray-500">You created this community</dt>
      </div>
    ) : null}
{decodeURIComponent(subreddit.name) !== "토큰 후원" && decodeURIComponent(subreddit.name) !== "공지사항" && (
      <>
        {subreddit.creatorId !== session?.user?.id && (
          <SubscribeLeaveToggle
            isSubscribed={isSubscribed}
            subredditId={subreddit.id}
            subredditName={subreddit.name}
          />
        )}
        <a
          className={buttonVariants({
            variant: 'outline',
            className: 'w-full mb-6',
          })}
          href={`/r/${decodeURIComponent(subreddit.name)}/submit`}
          >
         게시물 만들기
        </a>
      </>
    )}
  </dl>
</div>


</div>
    </div>
    
  );
};









export default SubRedditPostPage
