'use client'
import React, { useState } from 'react';
import "@uploadthing/react/styles.css";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "./api/uploadthing/core";
 
export default function Thumbnail() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
  
    // 이미지 업로드 완료 후 URL 저장
    const handleUploadComplete = async (res: any) => {
      if(res) {
        setImageUrl(res[0].fileUrl);
        const result = await fetch(`/api/saveImageUrl`, {  // API 엔드포인트가 실제로 존재하는지 확인해야 합니다
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: res[0].fileUrl }),
        });
        // 에러 처리 등을 추가해야 합니다
      }
      console.log("Files: ", res);
      alert("Upload Completed");
    }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton<OurFileRouter>
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          if(res) {
            // Assuming the response is an array and we are interested in the first file
            setImageUrl(res[0].fileUrl);
          }
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
      {imageUrl && <img src={imageUrl} alt="Uploaded file" />}
    </main>
  );
}
