'use client'
import { BASE_URL } from './BASE_URL'

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { ExtendedPost } from '@/types/db'
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { FC, useEffect, useRef } from 'react'
import Post from './Post'
import { useSession } from 'next-auth/react'
import { useState } from 'react';
import Link from 'next/link';
import { useLayoutEffect } from 'react';
import PopularPost from './popularPost'


interface PostFeedProps {
  initialPosts: ExtendedPost[]
  subredditName?: string
  session :any
  
}

const SubPostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName,session }) => {
    let [posts, setPosts] = useState<ExtendedPost[]>(initialPosts);
    const [currentURL, setCurrentURL] = useState('');
    const decodedSubredditName = decodeURIComponent(subredditName || '');
  
  const lastPostRef = useRef<HTMLElement>(null)
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 0.1,
  })
  const queryClient = useQueryClient();

  const [isClient, setIsClient] = useState(false);



  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['infinite-query'],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/popularPosts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}&session=${session}` +
        (!!subredditName ? `&subredditName=${subredditName}` : '')

      const { data } = await axios.get(query)
      return data as ExtendedPost[]
    },

    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
   // 캐싱 설정 추가
   staleTime: 1000 * 60 * 5, // 5분 동안 데이터는 '신선'하게 유지됩니다.
   cacheTime: 1000 * 60 * 30, // 30분 동안 데이터는 메모리에 캐싱됩니다.
   
   refetchOnWindowFocus: false, // 사용자가 창에 포커스될 때 데이터를 새로 가져오지 않도록 설정합니다.
 }
      
    
  )

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage() // Load more posts when the last post comes into view
    }
  }, [entry, fetchNextPage])

   posts = data?.pages.flatMap((page) => page) || [];

  

  




 
  //  useEffect(() => {
  //   setIsClient(true);
  // }, []);
  
  // if (!isClient) {
  //   return null; // or render a placeholder/loading indicator
  // }


  return (
    <ul className='flex flex-col col-span-2 space-y-0'>
      <div className='flex gap-2 mr-1 sm:ml-20 border border-gray-800 rounded-md sm:w-4/5 bg-purple-500 text-white mb-2'>
        {/* "최신 글" 섹션 */}
        <span className='cursor-pointer p-2 rounded-md transition hover:bg-purple-400 rounded-lg'>
          <a href={BASE_URL}>
            <span className="text-sm font-bold text-white hover:text-gray-200">
              최신 글
            </span>
          </a>
        </span>
  
        {/* "인기 글" 섹션 */}
        <span className='cursor-pointer p-2 rounded-md transition bg-purple-600 hover:bg-purple-400 '>
  <a href={(currentURL === `${BASE_URL}/r/popular`) ? `${BASE_URL}/r/popular` : `/r/${decodedSubredditName}/popular`} onClick={() => sessionStorage.setItem(window.location.pathname, String(window.pageYOffset))}>
    <span className="text-sm font-bold text-white hover:text-gray-200 ">
      인기 글
    </span>
  </a>
</span>

  
        {/* "커뮤니티 글" 섹션 */}
        <span className='cursor-pointer p-2 rounded-md transition hover:bg-purple-400'>
          <a href={`${BASE_URL}/r/community`}>
            <span className="text-sm font-bold text-white hover:text-gray-200">
              커뮤니티 글
            </span>
          </a>
        </span>
      </div>
  

{posts.length === 0 ? (
  <li className="flex items-center justify-center text-gray-600 min-h-[70vh] mt-[-10vh]">
  인기 게시물이 되어 토큰을 지급 받으세요 !
      </li>
    ) : (
      posts.map((post, index) => {
        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.type === 'UP') return acc + 1
          if (vote.type === 'DOWN') return acc - 1
          return acc
        }, 0)

        const currentVote = post.votes.find((vote) => vote.userId === session)

        if (index === posts.length - 1) {
          return (
            <li key={`${post.id}-${index}`} ref={ref}>
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
              key={`${post.id}-${index}`}
              post={post}
              commentAmt={post.comments.length}
              subredditName={post.subreddit?.name ?? "Unknown"}
              votesAmt={votesAmt}
              currentVote={currentVote}
            />
          )
        }
      })
    )}

    {isFetchingNextPage && (
      <li className='flex justify-center'>
        <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
      </li>
    )}
  </ul>
  )
}

export default SubPostFeed
