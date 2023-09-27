'use client'

import { Button } from '@/components/ui/Button'
import { toast } from '@/hooks/use-toast'
import { CommentRequest } from '@/lib/validators/comment'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

interface CreateCommentProps {
  postId: string
  replyToId?: string
  userId:any
  authorId:any
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId ,userId ,authorId}) => {
  const [input, setInput] = useState<string>('');
  const [donationInput, setDonationInput] = useState<number | null>(null);
  const router = useRouter();
  const { loginToast } = useCustomToasts();

  
  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, text, replyToId,donationInput }

      const { data } = await axios.patch(
        `/api/subreddit/post/comment/`,
        payload
      )
      return data
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast()
        }
      }

      return toast({
        title: 'Something went wrong.',
        description: "Comment wasn't created successfully. Please try again.",
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      router.refresh()
      setInput('')
    },
  })


const [coinNumber, setCoinNumber] = useState<number | null>(0);

async function getCoinNumber() {
  const response = await axios.get('/api/getCoinNumber');
  const firstObject = response.data[0];
  setCoinNumber(firstObject.crypto_currency);  
}
useEffect(() => {
  getCoinNumber();
  console.log(coinNumber)
})



  useEffect(() => {
    console.log('donationInput has changed:', donationInput);
  }, [donationInput]); // dependency 배열에 donationInput을 추가하여 해당 상태가 변할 때마다 훅이 실행되도록 함
  const inputClass = `
  w-20
  py-2
  px-3
  border
  rounded-md
  shadow-md
  border-gray-300
  focus:outline-none
  focus:border-gray-600
  focus:ring-1
  focus:ring-gray-200
  mr-2
`;
  return (
    <div className='grid w-full gap-1.5'>
      <Label htmlFor='comment'>댓글 작성</Label>
      <div className='mt-2'>
        <Textarea
          id='comment'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder='회원님의 생각은 어떤가요 ?'
        />
<div className="flex items-center">
  {userId !== authorId && (
    <>
      <label htmlFor='numberInput' className='mr-1 mt-2'>토큰 후원</label>
      <img src="/favicon.ico" alt="토큰 이미지" className='mr-2 w-5 h-5 mt-2' />
      <input
        id='numberInput'
        type='number'
        style={{ paddingLeft: '3px' }} // 이 부분을 추가합니다.
        className='w-20 h-8 mt-2 ml-1 text-sm border rounded-md border-gray-300 focus:outline-none focus:border-indigo-500'
        value={donationInput !== null ? donationInput : ''}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : null;
          if (value !== null) {
            if (value >= 1 && (coinNumber === null || value <= coinNumber)) {
              setDonationInput(value);
            } else if (coinNumber !== null && value > coinNumber) {
              setDonationInput(coinNumber);
            }
          } else {
            setDonationInput(null);
          }
        }}
      />
    </>
  )}
</div>


        <div className='mt-2 flex justify-end'>
        <Button
  isLoading={isLoading}
  disabled={input.length === 0}
  onClick={() => {
    comment({ postId, text: input, replyToId, donationInput });
    // 1초 후에 donationInput 상태를 초기화합니다.
    setTimeout(() => {
      setDonationInput(null);
    }, 300);
  }}>
  확인
</Button>
        </div>
      </div>
    </div>
  );
}

export default CreateComment;