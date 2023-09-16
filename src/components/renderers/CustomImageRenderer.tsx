'use client'

import Image from 'next/image'

//이미지 상대적으로 작음

// function CustomImageRenderer({ data }: any) {
//   const src = data.file.url

//   return (
//     <div className='relative w-full min-h-[15rem]'>
//       <Image alt='image' className='object-contain' fill src={src} />
//     </div>
//   )
// }

// export default CustomImageRenderer

// 이미지 상대적으로 큼
import { FC } from 'react'

interface CustomImageRendererProps {
  data: {
    file: {
      url: string
    }
    caption: string
  }
}

const CustomImageRenderer: FC<CustomImageRendererProps> = ({ data }) => {
  return (
    <div className="w-full">
      <img src={data.file.url} alt={data.caption} className="w-full h-auto" />
      <p>{data.caption}</p>
    </div>
  )
}

export default CustomImageRenderer
