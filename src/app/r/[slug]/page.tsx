// src/app/r/[slug]
import CustomFeed from '@/components/homepage/CustomFeed'
import GeneralFeed from '@/components/homepage/GeneralFeed'
import { buttonVariants } from '@/components/ui/Button'
import { Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import PopularFeed from '@/components/popular/Popular'
import SubredditFeed from '@/components/subreddit/subreddit'
import SubscribeLeaveToggle from '@/components/SubscribeLeaveToggle'
import { BASE_URL } from '@/components/BASE_URL'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'




export default async function Home({ params }: { params: { slug: string } }) {
  const session = await getAuthSession()
  const subreddit = await db.subreddit.findFirst({
    where: { name: params.slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  })

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subreddit: {
            name: params.slug,
          },
          user: {
            id: session.user.id,
          },
        },
      })

      const isSubscribed = !!subscription

      if (!subreddit) return notFound()
      const memberCount = await db.subscription.count({
        where: {
          subreddit: {
            name: params.slug,
          },
        },
      })

      



  return (
    <>
     

      
     <div className='grid grid-cols-1 md:grid-cols-1 gap-y-4 md:gap-x-4 py-6 ml-1  sm:ml-20'>
      <div className='justify-end overflow-hidden h-fit rounded-lg border border-gray-200 ml-1 mr-2 sm:ml-20 sm:mr-1 mt-3 md:hidden'>
            
            <div className='px-6 py-4'>
            <p className='font-semibold py-3'>{decodeURIComponent(subreddit.name)}</p>
            </div>
            <dl className='divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white'>


           <div className='flex justify-between gap-x-4 py-3'>
                <dt className='text-gray-500'>Created</dt>
                <dd className='text-gray-700'>
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, 'MMMM d, yyyy')}
                  </time>
                </dd>
              </div> 
           <div className='flex justify-between gap-x-4 py-3'>
                <dt className='text-gray-500'>Members</dt>
                <dd className='flex items-start gap-x-2'>
                  <div className='text-gray-900'>{memberCount}</div>
                </dd>
              </div> 
              {subreddit.creatorId === session?.user?.id ? (
                <div className='flex justify-between gap-x-4 py-3'>
                  <dt className='text-gray-500'>You created this community</dt>
                </div>
              ) : null}  


{
  decodeURIComponent(subreddit.name) !== "토큰 후원" && (
    <>
      {subreddit.creatorId !== session?.user?.id && (
        <SubscribeLeaveToggle
          isSubscribed={isSubscribed}
          subredditId={subreddit.id}
          subredditName={subreddit.name}
        />
      )}
      <Link
        className={buttonVariants({
          variant: 'outline',
          className: 'w-full mb-6',
        })}
        href={`${BASE_URL}/r/${params.slug}/submit`}
        
      >
        Create Post
      </Link>
    </>
  )
}




            </dl>
            

          </div>



          <div className='  h-fit w-3/4 rounded-lg border border-gray-200  md:block hidden sm:mr-20'>
            
            <div className='px-6 py-4 ' >
            <p className='font-semibold py-3'>{decodeURIComponent(subreddit.name)}</p>
            </div>
            <dl className='divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white'>


              
           <div className='flex justify-between gap-x-4 py-3'>
                <dt className='text-gray-500'>Created</dt>
                <dd className='text-gray-700'>
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, 'MMMM d, yyyy')}
                  </time>
                </dd>
              </div> 
           <div className='flex justify-between gap-x-4 py-3'>
                <dt className='text-gray-500'>Members</dt>
                <dd className='flex items-start gap-x-2'>
                  <div className='text-gray-900'>{memberCount}</div>
                </dd>
              </div> 
              {subreddit.creatorId === session?.user?.id ? (
                <div className='flex justify-between gap-x-4 py-3'>
                  <dt className='text-gray-500'>You created this community</dt>
                </div>
              ) : null}  


{
  decodeURIComponent(subreddit.name) !== "토큰 후원" && (
    <>
      {subreddit.creatorId !== session?.user?.id && (
        <SubscribeLeaveToggle
          isSubscribed={isSubscribed}
          subredditId={subreddit.id}
          subredditName={subreddit.name}
        />
      )}
      <Link
        className={buttonVariants({
          variant: 'outline',
          className: 'w-full mb-6',
        })}
        href={`${BASE_URL}/r/${params.slug}/submit`}
        
      >
        게시물 만들기
      </Link>
    </>
  )
}




            </dl>
            

          </div>

        {/* @ts-expect-error server component */}
          <SubredditFeed slug={params.slug} />








          
      </div>
      
    </>
  )
}

