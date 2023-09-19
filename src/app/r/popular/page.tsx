'use client'
import MiniCreatePost from '@/components/MiniCreatePost';
import PopularPostFeed from '@/components/popularPostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Home as HomeIcon, Loader2 } from 'lucide-react'

interface PageProps {}
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
const CACHE_KEY = 'populPostsData';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const Page = ({}: PageProps) => {
  const [error, setError] = useState(null);
  const [data, setData] = useState<any[]>([]); 
  const [session, setSession] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Check for cached data
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_KEY + ':timestamp');
      
      if (cachedData && cacheTimestamp && (Date.now() - Number(cacheTimestamp) < CACHE_DURATION)) {
        const parsedData = JSON.parse(cachedData);
        setData(parsedData.filteredPosts);
        setSession(parsedData.userId);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/populPosts');
        if (response.status === 200) {
          const result = response.data;
          if (Array.isArray(result.filteredPosts)) {
            // Cache the data
            localStorage.setItem(CACHE_KEY, JSON.stringify(result));
            localStorage.setItem(CACHE_KEY + ':timestamp', Date.now().toString());

            setData(result.filteredPosts);
            setSession(result.userId);
            setLoading(false);
          } else {
            throw new Error('Data format is not as expected');
          }
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className='sm:ml-20 ml-1'>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 mt-10">
          <span className="text-gray-500 font-semibold text-lg">
            <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
          </span>
        </div>
      ) : (
        <>
          <PopularPostFeed key={data.length} initialPosts={data} session={session} />
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 mt-10">
              <span className="text-gray-500 font-semibold text-lg">
                인기글이 아직 없습니다.
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Page;
