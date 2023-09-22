// 수정하는 페이지
import { Editor } from '@/components/Editor'
import Post from '@/components/Post'
import { Button } from '@/components/ui/Button'

import CustomCodeRenderer from '@/components/renderers/CustomCodeRenderer'
import CustomImageRenderer from '@/components/renderers/CustomImageRenderer'
import CommentsSection from '@/components/CommentsSection'
import EditorOutput from '@/components/EditorOutput'
import PostVoteServer from '@/components/post-vote/PostVoteServer'
import { buttonVariants } from '@/components/ui/Button'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { formatTimeToNow } from '@/lib/utils'
import { CachedPost } from '@/types/redis'
import {  User, Vote } from '@prisma/client'
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Layout from '../../layout'
// src/app/r/[slug]/edit/[id]/page.tsx
interface pageProps {
  params: {
    slug: string
    id: string
  }
}
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
const page = async ({ params }: pageProps) => {
  // 해당 슬러그에 해당하는 subreddit 정보 가져오기
  
  const subreddit = await db.subreddit.findFirst({
    where: {
      name: params.slug,
    },
  })

  const decodeName = decodeURI(Post.name)

  const cachedPost = (await redis.hgetall(
    `post:${params.id}`
  )) as CachedPost

  const decodename = decodeURIComponent(params.slug)
  if (!subreddit) return notFound()

  // 해당 subreddit에 속한 포스트 정보 가져오기
  const post = await db.post.findFirst({
    where: {
      id: params.id,
      subredditId: subreddit.id,
      
    },
  })

 

  return (
    <div className='flex flex-col items-start gap-6'>
      {/* 제목 */}
      <div className='border-b border-gray-200 pb-5'>
        <div className='-ml-2 -mt-2 flex flex-wrap items-baseline'>
          <h3 className='ml-2 mt-2 text-base font-semibold leading-6 text-gray-900'>
            게시물 작성
          </h3>
          <p className='ml-2 mt-1 truncate text-sm text-gray-500'>
            {' [ ' + decodename + ' ] '}
          </p>
        </div>
      </div>

      {/* 폼 */}
      <Editor subredditId={subreddit.id} content={post?.content} title={post?.title} postId={post?.id} editThumbnail={post?.thumbnail}/>
      {/* <EditorOutput content={post?.content ?? cachedPost.content} /> */}

      <div className='w-full flex justify-end bg-blue-500 mb-4'>
        <Button type='submit' className='w-full' form='subreddit-post-form'>
          게시하기
        </Button>
      </div>
    </div>
  )
}

export default page
