 'use client'

import { useOnClickOutside } from '@/hooks/use-on-click-outside'
import { formatTimeToNow } from '@/lib/utils'
import { CommentRequest } from '@/lib/validators/comment'
import { Comment, CommentVote, User } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useRef, useState } from 'react'
import CommentVotes from '../CommentVotes'
import { UserAvatar } from '../UserAvatar'
import { Button } from '../ui/Button'
import { Label } from '../ui/Label'
import { Textarea } from '../ui/Textarea'
import { toast } from '../../hooks/use-toast'
import { useSession } from 'next-auth/react'
import { getAuthSession } from '@/lib/auth'
import Link from 'next/link'
import { db } from '@/lib/db'

type ExtendedComment = Comment & {
  votes: CommentVote[]
  author: User
}

interface PostCommentProps {
  comment: ExtendedComment
  votesAmt: number
  currentVote: CommentVote | undefined
  postId: string
}

const PostComment: FC<PostCommentProps> = ({ comment, votesAmt, currentVote, postId }) => {

  const { data: session } = useSession()
  const [isReplying, setIsReplying] = useState<boolean>(false)
  const commentRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState<string>(`@${comment.author.username} `)
  const [author, setAuthor] = useState()
  const [authorId, setAuthorId] = useState("");

  const router = useRouter()
  useOnClickOutside(commentRef, () => {
    setIsReplying(false)
  })

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, text, replyToId }

      const { data } = await axios.patch(
        `/api/subreddit/post/comment/`,
        payload
      )
      return data
    },

    onError: () => {
      return toast({
        title: 'Something went wrong.',
        description: "Comment wasn't created successfully. Please try again.",
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      router.refresh()
      setIsReplying(false)
    },
  })


  interface CommentPayload {
    postId: string;
    text: string;
    replyToId?: string;
    commentId: string;  // Modify this line
}
const commentMutation = useMutation(
  async (payload: CommentPayload) => {
    const response = await axios.patch('/api/subreddit/post/commentLink/', payload);
    const data = response.data;
    setAuthorId(data.authorId); // Set authorId state here
    console.log("authorId: dd", data.authorId);
    return data;
  },
  {
    onError: (error) => {
      console.error(error);
      toast({
        title: 'Something went wrong.',
        description: "Comment wasn't created successfully. Please try again.",
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      setIsReplying(false);
    }
  }
);


useEffect(() => {
  const payload: CommentPayload = {
    postId,
    text: input,
    replyToId: comment.replyToId ?? comment.id,
    commentId: comment.id,
  };

  commentMutation.mutate(payload);
}, []); // 두 번째 인자인 빈 배열은 종속성을 지정합니다. 빈 배열을 전달하면 컴포넌트가 처음 렌더링될 때만 useEffect가 실행됩니다.




  return (
    <div ref={commentRef} className='flex flex-col'>
      <div className='flex items-center'>
      <Link href={`/r/myFeed/${authorId}`}>

        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className='h-6 w-6'
        />
               </Link>

        <div className='ml-2 flex items-center gap-x-2'>
        <Link href={`/r/myFeed/${authorId}`}>
          
        <div className='text-sm font-medium text-gray-900'>{comment.author.username} </div>
       </Link>
          <p className='max-h-40 truncate text-xs text-zinc-500'>
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className='text-sm text-zinc-900 mt-2'>{comment.text}</p>

      <div className='flex gap-2 items-center'>
        <CommentVotes
          commentId={comment.id}
          votesAmt={votesAmt}
          currentVote={currentVote}
        />

        <Button
          onClick={() => {
            if (!session) return router.push('/sign-in')
            setIsReplying(true)
          }}
          variant='ghost'
          size='xs'>
          <MessageSquare className='h-4 w-4 mr-1.5' />
          Reply
        </Button>
      </div>

      {isReplying ? (
        <div className='grid w-full gap-1.5'>
          <Label htmlFor='comment'>Your comment</Label>
          <div className='mt-2'>
            <Textarea
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length
                )
              }
              autoFocus
              id='comment'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder='What are your thoughts?'
            />

            <div className='mt-2 flex justify-end gap-2'>
              <Button
                tabIndex={-1}
                variant='subtle'
                onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              <Button
                isLoading={isLoading}
                onClick={() => {
                  if (!input) return
                  postComment({
                    postId,
                    text: input,
                    replyToId: comment.replyToId ?? comment.id, // default to top-level comment
                  })
                }}>
                Post
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default PostComment
