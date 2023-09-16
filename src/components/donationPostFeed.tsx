'use client'

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { ExtendedPost } from '@/types/db'
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { FC, useEffect, useRef } from 'react'
import Post from './Post'
import { useSession } from 'next-auth/react'
import { useState } from 'react';

interface PostFeedProps {
  initialPosts: ExtendedPost[]
  subredditName?: string
  session :any
  
}

const DonationPostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName,session }) => {
  const lastPostRef = useRef<HTMLElement>(null)
  const BASE_URL = 'http://localhost:3000';

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  })
  const [userName, setUsername] = useState<string | null>(null); // username 상태 변수를 추가
  const [currentURL, setCurrentURL] = useState('');

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['infinite-query'],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/donationPostFeed?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}&session=${session}` +
        (!!subredditName ? `&subredditName=${subredditName}` : '')

      const { data } = await axios.get(query)
      return data as ExtendedPost[]
    },

    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
      cacheTime: 0,
      refetchOnWindowFocus: true,
      staleTime: 0,    }
  )

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage() // Load more posts when the last post comes into view
    }
  }, [entry, fetchNextPage])

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts
  const getUsernameFromSession = async (sessionValue: any) => {
    try {
      const response = await axios.post(`/api/getUserName`, { session: sessionValue });
      
      if (response.status === 200) {
        return response.data.username;
      } else {
        throw new Error('Failed to get username');
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  }
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/r/myFeed') || pathname.includes('/r/donation')) {
      (async function loadUsername() {
        const username = await getUsernameFromSession(session);
        setUsername(username);
      })();
    }
  }, []);
  
  return (
    
    <ul className='flex flex-col col-span-2 space-y-6'>
      <>
      <div className="flex space-x-2"> {/* space-x-2는 두 span 태그 사이의 간격을 주기 위해 사용됩니다. */}
  <span className='cursor-pointer bg-gray-100 p-2 rounded-md transition hover:bg-gray-300'>
    <a href={`${BASE_URL}/r/myFeed/${session}`}>
      ({userName}) 최신 글
    </a>
  </span>

  <span className='cursor-pointer bg-gray-100 p-2 rounded-md transition hover:bg-gray-300'>
    <a href={`${BASE_URL}/r/donation/${session}`}>
      ({userName}) 후원 글
    </a>
  </span>
</div>

      </>
  
      {posts.map((post, index) => {
        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.type === 'UP') return acc + 1
          if (vote.type === 'DOWN') return acc - 1
          return acc
        }, 0)

        const currentVote = post.votes.find(
          (vote) => vote.userId === session
        )

        if (index === posts.length - 1) {
          // Add a ref to the last post in the list
          return (
            <li key={post.id} ref={ref}>
              
              <Post
                post={post}
                commentAmt={post.comments.length}
                subredditName={post.subreddit?.name ?? "Unknown"}
                votesAmt={votesAmt}
                currentVote={currentVote}
              />
            </li>
          )
        } else {
          return (
            <Post
              key={post.id}
              post={post}
              commentAmt={post.comments.length}
              subredditName={post.subreddit?.name ?? "Unknown"}
              votesAmt={votesAmt}
              currentVote={currentVote}
            />
          )
        }
      })}

      {isFetchingNextPage && (
        <li className='flex justify-center'>
          <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
        </li>
      )}
    </ul>
  )
}

export default DonationPostFeed
