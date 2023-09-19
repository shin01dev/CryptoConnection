import { Icons } from '@/components/Icons'
import UserAuthForm from '@/components/UserAuthForm'
import Link from 'next/link'

const SignUp = () => {
  return (
    <div className='container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
      <div className='flex flex-col space-y-2 text-center'>
  <img src="/favicon.ico" alt="Coin Image" className="w-6 h-6  mx-auto" /> {/* 이미지 추가 */}
        <h1 className='text-2xl font-semibold tracking-tight'>회원가입</h1>
        <p className='text-sm max-w-xs mx-auto'>
    계속하기 위해, 크립토 커넥션 커뮤니티에 가입해 주세요 !
        </p>
      </div>
      <UserAuthForm />
      <p className='px-8 text-center text-sm text-muted-foreground'>
       이미 회원이신가요?{' '}
        <Link
          href='/sign-in'
          className='hover:text-brand text-sm underline underline-offset-4'>
로그인
        </Link>
      </p>
    </div>
  )
}

export default SignUp
