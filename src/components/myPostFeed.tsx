'use client'
import { BASE_URL } from './BASE_URL'

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
import Link from 'next/link'
interface PostFeedProps {
  initialPosts: ExtendedPost[]
  subredditName?: string
  session :any
  
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName,session }) => {
  const lastPostRef = useRef<HTMLElement>(null)
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 0.1,
  })
  const [currentURL, setCurrentURL] = useState('');
    const decodedSubredditName = decodeURIComponent(subredditName || '');
  
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['infinite-query'],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/myFeedPosts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}&session=${session}` +
        (!!subredditName ? `&subredditName=${subredditName}` : '')

      const { data } = await axios.get(query)
      return data as ExtendedPost[]
    },

    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터는 '신선'하게 유지됩니다.
   cacheTime: 1000 * 60 * 30, // 30분 동안 데이터는 메모리에 캐싱됩니다.
   
   refetchOnWindowFocus: true, // 사용자가 창에 포커스될 때 데이터를 새로 가져오지 않도록 설정합니다.
      }
  )

  useEffect(() => {
    setCurrentURL(window.location.href);

    const currentURL = window.location.href;
 

    
  }, []);

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
  
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage() // Load more posts when the last post comes into view
    }
  }, [entry, fetchNextPage])

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts
  const [userName, setUsername] = useState<string | null>(null); // username 상태 변수를 추가

  return (
    <ul className='flex flex-col col-span-2 space-y-6'>
      {((currentURL === `${BASE_URL}/r/myFeed/${session}` || currentURL === `${BASE_URL}/r/donation/${session}`) ? null : 'my_커뮤니티') && (
  <div className='flex gap-2'>
    <span className='cursor-pointer bg-f2f2f2 p-2 rounded-md transition hover:bg-gray-300'>
      {currentURL === `${BASE_URL}/r/popular` ? (
    <a href={BASE_URL}>
   
      <span className="text-sm font-bold text-gray-700 hover:text-gray-900">
        커뮤니티 글
      </span>
  
  </a>
  
      ) : (
<a href={(currentURL === `${BASE_URL}/r/popular` || currentURL === `${BASE_URL}/`) ? BASE_URL : 
        (currentURL.includes(`${BASE_URL}/r/${decodedSubredditName}/popular`)) ? `/r/${decodedSubredditName}` : `/r/${decodedSubredditName}`}>
  <span className="text-sm font-bold text-gray-700 hover:text-gray-900">
    {(currentURL === `${BASE_URL}/r/popular` || currentURL === `${BASE_URL}/`) ? '커뮤니티 글' : `최신 글`}
  </span>
</a>


      )}
      
    </span>
  <span className='cursor-pointer bg-f2f2f2 p-2 rounded-md transition hover:bg-gray-300'>
  <a href={(currentURL === `${BASE_URL}/r/popular` || currentURL === `${BASE_URL}/`) ? BASE_URL : 
        (currentURL.includes(`${BASE_URL}/r/${decodedSubredditName}/popular`)) ? `/r/${decodedSubredditName}` : `/r/${decodedSubredditName}`}>
  <span className="text-sm font-bold text-gray-700 hover:text-gray-900">
    {(currentURL === `${BASE_URL}/r/popular` || currentURL === `${BASE_URL}/`) ? '인기 글' : `인기 글`}
  </span>
</a>
  </span>
</div>

)}

{(currentURL === `${BASE_URL}/r/myFeed/${session}` || currentURL === `${BASE_URL}/r/donation/${session}`) && (
  // Your JSX content here

      <>
<div className="flex space-x-2"> {/* space-x-2는 두 span 태그 사이의 간격을 주기 위해 사용됩니다. */}
<span className="cursor-pointer text-sm font-bold text-gray-700 hover:text-gray-900 bg-blue-200 p-2 rounded-md transition hover:bg-gray-300">
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
    )}
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

export default PostFeed
