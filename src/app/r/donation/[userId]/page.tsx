'use client'
import CustomFeed from '@/components/homepage/CustomFeed'
import GeneralFeed from '@/components/homepage/GeneralFeed'
import { Button, buttonVariants } from '@/components/ui/Button'
import { getAuthSession } from '@/lib/auth'
import { Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import DonationPostFeed from '@/components/donationPostFeed'
import { toast } from '@/hooks/use-toast'
import axios, { AxiosError } from 'axios'
import { SubredditSubscriptionValidator } from '@/lib/validators/subreddit'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
import { useRef } from 'react';
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react'; // ChevronDown은 아래 화살표 아이콘입니다. 필요에 따라 라이브러리를 수정해주세요.

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/DropdownMenu';
  
  
export default function Home(props: any) {
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState([]);
  const [postFeed, setPostFeed] = useState<React.ReactNode | null>(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followCounts, setFollowCounts] = useState({ followersCount: 0, followingsCount: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch User ID
        const userResponse = await axios.get('/api/userId_myFeed/');
        
        if (userResponse.status === 200) {
          const userData = userResponse.data;  // userData로 이름 변경
          if (userData && userData.userId) {
            console.log("User ID:", userData.userId);
            setUserId(userData.userId);
          } else {
            console.log("User ID not found in the response.");
            return;  // If no userId found, no need to fetch posts.
          }
        } else {
          throw new Error('Network response for user ID was not ok');
        }

        // 2. Fetch Posts
        if (props.params.userId) {
          const postResponse = await axios.post('/api/getPostsDonation/', {
            userId: props.params.userId,
          });
          setPosts(postResponse.data);
          console.log(props.params.userId+"QQQQQ")
          console.log(userResponse.data.userId+"TTTTTT")

          setPostFeed(<DonationPostFeed initialPosts={postResponse.data} session={props.params.userId} />);
        }

      } catch (error) {
        console.error("There was a problem fetching data:", error);
      } finally {
        setLoading(false); // Update loading state after fetching
      }
    }

    fetchData();
}, []);






useEffect(() => {
  async function checkFollowStatus() {
    try {
      console.log(props.params.userId+"ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ")

      const response = await axios.post(`/api/checkFollowingStatus`, {
        targetUserId: props.params.userId
        , 
    
      });
      
      if (response.status === 200 && response.data.isFollowing) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  }

  checkFollowStatus();
}, [isFollowing]);


async function handleFollow() {
  try {
    const endpoint = isFollowing ? '/api/notFollowing' : '/api/following'; // API endpoint 변경

    const response = await axios.post(endpoint, {
      userId: props.params.userId
    });

    if (response.status === 200) {
      setIsFollowing(!isFollowing); // API의 응답을 바탕으로 상태 변경
      console.log(response.data.isFollowing+"QWEQWEQWEQWEQWEQWEZZZZZZZ")
      toast({
        title: "Success",
        description: response.data.message, // API의 응답 메시지를 사용
      });
    } else {
      toast({
        title: "Error",
        description: response.data.message, // API의 응답 메시지를 사용
        variant: "destructive"
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: "작업 중 문제가 발생했습니다. 다시 시도해 주세요.",
      variant: "destructive"
    });
  }
}




return (
  <>
    {loading ? (
      <div className="flex justify-center items-center h-screen ">
        로딩 중...
      </div>
    ) : (
      <>
        <div className="my-4 flex justify-center items-center  p-4 rounded-lg space-x-4 ">
        {props.params.userId !== userId && (
  <Link 
    href={`/r/myFeed/${props.params.userId}/donate`} 
    className={`${buttonVariants({ className: ' bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:from-purple-500 hover:via-pink-600 hover:to-red-600 transition duration-300 w-32 h-10 rounded flex items-center justify-center text-white' })}`}
  >
    후원하기
    {/* <img src="/favicon.ico" alt="Token Image" className="ml-2 w-5 h-5 cursor-pointer mr-4" /> */}

  </Link>
)}

{/* 현재 사용자의 아이디와 페이지의 아이디가 다를 경우에만 팔로잉/팔로우 버튼이 보이도록 조건문 추가 */}
{props.params.userId !== userId && (
  <Button onClick={handleFollow}>
      <p className={buttonVariants({ className: '' })}>
        {isFollowing ? "팔로잉" : "팔로우"}
      </p>
    </Button>
)}


{/* DropdownMenu 시작 */}
<DropdownMenu>
  <DropdownMenuTrigger>
    {props.params.userId !== userId && (
      <div className="cursor-pointer"><ChevronDown></ChevronDown></div>
    )}
</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link 
                  href={`/r/follower/${props.params.userId}`} 
                  className="flex items-center justify-center hover:bg-gray-700 transition duration-300 w-32 h-10 bg-black text-white rounded"
                >
                  팔로워 수: {followCounts.followersCount}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link 
                  href={`/r/following/${props.params.userId}`} 
                  className="flex items-center justify-center hover:bg-gray-700 transition duration-300 w-32 h-10 bg-black text-white rounded"
                >
                  팔로잉 수: {followCounts.followingsCount}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
</DropdownMenu>

          {/* DropdownMenu 끝 */}
              {/* 팔로워 및 팔로잉 수 표시 추가 */}


              {props.params.userId == userId && (
  <div className="flex justify-center items-center p-4 rounded-lg">
    <div className="flex space-x-4 mr-5">
      <Link 
        href={`/r/follower/${props.params.userId}`} 
        className="flex items-center justify-center hover:bg-gray-700 transition duration-300 w-32 h-10 bg-black text-white rounded "
      >
        팔로워 수: {followCounts.followersCount}
      </Link>
      <Link 
        href={`/r/following/${props.params.userId}`} 
        className="flex items-center justify-center hover:bg-gray-700 transition duration-300 w-32 h-10 bg-black text-white rounded"
      >
        팔로잉 수: {followCounts.followingsCount}
      </Link>
    </div>
  </div>
)}





  
        </div>
      
        <div className='flex items-center justify-between mb-6'>
          <h1 className='font-bold text-3xl md:text-4xl mb-4 sm:ml-60 ml-3'>후원 게시물</h1>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-y-6 md:gap-x-6 mx-auto sm:ml-60 mr-2 ml-1' style={{maxWidth: '1200px'}}>
          {postFeed}
      <div className='overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last hidden md:block'>
  <div className='bg-emerald-100 px-6 py-4'>
    <p className='font-semibold py-3 flex items-center gap-1.5'>
      <HomeIcon className='h-4 w-4' />
      홈
    </p>
  </div>
  <dl className='-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6'>
    <div className='flex justify-between gap-x-4 py-3'>
      <p className='text-zinc-500'>
        개인 커뮤니티를 생성하여, 다른 사람과 함께 공유해 보세요!
      </p>
    </div>
    <Link
      className={buttonVariants({ className: 'w-full mt-4 mb-6' })}
      href={`/r/create`}>
      커뮤니티 생성
    </Link>
  </dl>
</div>

        </div>
        
      </>
    )}
  </>
);




}
