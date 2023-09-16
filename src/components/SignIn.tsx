import { Icons } from '@/components/Icons'
import UserAuthForm from '@/components/UserAuthForm'
import Link from 'next/link'

const SignIn = () => {
  return (
    <div className='container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
      <div className='flex flex-col space-y-2 text-center'>
      <img src='/favicon.ico' className='h-12 w-12 sm:h-10 sm:w-10 mx-auto'/>
        <h1 className='text-2xl font-semibold tracking-tight'>코인 커뮤니티</h1>
        <p className='text-sm max-w-xs mx-auto'>
        계속하기 위해 코인 커뮤니티 계정을 설정합니다.
              사용자 동의 및 개인 정보 보호 정책.
        </p>
      </div>
      <UserAuthForm />
      <p className='px-8 text-center text-sm text-muted-foreground'>
      코인 커뮤니티가 처음이신가요?{' '}
        <Link
          href='/sign-up'
          className='hover:text-brand text-sm underline underline-offset-4'>
          등록하기
        </Link>
      </p>
    </div>
  )
}

export default SignIn
