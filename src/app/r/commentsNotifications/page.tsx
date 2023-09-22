'use client'
import CustomFeed from '@/components/homepage/CustomFeed';
import GeneralFeed from '@/components/homepage/GeneralFeed';
import { Button, buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { Home as HomeIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import PostFeed from '@/components/PostFeed';
import { toast } from '@/hooks/use-toast';
import axios, { AxiosError } from 'axios';
import { SubredditSubscriptionValidator } from '@/lib/validators/subreddit';
import React, { useState, useEffect } from 'react';

async function fetchUserDetails(userId: string, postId: string) {
    try {
      const endpointUrl = '/api/getUserAndCommentsInfo'; // 해당 엔드포인트의 실제 경로로 변경
  
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId,postId }) 
      });
  
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.statusText}`);
      }
  
      const result = await response.json();
  
      return result;
  
    } catch (error) {
      console.error('사용자 정보를 불러오는 도중 오류가 발생했습니다:', error);
      throw error;
    }
  }

  
type CommentType = {
    text: string;
    createdAt: string;
    [key: string]: any; // 기타 속성들
};
function formatDate(isoDateString: string) {
    const date = new Date(isoDateString);
    const now = new Date();
  
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    if (diffInSeconds < 60) return `${diffInSeconds}초 전`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  }
  
async function fetchUserComments() {
    try {
        const endpointUrl = '/api/NfComments';

        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
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
export default function Home(props: any) {
    
    const [userComments, setUserComments] = useState<CommentType[]>([]);
    const [userDetails, setUserDetails] = useState<any>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);  // <- Introduce this loading state
    const [notificationCount, setNotificationCount] = useState<number>(0); // <- 이 상태 추가
    const [deleting, setDeleting] = useState<boolean>(false);

  async function deleteCommentNotification() {
    // event.preventDefault(); // Link의 기본 동작을 중지합니다.
  
    try {
      const response = await fetch('/api/deleteCommentNf', {
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
        deleteCommentNotification();
    }, 100); // Delay of 1 second
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);
  
  
    useEffect(() => {
        fetchUserComments()
            .then((data) => {
                const sortedComments = data.comments.sort((a: CommentType, b: CommentType) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                // notification이 "on"으로 설정된 댓글 개수 세기
                const count = sortedComments.filter((comment: CommentType) => comment.notification === 'on').length;
    
                setNotificationCount(count); // 상태에 개수 설정
    
                setUserComments(sortedComments);
    
                // 모든 댓글 작성자의 상세 정보를 가져옵니다.
                return Promise.all(sortedComments.map((comment: CommentType) => {
                    return fetchUserDetails(comment.authorId, comment.postId)
                        .then(details => {
                            return {
                                authorId: comment.authorId,
                                details: {
                                    ...details.user,
                                    subredditName: details.subredditName
                                }
                            };
                        });
                }));
            })
            .then(detailsArray => {
                const newDetails = detailsArray.reduce((acc, curr) => {
                    acc[curr.authorId] = curr.details;
                    return acc;
                }, {} as Record<string, any>);
    
                setUserDetails((prevDetails: any) => ({
                    ...prevDetails,
                    ...newDetails
                }));
            })
            .catch((error: any) => {
                console.error('댓글을 불러오는 도중 오류가 발생했습니다:', error);
            })
            .finally(() => {
                setIsLoading(false); // Set loading state to false after everything is done
            });
    }, []);
    

    
    return (
        <div className="bg-gray-100 p-4">
            <h2 className="text-xl font-bold mb-4 text-center">댓글 알림</h2>
    
            {isLoading ? (
  <div className="flex items-center justify-center text-gray-600">
  <p className="mr-2">댓글 알림을 불러오는 중...</p>
  <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
</div>        ) : userComments.length > 0 ? (
            <ul>
                    {userComments.map((comment, index) => {
                        let displayMessage;
                        if (comment.replyTo) { 
                            displayMessage = (
                                <>
                                    <Link href={`/r/${decodeURIComponent(userDetails[comment.authorId]?.subredditName)}/post/${comment.postId}`}>
                    <span>&quot;{userDetails[comment.authorId]?.username}&quot;님이 </span>
                ({decodeURIComponent(userDetails[comment.authorId]?.subredditName)})
                &quot;{comment.replyTo.text}&quot;
                    <span> 댓글에 &quot;{comment.text}&quot;라고 답글을 달았습니다</span>
                </Link>
                                </>
                            );
                        } else if (comment.post) { 
                            displayMessage = (
                                <>
                                   <Link href={`/r/${decodeURIComponent(userDetails[comment.authorId]?.subredditName)}/post/${comment.postId}`}>
                    <span>&quot;{userDetails[comment.authorId]?.username}&quot; 님이 회원님의 </span>
                  ({decodeURIComponent(userDetails[comment.authorId]?.subredditName)})
                  &quot;{comment.post.title}&quot;
                    <span> 게시물에 &quot;{comment.text}&quot;라고 답글을 달았습니다</span>
                </Link>
                                </>
                            );
                        } else {
                            displayMessage = (
                                <>
                                    <span>{userDetails[comment.authorId]?.username} ({decodeURIComponent(userDetails[comment.authorId]?.subredditName)}): {comment.text}</span>
                                </>
                            );
                        }
    
                        return (
                            <li key={index} className="bg-white p-3 rounded-md mb-3 flex items-center">
                                <a href={`/r/myFeed/${comment.authorId}`}>
                                    <img
                                        src={userDetails[comment.authorId]?.image}
                                        alt={userDetails[comment.authorId]?.username}
                                        className="w-12 h-12 rounded-full border-2 border-gray-300 mr-4"
                                    />
                                </a>
    
                                <div className="flex-1">
                                    <p className="text-sm">{displayMessage}</p>
                                    <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-center text-gray-600">댓글 알림이 없습니다.</p>
            )}
        </div>
    );
    
      
            }    