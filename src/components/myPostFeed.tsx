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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { ChevronDown } from 'lucide-react'; // ChevronDown은 아래 화살표 아이콘입니다. 필요에 따라 라이브러리를 수정해주세요.
import { Button, buttonVariants } from '@/components/ui/Button'
import { Home as HomeIcon } from 'lucide-react'


interface PostFeedProps {
  initialPosts: ExtendedPost[]
  subredditName?: string
  session :any
  username : any
  followersCount:any
  followingCount:any
  yourUserId:any
  
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName,session,username, followersCount,followingCount ,yourUserId}) => {
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


  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage() // Load more posts when the last post comes into view
    }
  }, [entry, fetchNextPage])

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts

  return (
    
    <ul className='flex flex-col col-span-2 space-y-6'>




      <div className="my-4 flex justify-center items-center  p-4 rounded-lg space-x-4 sm:justify-start">
        {session !== yourUserId && (
  <Link 
    href={`/r/myFeed/${session}/donate`} 
    className={`${buttonVariants({ className: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:from-purple-500 hover:via-pink-600 hover:to-red-600 transition duration-300 w-32 h-10 rounded flex items-center justify-center text-white' })}`}
  >
    후원하기
    {/* <img src="/favicon.ico" alt="Token Image" className="ml-2 w-5 h-5 cursor-pointer mr-4" /> */}

  </Link>
)}

</div>



      <>
      <div className="flex space-x-2 font-sans">
        
      <a 
    href={`${BASE_URL}/r/myFeed/${session}`} 
    className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-gray-800 font-medium text-sm px-4 py-2 rounded-full transition-transform duration-200 hover:scale-105"
    style={{ fontFamily: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
>
    ({username}) 최신 글
</a>

  <a 
    href={`${BASE_URL}/r/donation/${session}`} 
    className="inline-block bg-white border border-gray-200 text-gray-800 font-medium text-sm px-4 py-2 rounded-full transition-transform duration-200 hover:scale-105"
    style={{ fontFamily: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
  >
    ({username}) 후원 글
  </a>

  <DropdownMenu>
  <DropdownMenuTrigger>
  <div className="cursor-pointer bg-white border rounded-full p-1 ml-2">
  <ChevronDown />
  
</div>

  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {/* 팔로워 수 링크 추가 */}
    <Link href={`/r/follower/${session}`}>
   
        <DropdownMenuItem>
          팔로워 수 : {followersCount}
        </DropdownMenuItem>
      
    </Link>
    
    {/* 팔로잉 수 링크 추가 */}
    <Link href={`/r/following/${session}`}>
      
        <DropdownMenuItem>
          팔로잉 수 : {followingCount}
        </DropdownMenuItem>
      
    </Link>
  </DropdownMenuContent>
</DropdownMenu>

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

export default PostFeed
