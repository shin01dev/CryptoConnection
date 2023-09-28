'use client'
import { useState } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { BASE_URL } from './BASE_URL'

const SubNavbar = () => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className='top-[height of main navbar + 2px] inset-x-0 h-fit bg-gradient-to-r bg-purple-600 border-b border-zinc-300 z-[10] py-1'>
    <div className='container max-w-7xl h-full mx-auto flex items-center justify-center gap-1'>
        <DropdownMenu >
          <DropdownMenuTrigger className='mr-4'>
            <div
              className='relative pb-2'
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
<p className='text-white text-sm font-medium cursor-pointer hover:underline whitespace-nowrap mt-1'>
유머/정보
              </p>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent>
            
            <div className='space-y-2'>
              <DropdownMenuItem>
                <a href='/r/유머%2F정보'>유머/정보</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/핫이슈'>핫이슈</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/정치%2F시사'>정치/시사</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/미스터리%2F공포'>미스터리/공포</a>
              </DropdownMenuItem>
   
              <DropdownMenuItem>
                <a href='/r/디지털%2F컴퓨터%2F스마트폰'>디지털/컴퓨터/스마트폰</a>
              </DropdownMenuItem>
        
            </div>           
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
        <DropdownMenuTrigger className='mr-4'>
            <div
              className='relative pb-2'
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
<p className='text-white text-sm font-medium cursor-pointer hover:underline whitespace-nowrap  mt-1'>
쇼핑/투자
              </p>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent>
            
            <div className='space-y-2'>
              <DropdownMenuItem>
                <a href='/r/주식'>주식</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/가상화폐'>가상화폐</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/비트코인'>비트코인</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/부동산'>부동산</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/쇼핑'>쇼핑</a>
              </DropdownMenuItem>
            </div>           
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
        <DropdownMenuTrigger className='mr-4'>
            <div
              className='relative pb-2'
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
<p className='text-white text-sm font-medium cursor-pointer hover:underline whitespace-nowrap  mt-1'>
엔터테인먼트
              </p>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent>
            
            <div className='space-y-2'>
              <DropdownMenuItem>
                <a href='/r/영화%2FTV'>영화/TV</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/음악'>음악</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/게임'>게임</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/책%2F소설'>책/소설</a>
              </DropdownMenuItem>
            </div>           
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
        <DropdownMenuTrigger className='mr-4'>
            <div
              className='relative pb-2'
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
<p className='text-white text-sm font-medium cursor-pointer hover:underline whitespace-nowrap  mt-1'>
연예/여가
              </p>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent>
            
            <div className='space-y-2'>
              <DropdownMenuItem>
                <a href='/r/연예인 잡담'>연예인 잡담</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/음식%2F여행'>음식/여행</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/패션'>패션</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/연애상담'>연애상담</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/MBTI'>MBTI</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/아프리카 TV'>아프리카 TV</a>
              </DropdownMenuItem>
            </div>           
          </DropdownMenuContent>
        </DropdownMenu>
             <DropdownMenu>
             <div
  className='relative pb-2'
  onMouseEnter={() => setIsHovering(true)}
  onMouseLeave={() => setIsHovering(false)}
><div className='mt-1'>
  <Link href="/category" className='text-white text-sm font-medium cursor-pointer hover:underline whitespace-nowrap  '>
    게시판
  </Link>
  </div>
</div>

          
          <DropdownMenuContent>
            
            <div className='space-y-2'>
              <DropdownMenuItem>
                <a href='/r/유머정보'>유머/정보</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/쇼핑투자'>쇼핑/투자</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/게임'>게임</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/스포츠'>스포츠</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href='/r/스포츠'>아프리카 TV</a>
              </DropdownMenuItem>
            </div>           
          </DropdownMenuContent>
        </DropdownMenu>
      
      
      

        
      </div>
    </div>
  );
};

export default SubNavbar;
