'use client'
import React, { useState, useEffect } from 'react';
import MiniCreatePost from '@/components/MiniCreatePost';
import PostFeed from '@/components/PostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import SubPostFeed from '@/components/subredditPostFeed/subredditPostFeed';
import axios from 'axios';

interface PageProps {
  params: {
    slug: string;
  };
}

const Page = ({ params }: PageProps) => {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);

  type SubredditDataType = {
    subreddit: {
      name: string;
      posts: any[];
    };
    userId: any;
  };

  const [subredditData, setSubredditData] = useState<SubredditDataType | null>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSubreddit(slug: string) {
      try {
        const response = await axios.post('/api/subPost', { slug: slug });
        setSubredditData(response.data);
      } catch (error: any) {
        setError(error);
        console.error('Error fetching subreddit:', error);
      }
    }

    fetchSubreddit(slug);
  }, []);


  if (error) {
    return <div>Error fetching data</div>;
  }

  if (!subredditData) {
    return ;
  }

  const { subreddit, userId } = subredditData;

  if (!subreddit) return <div>Subreddit not found</div>;

  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl h-14 ml-4'>
        {decodeURIComponent(subreddit.name)}
      </h1>
      <SubPostFeed 
        dataKey={slug}  // key prop 추가
        initialPosts={subreddit.posts} 
        subredditName={subreddit.name} 
        session={userId} 
      />
    </>
  );
};

export default Page;
