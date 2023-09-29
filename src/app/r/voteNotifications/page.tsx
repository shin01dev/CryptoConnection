


'use client'
import CustomFeed from '@/components/homepage/CustomFeed'
import GeneralFeed from '@/components/homepage/GeneralFeed'
import { Button, buttonVariants } from '@/components/ui/Button'
import { getAuthSession } from '@/lib/auth'
import { Home as HomeIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import PostFeed from '@/components/PostFeed'
import { toast } from '@/hooks/use-toast'
import axios, { AxiosError } from 'axios'
import { SubredditSubscriptionValidator } from '@/lib/validators/subreddit'

import { useRef } from 'react';
import React, { useState, useEffect } from 'react';

export default function Home(props: any) {
  type NotificationType = {
    [x: string]: any
    message: string;
    link: string;
    userImage?: string;
    userId: string;
    createdAt: Date;
  };
  
  const [messages, setMessages] = useState<{ message: string, link: string, userImage?: string, userId: string }[]>([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
    const [postNotifications, setPostNotifications] = useState<NotificationType[]>([]);
const [commentNotifications, setCommentNotifications] = useState<NotificationType[]>([]);
const [notifications, setNotifications] = useState<NotificationType[]>([]);


const [loadingMore, setLoadingMore] = useState(false); // 추가 데이터를 로딩 중인지 여부
const [hasMoreData, setHasMoreData] = useState(true); // 더 많은 데이터가 있는지 여부

async function updateVoteNotificationStatus() {
  try {
    const response = await fetch('/api/NfUnVotes', {
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
    updateVoteNotificationStatus();
  }, 100); // Delay of 1 second

  return () => clearTimeout(timer); // Cleanup on unmount
}, []);






async function fetchUserVotes() {
  try {
    const response = await fetch(`/api/NfVote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.postsVotes.length === 0) setHasMore(false); // 수정된 부분

    return result;
  } catch (error) {
    console.error('오류 발생:', error);
    throw error;
  }
}


    
      async function fetchUserAndPostInfo(userId: any, postId: any) {
        try {
          const response = await fetch('/api/getUserAndPostInfo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              postId,
            }),
          });
      
          if (!response.ok) {
            throw new Error(`서버 오류: ${response.statusText}`);
          }
      
          const result = await response.json();
      
          return result;
      
        } catch (error) {
          console.error('오류 발생:', error);
          throw error;
        }
      }

      useEffect(() => {
        console.log(" 실행 2")
        setLoading(true);
      
        fetchUserVotes()
          .then(async (data) => {
            if (data && data.postsVotes.length > 0) {
              const promises = data.postsVotes.map(async (vote: any) => {
                try {
                  const info = await fetchUserAndPostInfo(vote.userId, vote.postId);
                  return {
                    message: `"${info.user.username}"님이 회원님의 (${decodeURIComponent(info.post.subreddit.name)})"${info.post.title}" 게시물을 좋아합니다`,
                    link: `/r/${decodeURIComponent(info.post.subreddit.name)}/post/${vote.postId}`,
                    userImage: vote.user.image,
                    userId: vote.userId,
                    createdAt: vote.createdAt
                  };
                } catch (error) {
                  console.error('사용자와 게시물 정보 요청 중 오류 발생:', error);
                  return null; // In case of an error
                }
              });
      
              const newMessages = await Promise.all(promises);
              const filteredNewMessages = newMessages.filter(Boolean);
              
              setPostNotifications(prevNotifications => [...prevNotifications, ...filteredNewMessages]);
            }
          })
          .catch((error) => {
            console.error('투표 정보 요청 중 오류 발생:', error);
          })
          .finally(() => {
            setLoading(false); // 모든 경우에 로딩 상태를 해제
          });
      }, []);
      





      const sortedPostNotifications = [...postNotifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    




      return (
        <div className="bg-gray-100 p-4">
            <h2 className="text-xl font-bold mb-4 text-center">게시물 좋아요 알림</h2>
      
            {/* 링크들 */}
            <div className="mb-5 flex justify-center space-x-4">
                <Link href="/r/voteNotifications" className="text-blue-500 hover:underline cursor-pointer">
                    게시물 좋아요
                </Link>
                <Link href="/r/commentVoteNotifications" className="text-blue-500 hover:underline cursor-pointer">
                    댓글 좋아요
                </Link>
            </div>
      
            {
            loading ? (
              <div className="flex items-center justify-center text-gray-600">
                <p className="mr-2">게시물 좋아요 알림을 불러오는 중...</p>
                <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
              </div>
            ) : sortedPostNotifications.length === 0 ? (
              <p className="text-gray-400 text-center">게시물 좋아요 알림이 없습니다.</p>
            ) : (
              sortedPostNotifications.map((notification, idx) => (
                <div key={idx} className="flex items-center mb-4 p-2 bg-white rounded-lg shadow">
                    <Link href={`/r/myFeed/${notification.userId}`}>
              
                            <img
                                src={notification.userImage || "https://via.placeholder.com/40"}
                                alt="User"
                                className="w-12 h-12 rounded-full cursor-pointer mr-4"
                            />
                        
                    </Link>
                    <div className="text-gray-700 hover:text-blue-600 flex-1">
                        <Link href={notification.link}>
                      
                                <p className="font-semibold">{notification.message}</p>
                           
                        </Link>
                        <span className="block text-gray-500 text-sm">{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            ))
            
              )}
        </div>
      );
      
  
}

    
