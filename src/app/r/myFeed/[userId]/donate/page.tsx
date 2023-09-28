
'use client'
import { Editor } from '@/components/Editor'
import { Button } from '@/components/ui/Button'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Thumbnail from '@/app/uploader'
import axios from 'axios'
interface PageProps {
  params: {
    slug: string
    userId :string
  }
}

const Page =  ({ params }: PageProps) => {
  const [coinNumber, setCoinNumber] = useState<number | null>(0);

  const decodename = decodeURIComponent(params.slug)
 const donateTo = params.userId
//  const [donateCoin, setdonateCoin] = useState("9");
// const donateCoin ="params.userId"
async function getCoinNumber() {
  // Assume we get the coin number from an API
  const response = await axios.get('/api/getCoinNumber');
  
  // Get the first object from the response data array
  const firstObject = response.data[0];

  // Log the crypto_currency value
  
  setCoinNumber(firstObject.crypto_currency);  // Setting the state with the fetched value
}
useEffect(() => {
  getCoinNumber();
})

  
  return (
    <div className='flex flex-col items-start gap-6 sm:ml-10 sm:mr-10 ml-2 mr-2'>
      {/* heading */}
      <div className='border-b border-gray-200 pb-5'>


        <div className='-ml-2 -mt-2 flex flex-wrap items-baseline'>
          <h3 className='ml-2 mt-2 text-base font-semibold leading-6 text-gray-900'>
            게시물 만들기
          </h3>
          <p className='ml-2 mt-1 truncate text-sm text-gray-500'>
             {' [토큰 후원] '}
          </p>
        </div>
      </div>



      {/* form */}
      <Editor 
        subredditId={"cln2rd2hw0006squwqb8ox0sf"} 
        editThumbnail={undefined}
        donateTo={donateTo} 
      />



{
        coinNumber && coinNumber >= 1 ? (
          <div className='w-full flex justify-end bg-blue-500 mb-4'>
          <Button type='submit' className='w-full' form='subreddit-post-form'>
            게시하기
          </Button>
        </div>
        
        ) : (
          <div className="text-center text-red-500">
            후원은 토큰 1개 이상부터 가능 합니다
          </div>
        )
      }
{/* <Thumbnail/> */}

    </div>
    
  )
}

export default Page
