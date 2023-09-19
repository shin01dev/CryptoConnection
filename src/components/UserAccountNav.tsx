'use client'
import Link from 'next/link';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { Bell } from 'lucide-react';
import React, { useState } from 'react'; 
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Router from 'next/router';
import { useLocation } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { UserAvatar } from '@/components/UserAvatar';

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<User, 'name' | 'image' | 'email' | 'id'>;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const [commentNotificationCount, setCommentNotificationCount] = useState<number>(0);
  const [followNotificationCount, setFollowNotificationCount] = useState(0);
 const notificationTime= 5000  //5초
 
  // Only use useRouter if on the client

  function handleRouteChange() {
    Router.push('/new-page');
  }
  type CommentType = {
    text: string;
    createdAt: string;
    notification: string;
    // 기타 필요한 속성들이 있다면 여기에 추가
};
async function fetchUserComments(): Promise<any> {
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
useEffect(() => {
  function fetchComments() {
    fetchUserComments()
      .then((data: { comments: any[]; }) => {
        const sortedComments = data.comments.sort((a: CommentType, b: CommentType) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // notification이 "on"으로 설정된 댓글 개수 세기
        const count = sortedComments.filter((comment: CommentType) => comment.notification === 'on').length;

        setCommentNotificationCount(count); // 상태에 개수 설정
      })
      .catch((error: any) => {
        console.error('댓글을 불러오는 도중 오류가 발생했습니다:', error);
      });
  }

  // 처음에 한 번 실행
  fetchComments();

  // 10초마다 fetchComments 함수를 실행
  const intervalId = setInterval(fetchComments, notificationTime);

  // useEffect의 반환 함수에서 setInterval을 정리합니다.
  return () => {
    clearInterval(intervalId);
  };
}, []);




  
  async function deleteUserComments(): Promise<any> {
    try {
        const endpointUrl = '/api/deleteCommentNf';
  
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
  const handleCommentsNotificationClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // 링크의 기본 동작을 방지합니다.
  
    try {
      await deleteUserComments(); // API 호출을 기다립니다.

      // API 호출이 성공한 후 페이지 이동
      window.location.href = '/r/commentsNotifications';
    } catch (error) {
      console.error("Failed to delete user comments:", error);
    }
  };
  





  async function fetchFollowNotifications(): Promise<any> {
    try {
      const response = await fetch('/api/NfFollowCount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong!');

      }
  
      return await response.json();
    } catch (error) {
      if (error instanceof Error) { // 타입 가드
        console.error("Error fetching follow notifications:", error.message);
      } else {
        console.error("Unknown error occurred.");
      }
      throw error;
    }
  }
  
  const [follows, setFollows] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await fetchFollowNotifications();
        if (result && result.follows) {
          setFollowNotificationCount(result.follows.length);
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    // 처음에 한 번 실행
    fetchData();
  
    // 10초마다 fetchData 함수를 실행
    const intervalId = setInterval(fetchData, notificationTime);
  
    // useEffect의 반환 함수에서 setInterval을 정리합니다.
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  useEffect(() => {
  }, [followNotificationCount]);  // `followNotificationCount` 의존성을 추가하여 값이 변경될 때마다 로그를 출력합니다.
  



  async function deleteCommentNotification(event: { preventDefault: () => void; }) {
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
  
      // API 호출이 성공한 후 페이지 이동
      // window.location.href = '/r/commentsNotifications';
  
    } catch (error) {
      if (error instanceof Error) { // 타입 가드
        console.error("Error updating follow notifications status:", error.message);
      } else {
        console.error("Unknown error occurred.");
      }
    }
  }
  


  async function updateFollowNotificationsStatus() {
    
    // try {
    //   const response = await fetch('/api/NfFollowUnCount', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });
  
    //   if (!response.ok) {
    //     const data = await response.json();
    //     throw new Error(data.message || 'Something went wrong!');
    //   }
  
    //   const result = await response.json();
      setFollowNotificationCount(1)
      // API 호출이 성공한 후 페이지 이동
      // window.location.href = '/r/followNotifications';

    // } catch (error) {
    //   if (error instanceof Error) { // 타입 가드
    //     console.error("Error updating follow notifications status:", error.message);
    //   } else {
    //     console.error("Unknown error occurred.");
    //   }
    // }
}









// 좋아요 알림
async function fetchVoteNotifications(): Promise<any> {
  try {
    const response = await fetch('/api/NfVotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Something went wrong!');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) { // 타입 가드
      console.error("Error fetching vote notifications:", error.message);
    } else {
      console.error("Unknown error occurred.");
    }
    throw error;
  }
}

// UserAccountNav 컴포넌트 내부에 추가
const [voteNotificationCount, setVoteNotificationCount] = useState<number>(0);

useEffect(() => {
  async function fetchData() {
    try {
      const result = await fetchVoteNotifications();

      // 서버에서 반환된 notificationsCount 값을 직접 setVoteNotificationCount에 설정합니다.
      setVoteNotificationCount(result.notificationsCount);

    } catch (error) {
      console.error(error);
    }
  }

  const intervalId = setInterval(() => {
    fetchData();
  }, notificationTime); // 10초마다 fetchData와 페이지 이동 로그를 실행

  // 처음에 한 번 실행
  fetchData();

  // useEffect의 반환 함수에서 setInterval을 정리합니다.
  return () => {
    clearInterval(intervalId);
  };
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

    // API 호출이 성공한 후 페이지 이동
    setVoteNotificationCount(0);

    window.location.href = '/r/voteNotifications';

  } catch (error) {
    if (error instanceof Error) { // 타입 가드
      console.error("Error updating follow notifications status:", error.message);
    } else {
      console.error("Unknown error occurred.");
    }
  }
}











const [tokenNotificationCount, setTokenNotificationCount] = useState(0);

useEffect(() => {
  async function fetchData() {
    try {
      const response = await fetch('/api/getTokenNotificationCount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // 필요하다면 body를 통해 데이터를 전송할 수 있습니다.
        // body: JSON.stringify({ key: 'value' }) 
      });
      
      const data = await response.json();
      setTokenNotificationCount(data.notificationOnCount);

    } catch (error) {
      console.error('Error fetching token notifications:', error);
    }
  }

  // 처음에 한 번 실행
  fetchData();

  // 10초마다 fetchData를 실행
  const intervalId = setInterval(fetchData, notificationTime);

  // useEffect의 반환 함수에서 setInterval을 정리합니다.
  return () => {
    clearInterval(intervalId);
  };
}, []);


const updateTokenNotificationStatus = async () => {
  try {
      const response = await fetch('/api/getTokenUnNotifications', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
          // 토큰 알림 숫자를 업데이트하거나 다시 가져올 수 있습니다.
          // setTokenNotificationCount(0); // 예를 들면, 0으로 설정합니다.

          // window.location.href = '/r/TokensNotifications';

      } else {
          console.error('Error updating token notification:', data.message);
      }
  } catch (error) {
      console.error('Error updating token notification:', error);
  }
};



const [sponsorNotificationCount, setSponsorNotificationCount] = useState(0);

useEffect(() => {
  async function fetchData() {
    try {
      const response = await fetch('/api/getDonationNotifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // body: JSON.stringify({ key: 'value' }) // 필요한 데이터를 JSON 형식으로 전송
      });
      
      const data = await response.json();
      setSponsorNotificationCount(data.matchingPostsCount);

    } catch (error) {
      console.error('Error fetching sponsor notifications:', error);
    }
  }

  // 처음에 한 번 실행
  fetchData();

  // 10초마다 fetchData를 실행
  const intervalId = setInterval(fetchData, notificationTime);

  // useEffect의 반환 함수에서 setInterval을 정리합니다.
  return () => {
    clearInterval(intervalId);
  };
}, []);

const updateDonationUnNotificationStatus = async () => {
  try {
      const response = await fetch('/api/getDonationUnNotifications', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
          // 토큰 알림 숫자를 업데이트하거나 다시 가져올 수 있습니다.
          // setSponsorNotificationCount(0); // 예를 들면, 0으로 설정합니다.

          window.location.href = '/r/DonationNotifications';

      } else {
          console.error('Error updating token notification:', data.message);
      }
  } catch (error) {
      console.error('Error updating token notification:', error);
  }
};

const [totalNotificationCount, setTotalNotificationCount] = useState(0);


useEffect(() => {
  const total = followNotificationCount + commentNotificationCount + voteNotificationCount + tokenNotificationCount + sponsorNotificationCount;
  setTotalNotificationCount(total);
}, [followNotificationCount, commentNotificationCount, voteNotificationCount, tokenNotificationCount, sponsorNotificationCount]);



  return (
    <div className="flex space-x-2">
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer relative">
          <Bell size={20} />
          {totalNotificationCount > 0 && 
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">
              {totalNotificationCount}
            </span>
          }
        </div>


      </DropdownMenuTrigger>
      
        <DropdownMenuContent className="bg-white" align="end">


        <DropdownMenuItem asChild>
        {/* Link 컴포넌트 제거 */}
        {/* <Link href="/r/followNotifications"> */}

        {/* <div onClick={updateFollowNotificationsStatus}> */}
        <Link href="/r/followNotifications">

            팔로우 알람 
            {followNotificationCount > 0 && 
            <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">
                {followNotificationCount}
            </span>}
            </Link>
        {/* </div> */}
        {/* </Link>          */}

    </DropdownMenuItem>


          <DropdownMenuItem asChild>
  {/* <Link href="/r/commentsNotifications"> */}
  <Link href="/r/commentsNotifications">

    {/* <div onClick={deleteCommentNotification}> */}
      댓글 알람 
      {commentNotificationCount > 0 && 
      <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">
        {commentNotificationCount}
      </span>}
      </Link>

    {/* </div> */}
  {/* </Link>          */}
</DropdownMenuItem>



<DropdownMenuItem asChild>
  <Link href="/r/voteNotifications">
    {/* <a className="block w-full text-left" onClick={updateVoteNotificationStatus}> */}
      좋아요 알람 
      {voteNotificationCount > 0 && 
      <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">
        {voteNotificationCount}
      </span>}
    {/* </a> */}
  </Link>
</DropdownMenuItem>

<DropdownMenuItem asChild>
    {/* <div onClick={updateTokenNotificationStatus}> */}
    <Link href="/r/TokensNotifications">

        토큰 알람 
        {tokenNotificationCount > 0 && 
        <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">
            {tokenNotificationCount}
        </span>}
        </Link>

    {/* </div> */}
</DropdownMenuItem>



<DropdownMenuItem asChild>
  {/* <Link> 컴포넌트를 삭제합니다. */}
  {/* <div onClick={updateDonationUnNotificationStatus}> */}
  <Link href="/r/DonationNotifications">

    후원 알람 
    {sponsorNotificationCount > 0 && 
    <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">
      {sponsorNotificationCount}
    </span>}
    </Link>

  {/* </div> */}
</DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserAvatar user={{ name: user.name || null, image: user.image || null }} className="h-8 w-8" />
        </DropdownMenuTrigger>


        
        <DropdownMenuContent className="bg-white" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.name && <p className="font-medium">{user.name}</p>}
              {user.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/r/myFeed/${user.id}`}>내 게시물</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
    <Link href={`/r/popular`}>인기 게시물</Link>
</DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/r/wallet/`}>내 지갑</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/r/create">커뮤니티 만들기</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/r/following/${user.id}`}>팔로우 목록</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">설정</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              signOut({
                callbackUrl: `${window.location.origin}/sign-in`,
              });
            }}
          >
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

