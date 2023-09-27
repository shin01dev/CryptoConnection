'use client'
import { Editor } from '@/components/Editor'
import { Button } from '@/components/ui/Button'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react'

interface pageProps {
  params: {
    slug: string
  }
}

const Page: React.FC<pageProps> = ({ params }) => {
  const [subredditId, setSubredditId] = useState<string | null>(null);
  const [subredditName, setSubredditName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const isRestrictedSlug = decodeURIComponent(params.slug) === '공지사항' || decodeURIComponent(params.slug) === '토큰 후원';



  const fetchSubreddit = async (slug: string) => {
    try {
      const response = await axios.post('/api/editor', { slug });
      if (response.status === 200) {
        const subreddit = response.data.subreddit;
        setSubredditId(subreddit.id);
        setSubredditName(decodeURIComponent(subreddit.name));
      } else {
        console.error('Error retrieving subreddit:', response.data);
      }
    } catch (error) {
      console.error('Network or server error:', error);
    }
  };
  const LoadingOverlay: React.FC = () => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    }}>
        <Loader2 />
    </div>
);
const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePost = async () => {
    if (isLoading) return; // 로딩 중이면 요청을 중단
  
    setIsLoading(true); // 로딩 상태 시작
  
    try {
      // 여기에 POST 요청 관련 코드를 추가
      // 예: const response = await axios.post('/api/post', data);
  
      // 요청이 성공적으로 완료되면 로딩 상태 종료
      setIsLoading(false); 
    } catch (error) {
      console.error('Error posting data:', error);
      setIsLoading(false); // 에러 발생 시 로딩 상태 종료
    }
  }



  useEffect(() => {
    fetchSubreddit(params.slug);
  }, [params.slug]);
  return (
    <div className='flex flex-col items-start gap-6'>
      {!isRestrictedSlug && (
        <>
          {/* heading */}
          <div className='border-b border-gray-200 pb-5'>
            <div className='-ml-2 -mt-2 flex flex-wrap items-baseline'>
              <h3 className='ml-2 mt-2 text-base font-semibold leading-6 text-gray-900'>
                Create Post
              </h3>
              <p className='ml-2 mt-1 truncate text-sm text-gray-500'>
                {subredditName ? ` [ ${subredditName} ] ` : ''}
              </p>
            </div>
          </div>

          {/* form */}
          <Editor subredditId={subredditId || ''} editThumbnail={undefined} />

          <div className='w-full flex justify-end bg-blue-500  mb-4'>
            <Button 
              type='submit' 
              className='w-full  text-white' 
              form='subreddit-post-form' 
              onClick={handlePost}
              disabled={isLoading} // 로딩 중일 때 버튼 비활성화
            >
              {isLoading ? <LoadingOverlay /> : "게시하기"} 
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default Page;
