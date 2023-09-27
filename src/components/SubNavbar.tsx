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
                <Link href='/r/유머정보'>유머/정보</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/쇼핑투자'>쇼핑/투자</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/게임'>게임</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/스포츠'>스포츠</Link>
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
                <Link href='/r/유머정보'>유머/정보</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/쇼핑투자'>쇼핑/투자</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/게임'>게임</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/스포츠'>스포츠</Link>
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
게임
              </p>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent>
            
            <div className='space-y-2'>
              <DropdownMenuItem>
                <Link href='/r/유머정보'>유머/정보</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/쇼핑투자'>쇼핑/투자</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/게임'>게임</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/스포츠'>스포츠</Link>
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
스포츠
              </p>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent>
            
            <div className='space-y-2'>
              <DropdownMenuItem>
                <Link href='/r/유머정보'>유머/정보</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/쇼핑투자'>쇼핑/투자</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/게임'>게임</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/스포츠'>스포츠</Link>
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
                <Link href='/r/유머정보'>유머/정보</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/쇼핑투자'>쇼핑/투자</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/게임'>게임</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href='/r/스포츠'>스포츠</Link>
              </DropdownMenuItem>
            </div>           
          </DropdownMenuContent>
        </DropdownMenu>
      
      
      

        
      </div>
    </div>
  );
};

export default SubNavbar;
