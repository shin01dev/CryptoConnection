'use client'

import { Post, Prisma, Subreddit,User} from '@prisma/client'
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
import { useOnClickOutside } from '@/hooks/use-on-click-outside'
import { Users as QQ } from 'lucide-react'

interface SearchBarProps {}

const TitleSearchBar: FC<SearchBarProps> = ({}) => {
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
      const { data } = await axios.get(`/api/titleSearchBar?q=${encodeURIComponent(input)}`) // Change the API endpoint to something appropriate

      // 데이터 타입을 Post에 맞게 수정
      return data as (Post & {
        _count: Prisma.PostCountOutputType,
        subreddit: Subreddit
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
      className='relative rounded-lg border max-w-lg z-50 overflow-visible'>
      <CommandInput
        isLoading={isFetching}
        onValueChange={(text) => {
          setInput(text)
          debounceRequest()
        }}
        value={input}
        className='outline-none border-none focus:border-none focus:outline-none ring-0'
        placeholder='Search posts...'
      />

      {input.length > 0 && (
        <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading='Posts'>
              {queryResults?.map((post) => (
                <CommandItem
                  onSelect={(e) => {
                    router.push(`/r/${post.subreddit.name}/post/${post.id}`) // Change the URL pattern to something appropriate for posts
                    router.refresh()
                  }}
                  key={post.id}
                  value={decodeURIComponent(post.title)}>  {/* 디코딩 적용 */}
                  <QQ className='mr-2 h-4 w-4' />
                  <a href={`/r/${post.subreddit.name}/post/${post.id}`}>{decodeURIComponent(post.title)}</a>  {/* 디코딩 적용 */}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  )
}

export default TitleSearchBar