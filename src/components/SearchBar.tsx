'use client'

import { Post, Prisma, Subreddit, User } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import debounce from 'lodash.debounce'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useRef, useState } from 'react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command'
import { Library } from 'lucide-react';

import { useOnClickOutside } from '@/hooks/use-on-click-outside'
import { Users as QQ, Globe   } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
const TOGGLE_MODE_KEY = 'toggle_search_mode'; // Local Storage에 저장할 키

const ToggleSearch: FC = () => {
  // 기본 검색 모드는 'community'로 설정
  const [mode, setMode] = useState<'community' | 'user' | 'title' | 'content'>('community');

  // 페이지가 로드될 때 Local Storage에서 검색 모드 가져오기
  useEffect(() => {
    const storedMode = localStorage.getItem(TOGGLE_MODE_KEY);
    if (storedMode) {
      setMode(storedMode as 'community' | 'user' | 'title' | 'content');
    }
  }, []);

  // 검색 모드 변경 시 Local Storage에 저장
  const handleModeChange = (newMode: 'community' | 'user' | 'title' | 'content') => {
    setMode(newMode);
    localStorage.setItem(TOGGLE_MODE_KEY, newMode);
  };

  return (
    <div className="flex items-center bg-white rounded-md">

      
      {/* 나머지 컴포넌트 렌더링 부분 */}
      {mode === 'community' && <SearchBar />}
      {mode === 'user' && <UserSearchBar />}
      {mode === 'title' && <TitleSearchBar />}
      {mode === 'content' && <ContentSearchBar />}

  <DropdownMenu>
    <DropdownMenuTrigger className="flex items-center px-3 hover:bg-gray-100 focus:outline-none">
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onSelect={() => setMode('community')}>커뮤니티 검색</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setMode('user')}>유저 검색</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setMode('title')}>제목 검색</DropdownMenuItem>
      {/* <DropdownMenuItem onSelect={() => setMode('content')}>내용 검색</DropdownMenuItem> */}
    </DropdownMenuContent>
  </DropdownMenu>
</div>




  )
}



interface SearchBarProps {}


const SearchBar: FC<{}> = ({}) => {
  const [input, setInput] = useState<string>('')
  const pathname = usePathname()
  const commandRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useOnClickOutside(commandRef, () => {
    setInput('')
  })

  const request = debounce(async () => {
    refetch()
  }, 300)

  const debounceRequest = useCallback(() => {
    request()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    isFetching,
    data: queryResults,
    refetch,
    isFetched,
  } = useQuery({
    queryFn: async () => {
      if (!input) return []
      const { data } = await axios.get(`/api/search?q=${input}`)
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType
      })[]
    },
    queryKey: ['search-query'],
    enabled: false,
  })

  useEffect(() => {
    setInput('')
  }, [pathname])

  return (
    <Command
      ref={commandRef}
      className='relative   max-w-lg z-50 overflow-visible'>
      <CommandInput
        isLoading={isFetching}
        onValueChange={(text) => {
          setInput(text)
          debounceRequest()
        }}
        value={input}
        className='outline-none border-none focus:border-none focus:outline-none ring-0'
        placeholder='커뮤니티 검색하기...'
      />

      {input.length > 0 && (
        <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md '>
        {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading='Communities'>
              {queryResults?.map((subreddit) => (
                <CommandItem
                  onSelect={(e) => {
                    router.push(`/r/${e}`)
                    router.refresh()
                  }}
                  key={subreddit.id}
                  value={decodeURIComponent(subreddit.name)}>
                  <Globe className='mr-2 h-4 w-4' />
                  <a href={`/r/${subreddit.name}`}>{decodeURIComponent(subreddit.name)}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  )
}

const UserSearchBar: FC<{}> = ({}) => {
  const [input, setInput] = useState<string>('')
  const pathname = usePathname()
  const commandRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useOnClickOutside(commandRef, () => {
    setInput('')
  })

  const request = debounce(async () => {
    refetch()
  }, 300)

  const debounceRequest = useCallback(() => {
    request()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    isFetching,
    data: queryResults,
    refetch,
    isFetched,
  } = useQuery({
    queryFn: async () => {
      if (!input) return []
      const { data } = await axios.get(`/api/userSearch?q=${input}`)
      return data as (User & {
        _count: Prisma.UserCountOutputType
      })[]
    },
    queryKey: ['search-query'],
    enabled: false,
  })

  useEffect(() => {
    setInput('')
  }, [pathname])

  return (
    <Command
      ref={commandRef}
      className='relative  max-w-lg z-50 overflow-visible'>
      <CommandInput
        isLoading={isFetching}
        onValueChange={(text) => {
          setInput(text)
          debounceRequest()
        }}
        value={input}
        className='outline-none border-none focus:border-none focus:outline-none ring-0'
        placeholder='유저 검색하기...'
      />

      {input.length > 0 && (
        <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
        {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading='Users'>
              {queryResults?.map((user) => (
                <CommandItem
                  onSelect={(e) => {
                    router.push(`/r/myFeed/${user.id}`)
                    router.refresh()
                  }}
                  key={user.id}
                  value={decodeURIComponent(user.username ?? '')}>
                  <QQ className='mr-2 h-4 w-4' />
                  <a href={`/r/myFeed/${user.id}`}>{decodeURIComponent(user.username ?? '')}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  )
}

const TitleSearchBar: FC<{}> = ({}) => {
  const [input, setInput] = useState<string>('')
  const pathname = usePathname()
  const commandRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useOnClickOutside(commandRef, () => {
    setInput('')
  })

  const request = debounce(async () => {
    refetch()
  }, 300)

  const debounceRequest = useCallback(() => {
    request()
  }, [])

  const {
    isFetching,
    data: queryResults,
    refetch,
    isFetched,
  } = useQuery({
    queryFn: async () => {
      if (!input) return []
      const { data } = await axios.get(`/api/titleSearchBar?q=${encodeURIComponent(input)}`)
      return data as (Post & {
        _count: Prisma.PostCountOutputType,
        subreddit: Subreddit
      })[]
    },
    queryKey: ['search-query-title'],
    enabled: false,
  })

  useEffect(() => {
    setInput('')
  }, [pathname])


  return (
    <Command
      ref={commandRef}
      className='relative  max-w-lg z-50 overflow-visible'>
      <CommandInput
        isLoading={isFetching}
        onValueChange={(text) => {
          setInput(text)
          debounceRequest()
        }}
        value={input}
        className='outline-none border-none focus:border-none focus:outline-none ring-0'
        placeholder='게시물 제목 검색하기...'
      />

      {input.length > 0 && (
        <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
        {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading='Title'>
              {queryResults?.map((post) => (
                <CommandItem
                  onSelect={() => {
                    router.push(`/r/${post.subreddit.name}/post/${post.id}`)
                    router.refresh()
                  }}
                  key={post.id}
                  value={decodeURIComponent(post.title)}>
                  <Library className='mr-2 h-4 w-4' />
                  <a href={`/r/${post.subreddit.name}/post/${post.id}`}>{decodeURIComponent(post.title)}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  )
}



















const ContentSearchBar: FC<SearchBarProps> = ({}) => {
  const [input, setInput] = useState<string>('')
  const pathname = usePathname()
  const commandRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useOnClickOutside(commandRef, () => {
    setInput('')
  })

  const request = debounce(async () => {
    refetch()
  }, 300)

  const debounceRequest = useCallback(() => {
    request()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    isFetching,
    data: queryResults,
    refetch,
    isFetched,
  } = useQuery({
    queryFn: async () => {
      if (!input) return []
      const { data } = await axios.get(`/api/contentSearchBar?q=${encodeURIComponent(input)}`) // 엔드포인트를 text를 검색할 수 있는 것으로 수정

      return data as (Post & {
        _count: Prisma.PostCountOutputType,
        subreddit: Subreddit,
        content: {
          time: number,
          blocks: { id: string, data: { text: string }, type: string }[],
          version: string
        }
      })[];
    },
    queryKey: ['search-query'],
    enabled: false,
  })


  useEffect(() => {
    setInput('')
  }, [pathname])
  return (
    <Command
      ref={commandRef}
      className='relative  max-w-lg z-50 overflow-visible'>
      <CommandInput
        isLoading={isFetching}
        onValueChange={(text) => {
          setInput(text)
          debounceRequest()
        }}
        value={input}
        className='outline-none border-none focus:border-none focus:outline-none ring-0'
        placeholder='게시물 내용 검색하기...'
      />

      {input.length > 0 && (
        <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
        {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading='Posts'>
           {queryResults?.map((post) => (
      <CommandItem
        onSelect={(e) => {
          router.push(`/r/${post.subreddit.name}/post/${post.id}`)
          router.refresh()
        }}
        key={post.id}
        value={decodeURIComponent(post.content?.blocks[0]?.data?.text)}>  {/* text로 변경 */}
        <QQ className='mr-2 h-4 w-4' />
        <a href={`/r/${post.subreddit.name}/post/${post.id}`}>{decodeURIComponent(post.content?.blocks[0]?.data?.text)}</a>  {/* text로 변경 */}
      </CommandItem>
    ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  )
}


export default ToggleSearch
