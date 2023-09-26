'use client'
import { formatTimeToNow } from '@/lib/utils';
import { Post, User, Vote } from '@prisma/client';
import { MessageSquare, Settings, Menu, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { FC, useRef } from 'react';
import EditorOutput from './EditorOutput';
import PostVoteClient from './post-vote/PostVoteClient';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import axios from 'axios';
import { useLayoutEffect } from 'react';

type PartialVote = Pick<Vote, 'type'>;

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];

  };
  votesAmt: number;
  subredditName: string;
  currentVote?: PartialVote;
  commentAmt: number;
}
const deletePost = async (postId: string) => {
  return fetch(`/api/subreddit/post/delete/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postId }), // postId를 요청 바디에 포함
  });
};


const SubredditPost: FC<PostProps> = ({
  post,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
  subredditName,
  commentAmt,
}) => {
  const pRef = useRef<HTMLParagraphElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { data: session } = useSession(); // 사용자 세션 가져오기

  const [lastSegment, setLastSegment] = useState<string | null>("");
  const [donateCoins, setDonateCoins] = useState<number | null>(null);
  const isWindow = typeof window !== 'undefined';

  const [isDesktop, setIsDesktop] = useState(false);
//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__//__

const saveScrollPosition = (url: any) => {
  sessionStorage.setItem(`y_${url}`, String(window.pageYOffset));
}
const saveCurrentPath = () => {
  sessionStorage.setItem('previousPath', window.location.pathname);
}




useEffect(() => {
  const handleResize = () => {
    setIsDesktop(window.innerWidth > 768);
  };
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
  

  const truncateTitle = (title: string) => {
    const maxLength = isDesktop ? 30 : 16;

    return title.length > maxLength ? `${title.substring(0, maxLength)} ..` : title;
  };

  
  async function fetchDonateCoins(postId: string) {
    try {
      const response = await axios.get('/api/coinOnFeed', {
        params: {
          postId
        }
      });
      if (response.status === 200) {
        setDonateCoins(response.data);
      } else {
        console.error("데이터 가져오기 오류:", response.statusText);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios 데이터 가져오기 오류:", error.message);
      } else {
        console.error("알 수 없는 오류:", error);
      }
      return null;
    }
  }
  

  useEffect(() => {
    if (typeof window !== 'undefined') { 
      const currentLastSegment = window.location.href.split('/').pop() || null;
      setLastSegment(currentLastSegment);

    }
  }, []);

// Only listen to changes in post.id for fetching coins
useEffect(() => {
  if (typeof window !== 'undefined') {
    const currentLastSegment = window.location.href.split('/').pop() || null;
    setLastSegment(currentLastSegment);
  }
  if (post.id) {
    fetchDonateCoins(post.id);
  }
}, [post.id]);










  const handleDeletePost = async (postId: any) => {
    try {
      await deletePost(postId);
      // handle post deletion, e.g. remove the post from the list
      window.location.reload(); // 페이지 새로고침

    } catch (error) {
      console.error('Could not delete the post:', error);
    }
  };
  const isAuthor = post.author.id === session?.user?.id; // 작성자와 사용자의 일치 여부 확인





  useEffect(() => {
   setIsClient(true);
 }, []);
 
//  if (!isClient) {
//    return null; // or render a placeholder/loading indicator
//  }

  





















return (
<div className="shadow-lg sm:w-4/6 border-1  border-gray-100 bg-white overflow-hidden my-0 sm:ml-10 border-t border-b border-gray-200">
    <div className="flex justify-between items-center text-sm p-1 ml-1">
      {/* Left Container for Title, Author Info, Voting, etc. */}
      <div className="flex-grow flex pr-1">
        <div className="flex-grow pr-1">
          {/* Post Title and Donation */}
          <div className="flex items-center justify-between space-x-0.5 mt-0 ">

          <Link href={`/r/${subredditName}/post/${post.id}`}>
  <span className="flex-grow text-base cursor-pointer hover:underline" style={{ color: '#3262C5', fontSize: '17px' }}>
    <h1 className="font-bold truncate inline">
      {truncateTitle(post.title)}
      <span className="ml-2" style={{ color: '#3262C5' }}>[{commentAmt}]</span>
    </h1>
  </span>
</Link>

          </div>

          {/* Author, Date, and Subreddit Name (For Mobile) */}
          <div className="flex space-x-1 items-center text-xxxxs text-gray-500 md:hidden flex-nowrap mt-0">
            {subredditName && (
              <Link href={`/r/${subredditName}`}>
                <span className="cursor-pointer hover:underline">[{decodeURIComponent(subredditName)}]</span>
              </Link>
            )}
            <span className="px-0">
              {donateCoins && donateCoins >= 1 ? (
                <>
                  <span>· </span>
                  <img src="/favicon.ico" alt="Description of Image" className="inline" style={{ width: '1em', height: 'auto' }} />
                  <span> · </span>
                  {donateCoins}
                </>
              ) : null}
            </span>
          </div>

          {/* Author, Date, and Subreddit Name (For Desktop) */}
          <div className="flex space-x-1 items-center text-xxxxs text-gray-500 hidden md:flex mt-0">
            {subredditName && (
              <span className="cursor-pointer hover:underline">
                <Link href={`/r/${subredditName}`}>
                  <span>
                    [{decodeURIComponent(subredditName)}]
                    <span className="px-0 ml-0">
                      {donateCoins && donateCoins >= 1 ? (
                        <>
                          <span> · </span>
                          <img src="/favicon.ico" alt="Description of Image" className="inline" style={{ width: '1em', height: 'auto', display: 'inline-block' }} />
                          <span> · </span>
                          {donateCoins}
                        </>
                      ) : null}
                      
                    </span>
                    
                  </span>
                  
                </Link>
                
              </span>
              
            )}
            
          </div>

          {/* Voting */}
          <span className="flex items-center text-gray-600">
            <PostVoteClient postId={post.id} initialVotesAmt={_votesAmt} initialVote={_currentVote?.type} />
            <a href={`/r/myFeed/${post.author.id}`}>
              <span className="cursor-pointer hover:underline">
                / {post.author.username}
                <span> · </span>
                <span className="truncate">{formatTimeToNow(new Date(post.createdAt))}</span>
                
              </span>
              
            </a>
            
                {/* Post Actions Dropdown (For Authors) */}
      {isAuthor && (
        <div className="ml-1 mr-10 mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href={`/r/${subredditName}/edit/${post.id}`}>
                  <span className="cursor-pointer hover:underline">Edit Post</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <button onClick={() => { sessionStorage.setItem("y", String(window.pageYOffset)); handleDeletePost(post.id); }}>Delete Post</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
          </span>
        </div>
        
        {post.thumbnail && (
  <Link href={`/r/${subredditName}/post/${post.id}`}>
    <img
      src={post?.thumbnail}
      alt={`Thumbnail`}
      className="w-20 h-20 object-cover ml-0 mt-0 mr-0 border-2 border-gray-300 rounded-lg shadow-md"
      // 테두리 둥글게, 그림자 추가
      onClick={() => {
        saveCurrentPath();
        saveScrollPosition(window.location.pathname);
      }}
    />
  </Link>
)}


      </div> 

  
    </div>
  </div>
);

};

export default SubredditPost;
