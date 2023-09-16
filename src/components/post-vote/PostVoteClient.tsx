'use client'
import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { PostVoteRequest } from '@/lib/validators/vote'
import { usePrevious } from '@mantine/hooks'
import { VoteType } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { toast } from '../../hooks/use-toast'
import { Button } from '../ui/Button'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostVoteClientProps {
  postId: string
  initialVotesAmt: number
  initialVote?: VoteType | null
}

const PostVoteClient = ({
  postId,
  initialVotesAmt,
  initialVote,
}: PostVoteClientProps) => {
  const { loginToast } = useCustomToasts()
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt)
  const [currentVote, setCurrentVote] = useState(initialVote)
  const prevVote = usePrevious(currentVote)
  const [isUpVoteDisabled, setIsUpVoteDisabled] = useState(false)
  const [isDownVoteDisabled, setIsDownVoteDisabled] = useState(false)

  // ensure sync with server
  useEffect(() => {
    setCurrentVote(initialVote)
  }, [initialVote])

  const { mutate: vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: PostVoteRequest = {
        voteType: type,
        postId: postId,
      }

      await axios.patch('/api/subreddit/post/vote', payload)
    },
    onError: (err: Error, voteType: VoteType) => {
      if (voteType === 'UP') {
        setIsUpVoteDisabled(false) // Enable upvote button on error
        setVotesAmt((prev) => (currentVote === 'UP' ? prev : prev - 1))
      } else if (voteType === 'DOWN') {
        setIsDownVoteDisabled(false) // Enable downvote button on error
        setVotesAmt((prev) => (currentVote === 'DOWN' ? prev : prev + 1))
      }

      // reset current vote
      setCurrentVote(prevVote)

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast()
        }
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your vote was not registered. Please try again.',
        variant: 'destructive',
      })
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        // User is voting the same way again, so remove their vote
        setCurrentVote(undefined)
        if (type === 'UP') setVotesAmt((prev) => prev - 1)
        else if (type === 'DOWN') setVotesAmt((prev) => prev + 1)
      } else {
        // User is voting in the opposite direction, so subtract 2
        setCurrentVote(type)
        if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
        else if (type === 'DOWN')
          setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
      }
    },
  })

  const handleUpVote = () => {
    if (!isUpVoteDisabled) {
      setIsUpVoteDisabled(true) // Disable upvote button temporarily
      vote('UP')
      setTimeout(() => {
        setIsUpVoteDisabled(false) // Enable upvote button after 1 second
      }, 1000)
    }
  }

  const handleDownVote = () => {
    if (!isDownVoteDisabled) {
      setIsDownVoteDisabled(true) // Disable downvote button temporarily
      vote('DOWN')
      setTimeout(() => {
        setIsDownVoteDisabled(false) // Enable downvote button after 1 second
      }, 1000)
    }
  }

  return (
    <div className='flex gap-0 sm:gap-0 pr-0 sm:w-20 pb-0 sm:pb-0'>
      {/* upvote */}
      <Button
        onClick={handleUpVote}
        disabled={isUpVoteDisabled}
        size='sm'
        variant='ghost'
        aria-label='upvote'>
        <ArrowBigUp
          className={cn('h-4 w-4 text-zinc-700', {
            'text-emerald-500 fill-emerald-500': currentVote === 'UP',
          })}
        />
      </Button>

      {/* score */}
      <p className='text-center py-2 font-medium text-sm text-zinc-900'>
        {votesAmt}
      </p>

      {/* downvote */}
      <Button
        onClick={handleDownVote}
        disabled={isDownVoteDisabled}
        size='sm'
        className={cn({
          'text-emerald-500': currentVote === 'DOWN',
        })}
        variant='ghost'
        aria-label='downvote'>
        <ArrowBigDown
          className={cn('h-4 w-4 text-zinc-700', {
            'text-red-500 fill-red-500': currentVote === 'DOWN',
          })}
        />
      </Button>
    </div>
  )
}

export default PostVoteClient
