'use client'
import { BASE_URL } from './BASE_URL'

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { ExtendedPost } from '@/types/db'
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { FC, useEffect, useRef, useState } from 'react'
import Post from './Post'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Router from 'next/router';
interface PostFeedProps {
  initialPosts: ExtendedPost[]
  subredditName?: string
  session :any
  
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName,session }) => {
  const lastPostRef = useRef<HTMLElement>(null)



  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  })
  const [currentURL, setCurrentURL] = useState('');
  const decodedSubredditName = decodeURIComponent(subredditName || '');

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['infinite-query'],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subredditName ? `&subredditName=${subredditName}` : '')

      const { data } = await axios.get(query)
      return data as ExtendedPost[]
    },

    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
      cacheTime: 600000,
      refetchOnWindowFocus: true,
      staleTime: 300000,    }
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
        <Link href={(currentURL === `${BASE_URL}/r/popular` || currentURL === `${BASE_URL}/`) ? BASE_URL : `/r/${decodedSubredditName}`}>
          <span className="text-sm font-bold text-gray-700 hover:text-gray-900">
            {(currentURL === `${BASE_URL}/r/popular` || currentURL === `${BASE_URL}/`) ? '커뮤니티 글' : `최신 글`}
          </span>
        </Link>
      )}
    </span>
  <span className='cursor-pointer bg-f2f2f2 p-2 rounded-md transition hover:bg-gray-300'>
    <Link href={(currentURL === `${BASE_URL}/r/popular`) ? `${BASE_URL}/r/popular` : `/r/${decodedSubredditName}/popular`}>
      <span className="text-sm font-bold text-gray-700 hover:text-gray-900">
        {(currentURL === `${BASE_URL}/r/popular` || currentURL === `${BASE_URL}/`) ? '인기 글' : `인기 글`}
      </span>
    </Link>
  </span>
</div>
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
