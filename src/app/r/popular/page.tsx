




'use client';
import MiniCreatePost from '@/components/MiniCreatePost';
import PopularPostFeed from '@/components/popularPostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Home as HomeIcon, Loader2 } from 'lucide-react'

interface PageProps {}

const Page = ({}: PageProps) => {
  const [error, setError] = useState(null);
  const [Data, setData] = useState<any[]>([]); 
  const [Session, setSession] = useState<any[]>([]); 
  const [popularFeedElement, setPopularFeedElement] = useState<React.ReactNode | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('/api/populPosts');
        if (response.status === 200) {
          const result = response.data;
          if (Array.isArray(result.filteredPosts)) {
            setData(result.filteredPosts);
            setSession(result.userId);
            
            setPopularFeedElement(<PopularPostFeed key={result.filteredPosts.length} initialPosts={result.filteredPosts} session={result.userId} />);
            setLoading(false); 
          } else {
            throw new Error('Data format is not as expected');
          }
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error:any) {
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <div className='sm:ml-20 ml-1'>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 mt-10">
            <span className="text-gray-500 font-semibold text-lg">
            <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
            </span>
          </div>
        ) : (
          <>
            {popularFeedElement}
            {Data.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 mt-10">
                <span className="text-gray-500 font-semibold text-lg">
                  인기글이 아직 없습니다.
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Page;
