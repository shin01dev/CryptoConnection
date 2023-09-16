'use client'
import MiniCreatePost from '@/components/MiniCreatePost'
import PopularPostFeed from '@/components/popularPostFeed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import SubredditPopularPostFeed from '@/components/subredditPopularPostFeed'

interface PageProps {
  params: {
    slug: string
  }
}

const Page = ({params}: PageProps) => {
  const { slug } = params
  const decodedSlug = decodeURIComponent(slug) // 한국어 문자열 디코딩
  // Remove or use the following states if you are not utilizing them.
  // const [error, setError] = useState(null);
  // const [data, setData] = useState<any[]>([]);
  // const [session, setSession] = useState<any[]>([]);

  const [popularFeedElement, setPopularFeedElement] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.post('/api/subredditPopularPosts', {
          slug: slug
        });
        if (response.status === 200) {
          const result = response.data;
          if (Array.isArray(result.filteredPosts)) {
            // setData(result.filteredPosts);  // Uncomment if you need it
            // setSession(result.userId);     // Uncomment if you need it
            setPopularFeedElement(<SubredditPopularPostFeed subredditName={decodedSlug} key={result.filteredPosts.length} initialPosts={result.filteredPosts} session={result.userId} slug={slug} />);
          } else {
            throw new Error('Data format is not as expected');
          }
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        // setError(error);    // Uncomment if you need it
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl h-14 ml-4'>
        {decodedSlug}
      </h1>
      <div className='sm:ml-20 ml-1'>
          {popularFeedElement}
      </div>
    </>
  );
};

export default Page;
