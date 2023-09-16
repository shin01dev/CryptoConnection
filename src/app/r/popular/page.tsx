'use client'
import MiniCreatePost from '@/components/MiniCreatePost'
import PopularPostFeed from '@/components/popularPostFeed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'

interface PageProps {}

const Page = ({}: PageProps) => {
  const [error, setError] = useState(null);
  const [Data, setData] = useState<any[]>([]); // If you are not using 'Data', you should remove this
  const [Session, setSession] = useState<any[]>([]); // If you are not using 'Session', you should remove this

  // PopularPostFeed 컴포넌트를 저장할 상태
  const [popularFeedElement, setPopularFeedElement] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('/api/populPosts');
        if (response.status === 200) {
          const result = response.data;
          if (Array.isArray(result.filteredPosts)) {
            setData(result.filteredPosts);
            setSession(result.userId);
            
            // API 호출이 성공적으로 완료된 후 PopularPostFeed 컴포넌트를 상태에 저장
            setPopularFeedElement(<PopularPostFeed key={result.filteredPosts.length} initialPosts={result.filteredPosts} session={result.userId} />);
          } else {
            throw new Error('Data format is not as expected');
          }
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error:any) {
        console.error('Error fetching data:', error);
        setError(error);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <div className='sm:ml-20 ml-1'>
          {/* 상태에서 저장된 PopularPostFeed 컴포넌트를 렌더링 */}
          {popularFeedElement}
      </div>
    </>
  );
};

export default Page;
