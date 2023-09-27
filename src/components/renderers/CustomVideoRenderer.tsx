'use client'

import React, { FC } from 'react';

interface CustomVideoRendererProps {
  data: {
    file: {
      url: string
    }
    caption: string
  }
}

const CustomVideoRenderer: FC<CustomVideoRendererProps> = ({ data }) => {
  return (
    <div className="w-full">
      <video src={data.file.url} controls className="w-full h-auto">
        Your browser does not support the video tag.
      </video>
      <p>{data.caption}</p>
    </div>
  );
}

export default CustomVideoRenderer;
