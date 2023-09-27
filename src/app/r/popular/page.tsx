import CustomFeed from '@/components/homepage/CustomFeed'
import GeneralFeed from '@/components/homepage/GeneralFeed'
import { buttonVariants } from '@/components/ui/Button'
import { Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import PopularFeed from '@/components/popular/Popular'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
import { Suspense } from 'react'

export default async function Home() {
  

  return (
    <>
      {/* <h1 className='font-bold text-3xl md:text-4xl ml-4'>커뮤니티 게시물</h1> */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6 ml-1  sm:ml-20' >
      {/* <Suspense> */}
        {/* @ts-expect-error server component */}
      <PopularFeed /> 
      {/* </Suspense> */}
 
{/* subreddit info - Instagram Style */}
<div className='hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last mr-10 sm:ml-30 shadow-md' style={{ ...(process.browser && window.innerWidth >= 768 ? { marginLeft: '15rem' } : {}) }}>
          <div className='bg-gradient-to-r from-purple-400 to-blue-300 px-6 py-4 border-b border-gray-200'>
              <p className='font-semibold py-3 flex items-center gap-1.5 text-white'>
                  <HomeIcon className='h-4 w-4' />
                  커뮤니티
              </p>
          </div>
          <dl className='px-6 py-4 text-sm leading-6'>
              <div className='flex justify-between gap-x-4 py-3'>
                  <p className='text-gray-600'>
                  개인 커뮤니티를 생성하여, 다른 사람과 함께 공유해 보세요!
                  </p>
              </div>

              <Link
                  className={buttonVariants({
                      className: 'w-full mt-4 mb-6 bg-blue-500 text-white rounded-md shadow-md',
                  })}
                  href={`/r/create`}>
                  커뮤니티 생성
              </Link>
          </dl>
        </div>

        
      </div>
    </>
  )
}