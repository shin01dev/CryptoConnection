'use client'
import CustomFeed from '@/components/homepage/CustomFeed'
import GeneralFeed from '@/components/homepage/GeneralFeed'
import { Button, buttonVariants } from '@/components/ui/Button'
import { getAuthSession } from '@/lib/auth'
import { Home as HomeIcon } from 'lucide-react'
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
import { useRouter } from 'next/router'
import UserSearchBar from '@/components/userSearchBar'
import { Loader2 } from 'lucide-react'

export default function Home(props: any) {
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);
    const [lastSegment, setLastSegment] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // 처음에 로딩 중으로 설정

    useEffect(() => {
        function getLastSegmentOfURL() {
            const pathArray = window.location.pathname.split('/');
            return pathArray[pathArray.length - 1];
        }

        const segment = getLastSegmentOfURL();
        setLastSegment(segment);
    }, []);

    useEffect(() => {
        async function fetchFollowings() {
            if (!lastSegment) return;

            try {
                const response = await fetch('/api/getFollowings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ lastSegment })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch followings');
                }

                const data = await response.json();
                setFollowings(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false); // 데이터를 가져오든 에러가 발생하든 로딩 상태를 false로 설정
            }
        }

        fetchFollowings();
    }, [lastSegment]);

    return (
        <div className="flex justify-between p-4 bg-gray-100 min-h-screen">
            {/* Followings Rendering */}
            <div className="w-full bg-white p-4 rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-screen">
                {/* 팔로워/팔로잉 링크 */}
                <div className="mb-4">
                    <Link href={`/r/follower/${lastSegment}`} className="text-blue-500 hover:underline mr-4">
                        팔로워
                    </Link>
                    <Link href={`/r/following/${lastSegment}`} className="text-blue-500 hover:underline mr-4">
                        팔로잉
                    </Link>
                </div>

                <h2 className="text-lg font-semibold mb-4 text-gray-600">팔로잉</h2>
                {isLoading ? ( // 로딩 중인 경우 로더를 표시
                    <div className="flex items-center justify-center mt-4">
                        <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
                    </div>
                ) : (
                    followings.length === 0 ? ( // 팔로잉 목록이 비어있는 경우 텍스트 표시
                        <p className="text-gray-500 text-center mt-4">팔로잉 없음</p>
                    ) : (
                        <ul className="list-decimal pl-0">
                            {followings.map((following: any) => (
                                <li key={following.id} className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                                    <Link href={`/r/myFeed/${following.id}`}>
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={following.image}
                                                alt={following.username}
                                                className="w-12 h-12 rounded-full border border-gray-300"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{following.username}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )
                )}
            </div>
        </div>
    );
}
