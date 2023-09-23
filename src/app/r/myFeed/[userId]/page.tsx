//src/app/r/[slug]/popular/page.tsx
import CustomFeed from '@/components/homepage/CustomFeed'
import GeneralFeed from '@/components/homepage/GeneralFeed'
import { buttonVariants } from '@/components/ui/Button'
import { Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import PopularFeed from '@/components/popular/Popular'
import PopularMyFeed from '@/components/myFeed/myFeed'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Home({ params }: { params: { userId: string } }) {

  return (
    <>
      {/* <h1 className='font-bold text-3xl md:text-4xl ml-4'>커뮤니티 게시물</h1> */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6 ml-1  sm:ml-20'>
        
        {/* @ts-expect-error server component */}
<PopularMyFeed slug={params.userId} />
<div className='hidden md:block overflow-hidden h-fit mt-20 rounded-lg border border-gray-200 order-first md:order-last mr-10 sm:ml-30' style={{ ...(process.browser && window.innerWidth >= 768 ? { marginLeft: '15rem' } : {}) }}>
    <div className='bg-emerald-100 px-6 py-4'>
        <p className='font-semibold py-3 flex items-center gap-1.5'>
            <HomeIcon className='h-4 w-4' />
            홈
        </p>
    </div>
    <dl className='-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6'>
        <div className='flex justify-between gap-x-4 py-3'>
            <p className='text-zinc-500'>
            개인 커뮤니티를 생성하여, 다른 사람과 함께 공유해 보세요!
            </p>
        </div>

        <Link
            className={buttonVariants({
                className: 'w-full mt-4 mb-6',
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
