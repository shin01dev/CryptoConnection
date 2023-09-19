'use client'
import CustomFeed from '@/components/homepage/CustomFeed';
import GeneralFeed from '@/components/homepage/GeneralFeed';
import { Button, buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { Home as HomeIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import PostFeed from '@/components/PostFeed';
import { toast } from '@/hooks/use-toast';
import axios, { AxiosError } from 'axios';
import { SubredditSubscriptionValidator } from '@/lib/validators/subreddit';
import React, { useState, useEffect } from 'react';

export default function Home(props: any) {
    const [userFollows, setUserFollows] = useState<string[]>([]);
    const [followerUsernames, setFollowerUsernames] = useState<string[]>([]);
    const [followingUsernames, setFollowingUsernames] = useState<string[]>([]);
    const [followerImages, setFollowerImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [followingId, setfollowingId] = useState<string[]>([]);
    const [followerId, setfollowerId] = useState<string[]>([]);
    const [followCreationDates, setFollowCreationDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true); // 새로운 상태 변수 추가


 

async function fetchUserFollows(skipValue: number) {
  try {
    const response = await fetch('/api/NfFollow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ skip: skipValue }), // skip 값을 포함하여 body에 추가
    });

      
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || '서버 오류가 발생했습니다.');
          }
      
          const result = await response.json();
          return result.follows;
      
        } catch (error) {
          console.error('Error fetching user follows:', error);
          setError((error as Error).message);
          throw error;
        }
    }
    useEffect(() => {
      async function fetchData() {
        try {
          const follows = await fetchUserFollows(10);
          
          const mappedFollows = follows.map((follow: any) => ({
              followerUsername: follow.follower.username,
              followingUsername: follow.following.username,
              followerImage: follow.follower.image,
              followingId: follow.following.id,
              followerId: follow.follower.id,
              followCreationDate: new Date(follow.createdAt).toLocaleString()
          }));
  
         
          setFollowCreationDates(mappedFollows.map((f: { followCreationDate: any; }) => f.followCreationDate));
          setFollowerUsernames(mappedFollows.map((f: { followerUsername: any; }) => f.followerUsername));
          setFollowingUsernames(mappedFollows.map((f: { followingUsername: any; }) => f.followingUsername));
          setFollowerImages(mappedFollows.map((f: { followerImage: any; }) => f.followerImage));
          setUserFollows(follows);
          setfollowingId(mappedFollows.map((f: { followingId: any; }) => f.followingId));
          setfollowerId(mappedFollows.map((f: { followerId: any; }) => f.followerId));
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to fetch user follows:', error);
          setIsLoading(false); // 오류가 발생한 경우에도 로딩 상태를 false로 설정
        }
      }
  
      fetchData();
  }, []);
  async function updateFollowNotificationsStatus() {
    
    try {
      const response = await fetch('/api/NfFollowUnCount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong!');
      }
  
      const result = await response.json();
  
      // API 호출이 성공한 후 페이지 이동
      // window.location.href = '/r/followNotifications';

    } catch (error) {
      if (error instanceof Error) { // 타입 가드
        console.error("Error updating follow notifications status:", error.message);
      } else {
        console.error("Unknown error occurred.");
      }
    }

}
useEffect(() => {
  const timer = setTimeout(() => {
    updateFollowNotificationsStatus();
  }, 100); // Delay of 1 second

  return () => clearTimeout(timer); // Cleanup on unmount
}, []);


return (
  <div className="bg-gray-100 p-4">
    <h2 className="text-xl font-bold mb-4 text-center">팔로우 알림</h2>
    {error && <p className="mb-4 text-red-500">Error: {error}</p>}
    
    {isLoading ? (
       <div className="flex items-center justify-center text-gray-600">
       <p className="mr-2">팔로우 알림을 불러오는 중...</p>
       <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
     </div>
     
         
               
            ) : error ? (
                <p className="mb-4 text-red-500">Error: {error}</p>
            ) : followerUsernames.length > 0 ? (
                followerUsernames.map((follower, idx) => (
        <div key={idx} className="flex items-center mb-4 p-2 bg-white rounded-lg shadow">
          <Link href={`/r/myFeed/${followerId[idx]}`}>
            <div className="w-12 h-12 rounded-full cursor-pointer overflow-hidden">
              <img 
                src={followerImages[idx] || ''} 
                alt={follower} 
                className="w-12 h-12 rounded-full cursor-pointer mr-4"
              />
            </div>
          </Link>
          <p className="ml-4">
            <Link href={`/r/myFeed/${followerId[idx]}`}>
              <span className="text-blue-500 hover:underline cursor-pointer">
                {follower}
              </span>
            </Link>
            님이{' '}
            <Link href={`/r/myFeed/${followingId[idx]}`}>
              <span className="text-blue-500 hover:underline cursor-pointer">
                {followingUsernames[idx] || ''}
              </span>
            </Link>
            님을 팔로우 합니다 - <span className="text-gray-500">{followCreationDates[idx]}</span>
          </p>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-600">팔로우 알림이 없습니다.</p>
    )}
  </div>
);

    
            }    