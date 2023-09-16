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
import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type MessageItem = {
    type: 'donation' | 'crypto';
    timestamp: string;
    image?: string;
    message: React.ReactNode;  // message 타입을 React.ReactNode으로 변경
    authorId?: string;
    id?: string;
    subreddit?: {
        name: string;
    };
    createdAt: string;  // createdAt 속성 추가
};
// 시간을 포맷하는 함수
function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  }
  
export default function Home(props: any) {
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [loading, setLoading] = useState(true); // 초기 상태는 로딩 중으로 설정
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
        console.log("실행됨")

      };
      
      useEffect(() => {
        const timer = setTimeout(() => {
            updateTokenNotificationStatus();
        }, 100); // Delay of 1 second
      
        return () => clearTimeout(timer); // Cleanup on unmount
      }, []);
      
            
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.post('/api/NfToken');
                const { giveCryptoUserRecords, donatedPosts } = response.data;

                const donationMsgs = donatedPosts.map((post: any) => ({
                    type: 'donation',
                    timestamp: post.createdAt,  // 타임스탬프 추가
                    message: (
                        <>
                            {`${post.author.username}이 회원님에게 "${post.title}" 제목의 글을 작성하여 ${post.donateCoin}개의 토큰을 후원하였습니다.`}
                            <br />
                            <small>{formatTimestamp(post.createdAt)}</small>
                        </>
                    ),                    image: post.author.image,
                    createdAt: post.createdAt
                }));
    

                const cryptoMsgs = giveCryptoUserRecords.map((record: any) => ({
                    type: 'crypto',
                    timestamp: record.Time,
                    message: (
                        <span>
                       
                            <Link href={`/r/${decodeURIComponent(record.subredditName)}/post/${record.postId}`}>
                                {`회원님의 (${decodeURIComponent(record.subredditName)}) 게시물이 인기글이 되어 토큰 ${record.TokenAmount}개를 지급 받으셨습니다!`}
                            </Link>
                        </span>
                    )
                }));
                
                // 모든 메시지를 하나의 배열로 합치기
                const combinedMessages = [ ...cryptoMsgs];

                setMessages(combinedMessages);

            } catch (error) {
                console.error('An error occurred while fetching data:', error);
            } finally {
                setLoading(false);  // 데이터가 모두 불러와지거나 오류가 발생할 때 로딩 상태를 false로 설정
            }
        }

        fetchData();
    }, []);

    return (
        <div className="bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4 text-center">토큰 알림</h2>
        <div className="space-y-4">
        {loading ? (
    <div className="flex items-center justify-center text-gray-600">
    <p className="mr-2">토큰 알림을 불러오는 중...</p>
    <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
  </div>
  ) : messages.length === 0 ? (  // 메시지 배열의 길이가 0인지 확인
    <p className="text-gray-400 text-center">토큰 알림이 없습니다.</p> // 알림이 없는 경우 표시될 텍스트
) : (
    messages.map((item, idx) => (
        <div key={idx} className="flex items-center mb-4 p-2 bg-white rounded-lg shadow">
            {item.type === 'donation' && (
                <img 
                src={item.image!} 
                alt="Author" 
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 cursor-pointer"
            />
        )}
        <div className="flex-1">
            <p className="ml-0 flex items-center">
                {item.message} 
                <Link href="/r/wallet">
                    <img src="/favicon.ico" alt="Token Image" className="ml-2 w-5 h-5 cursor-pointer mr-4" />
                </Link>
            </p>
            <small className="text-gray-500">  {/* 시간 정보를 출력하는 부분 */}
                {formatTimestamp(item.timestamp)}
            </small>
        </div>
    </div>
)))}

            </div>
        </div>
    );
    
    
}
