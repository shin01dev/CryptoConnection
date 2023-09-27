'use client'

import Image from 'next/image'


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
