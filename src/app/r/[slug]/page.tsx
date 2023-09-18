'use client';
import React, { useState, useEffect } from 'react';
import MiniCreatePost from '@/components/MiniCreatePost';
import PostFeed from '@/components/PostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import SubPostFeed from '@/components/subredditPostFeed/subredditPostFeed';
import axios from 'axios';
import { Home as HomeIcon, Loader2 } from 'lucide-react'

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubreddit(slug: string) {
      try {
        const response = await axios.post('/api/subPost', { slug: slug });
        setSubredditData(response.data);
        setLoading(false);
      } catch (error: any) {
        setError(error);
        setLoading(false);
        console.error('Error fetching subreddit:', error);
      }
    }

    fetchSubreddit(slug);
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-start pt-40 h-screen'>
        <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
      </div>
    );
  }

  if (error) {
    return <div>Error fetching data</div>;
  }

  if (!subredditData) {
    return null;
  }

  const { subreddit, userId } = subredditData;

  if (!subreddit) return <div>Subreddit not found</div>;

  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl h-14 ml-4'>
        {decodeURIComponent(subreddit.name)}
      </h1>
      <SubPostFeed 
        dataKey={slug}
        initialPosts={subreddit.posts} 
        subredditName={subreddit.name} 
        session={userId} 
      />
      {subreddit.posts.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-10">
          <span className="text-gray-500 font-semibold text-lg">
            게시물이 아직 없습니다.
          </span>
        </div>
      )}
    </>
  );
};

export default Page;
