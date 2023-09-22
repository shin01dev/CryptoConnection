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
interface SubRedditPostPageProps {
  params: {
    postId: string
  }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const SubRedditPostPage = async ({ params }: SubRedditPostPageProps) => {
  const cachedPost = (await redis.hgetall(
    `post:${params.postId}`
  )) as CachedPost

  let post: (Post & { votes: Vote[]; author: User }) | null = null

  // 이거 하면 캐쉬때문에 수정후에 변경이 적용이안됨
  // if (!cachedPost)
  
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
  return (
    <div>
<div className='w-full ml-0  mr-0 sm:w-5/5 sm:flex-1 sm:bg-white sm:p-4 sm:rounded-sm'>

              {/* 포스트 상세 가로 길이 */}
              <div className='ml-1 mr-1  sm:w-full sm:flex-1 sm:bg-white sm:p-4 sm:rounded-sm sm:max-w-[100%]'>

        <p className='max-h-40 mt-1 truncate text-xs text-gray-500 flex items-center'>
  Posted by u/{post?.author.username ?? cachedPost.authorUsername}
  {" | "}
  {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}

  {post?.donateCoin && post?.donateCoin > "0" && (
    <span className="flex items-center ml-2">      
      <img src={"/favicon.ico"} alt="Donate Image" width="20" height="20"/> 
      <div className='mr-1 ml-1'>  ·  </div>
      {post?.donateCoin}
    </span>
  )}
</p>



          <h1 className='text-xl font-semibold py-2 leading-6 text-gray-900'>
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
          })
        }}
      />
    </Suspense>
  </div>
</div>


        </Suspense>
          <Suspense
            fallback={
              <Loader2 className='h-5 w-5 animate-spin text-zinc-500' />
            }>
            {/* @ts-expect-error Server Component */}
            <CommentsSection postId={post?.id ?? cachedPost.id} />
          </Suspense>
          
        </div>
        
      </div>
      
    </div>
    
  )
}
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


export default SubRedditPostPage
