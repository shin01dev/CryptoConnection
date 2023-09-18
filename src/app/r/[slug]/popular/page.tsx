'use client'
import MiniCreatePost from '@/components/MiniCreatePost'
import PopularPostFeed from '@/components/popularPostFeed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import SubredditPopularPostFeed from '@/components/subredditPopularPostFeed'
import { Home as HomeIcon, Loader2 } from 'lucide-react'

interface PageProps {
  params: {
    slug: string
  }
}

const Page = ({params}: PageProps) => {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);
  
  const [popularFeedElement, setPopularFeedElement] = useState<React.ReactNode | null>(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.post('/api/subredditPopularPosts', {
          slug: slug
        });
        if (response.status === 200) {
          const result = response.data;
          if (Array.isArray(result.filteredPosts) && result.filteredPosts.length > 0) {
            setPopularFeedElement(<SubredditPopularPostFeed subredditName={decodedSlug} key={result.filteredPosts.length} initialPosts={result.filteredPosts} session={result.userId} slug={slug} />);
          } else {
            setPopularFeedElement(<p className="mt-5 text-lg text-center text-gray-500">인기 게시물이 아직 없습니다.</p>);
          }
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
      }
      setLoading(false); // 데이터 로딩이 완료되었거나 에러가 발생했을 때 로딩 상태를 false로 설정
    }

    fetchData();
  }, []);
  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl h-14 ml-4'>
        {decodedSlug}
      </h1>
      <div className='sm:ml-20 ml-1 flex justify-center items-center min-h-screen'>
          {loading ? 
            <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
          : 
            popularFeedElement
          }
      </div>
    </>
  );
};

export default Page;
