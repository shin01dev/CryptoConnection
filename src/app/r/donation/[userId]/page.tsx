//src/app/r/[slug]/popular/page.tsx
import CustomFeed from '@/components/homepage/CustomFeed'
import GeneralFeed from '@/components/homepage/GeneralFeed'
import { buttonVariants } from '@/components/ui/Button'
import { Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import PopularFeed from '@/components/popular/Popular'
import MyDonationFeed from '@/components/myDonationFeed/myDonationFeed'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Home({ params }: { params: { userId: string } }) {
  console.log(decodeURIComponent(params.userId)+"이게 슬러그");

  return (
    <>
      {/* <h1 className='font-bold text-3xl md:text-4xl ml-4'>커뮤니티 게시물</h1> */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6 ml-1  sm:ml-20'>
        {/* @ts-expect-error server component */}
<MyDonationFeed slug={params.userId} />
      </div>
    </>
  )
}
