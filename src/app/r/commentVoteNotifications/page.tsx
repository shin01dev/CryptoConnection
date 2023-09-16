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
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
import { useRef } from 'react';
import React, { useState, useEffect } from 'react';

export default function Home(props: any) {
  type CommentNotificationType = {
    message: string;
    link: string;
    userImage?: string;
    userId: string;
    createdAt: Date; // createdAt 속성 추가
  };
  const [messages, setMessages] = useState<{ message: string, link: string, userImage?: string, userId: string }[]>([]);

  const [loading, setLoading] = useState(true); // 초기 상태는 로딩 중으로 설정
  const [postNotifications, setPostNotifications] = useState<{ message: string, link: string, userImage?: string, userId: string }[]>([]);
  const [commentNotifications, setCommentNotifications] = useState<CommentNotificationType[]>([]);
  


    async function fetchUserVotes() {
        try {
          // 엔드포인트 URL을 적절하게 수정하세요.
          const endpointUrl = '/api/commentNfVote';
      
          const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 필요하다면 추가 인증 헤더를 여기에 추가하세요.
            },
            // 필요하다면 body에 데이터를 추가하여 전송하세요. 
            // 예: body: JSON.stringify({ key: 'value' })
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
      
          // console.log(result);  // { username: "example", postTitle: "example title", subredditName: "example name" }
          return result;
      
        } catch (error) {
          console.error('오류 발생:', error);
          throw error;
        }
      }
   // Main
   useEffect(() => {
    setLoading(true);
  
    fetchUserVotes()
    .then(async (data) => {
        const filteredVotes = data.postsVotes
            .filter((post: any) => post.votes.length > 0)
            .map((post: any) => post.votes)
            .flat(); // This will flatten the nested arrays
  
        const promises = filteredVotes.map(async (vote: any) => {
            try {
                const info = await fetchUserAndPostInfo(vote.userId, vote.postId);
                return {
                    message: `"${vote.user.username}"님이 회원님의 (${decodeURIComponent(info.post.subreddit.name)}) "${info.post.title}" 게시물을 좋아합니다`,
                    link: `/r/${decodeURIComponent(info.post.subreddit.name)}/post/${vote.postId}`,
                    userImage: vote.user.image,
                    userId: vote.userId,
                    createdAt: vote.createdAt
                };
            } catch (error) {
                console.error('사용자와 게시물 정보 요청 중 오류 발생:', error);
                return null; // You can return null or any other placeholder value in case of an error
            }
        });
  
        const newMessages = await Promise.all(promises);
        const filteredNewMessages = newMessages.filter(Boolean); // To remove null values if there are any errors
  
        setPostNotifications(prevNotifications => [...prevNotifications, ...filteredNewMessages]);
        setLoading(false);
    })
    .catch((error) => {
        console.error('투표 정보 요청 중 오류 발생:', error);
    });
  
        
  }, []);
  
  
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
    console.log(result.message); // 서버로부터의 응답 메시지 출력

    // API 호출이 성공한 후 페이지 이동

console.log("실행됨 !")
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


  

  useEffect(() => {
    async function fetchVotesByUser() {
      try {
        const response = await fetch('/api/NfCommentVote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.status === 200) {
          const data = await response.json();
        
        // 메시지 배열 생성
        const fetchedMessages: CommentNotificationType[] = data.votesByOthers.map((vote: {
          userId: any; 
          user: { 
              username: any; 
              image: any;
              createdAt: Date;
          }; 
          comment: { 
              post: { 
                  subreddit: { name: string } 
              }; 
              text: any; 
              postId: any; 
              authorId: any 
          };
          createdAt: Date;
        }) => {
          return {
            userId: vote.userId,
            userImage: vote.user.image,
            link: `/r/${decodeURIComponent(vote.comment.post.subreddit.name)}/post/${vote.comment.postId}`,
            message: `"${vote.user.username}"님이 회원님의 (${decodeURIComponent(vote.comment.post.subreddit.name)}) "${vote.comment.text}" 댓글을 좋아합니다`,
            createdAt: vote.createdAt // createdAt 속성 추가
          };
        });
        
        setCommentNotifications(prevNotifications => [...prevNotifications, ...fetchedMessages]);
      } else {
        const errorData = await response.json();
        console.error('Error fetching votes:', errorData.message);
      }
    } catch (error) {
      console.error('There was an error fetching the data:', error);
    }
  }

  fetchVotesByUser();
  
}, []);















return (
  <div className="bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4 text-center">댓글 좋아요 알림</h2>
      
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
    <p className="mr-2">댓글 좋아요 알림을 불러오는 중...</p>
    <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
  </div>
    ) : commentNotifications.length === 0 ? (
    <p className="text-gray-400 text-center">댓글 좋아요 알림이 없습니다.</p>
  ) : (
    commentNotifications.map((item, index) => (
              <div key={index} className="flex items-center mb-4 p-2 bg-white rounded-lg shadow">
                  <Link href={`/r/myFeed/${item.userId}`}>
                      <img
                          src={item.userImage || "https://via.placeholder.com/40"}
                          alt="Profile"
                          className="w-12 h-12 rounded-full cursor-pointer mr-4"
                      />
                  </Link>
                  <Link href={item.link} className="text-gray-700 hover:text-blue-600 flex-1">
                      <span className="font-semibold">{item.message}</span>
                      <span className="block text-gray-500 text-sm">{new Date(item.createdAt).toLocaleString()}</span> {/* 여기에 생성 날짜와 시간을 표시 */}

                  </Link>
              </div>
          ))
      )}
  </div>
);

          }  