'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { UsernameValidator } from '@/lib/validators/username'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'

interface UserNameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, 'id' | 'username'>
}

type FormData = z.infer<typeof UsernameValidator>

export function UserNameForm({ user, className, ...props }: UserNameFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || '',
    },
  })

  const { mutate: updateUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: FormData) => {
      const payload: FormData = { name }

      const { data } = await axios.patch(`/api/username/`, payload)
      return data
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: '이미 사용중인 이름 입니다.',
            description: '다른 유저 이름을 사용해 주세요.',
            variant: 'destructive',
          })
        }
      }

      return toast({
        title: '실패.',
        description: '다시 시도해 주세요.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      toast({
        description: '이름이 성공적으롶변경되었습니다.',
      })
      router.refresh()
    },
  })

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit((e) => updateUsername(e))}
      {...props}>
      <Card>
        <CardHeader>
          <CardTitle> 회원님의 활동명을 설정해 주세요 !</CardTitle>
          <CardDescription>
           중복은 허용되지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative grid gap-1'>
            <div className='absolute top-0 left-0 w-8 h-10 grid place-items-center'>
              <span className='text-sm text-zinc-400'></span>
            </div>
            <Label className='sr-only' htmlFor='name'>
              이름
            </Label>
            <Input
              id='name'
              className='w-[400px] pl-6'
              size={32}
              {...register('name')}
            />
            {errors?.name && (
              <p className='px-1 text-xs text-red-600'>{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button isLoading={isLoading}>이름 변경</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
