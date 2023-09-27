import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Icons } from './Icons';
import { buttonVariants } from './ui/Button';
import { UserAccountNav } from './UserAccountNav';
import SearchBar from './SearchBar';
const Navbar = async () => {
  const session = await getServerSession(authOptions);
  return (
<div className='top-0 inset-x-0 h-fit lg:bg-gradient-to-l lg:from-purple-600 border-b border-zinc-300 z-[10] py-2 
   bg-gradient-to-l  from-purple-300 border-b border-zinc-300 '>
      <div className='max-w-full md:mr-4 h-full mx-auto flex flex-col md:flex-row items-center justify-between gap-2 px-2 md:px-0'>
        <div className="flex gap-2 items-center">
          {/* logo */}
          <a href='/'>
            <div className="flex gap-2 items-center cursor-pointer">
              <img src='/logo-4.png' className='h-12 w-40 ml-3' />
            </div>
          </a>
          {/* actions */}
          {session?.user ? (
            <UserAccountNav user={session.user} />
          ) : (
            <Link href='/sign-in' className={buttonVariants()}>
              로그인
            </Link>
          )}
        </div>
        {/* search bar */}
        <SearchBar />
      </div>
    </div>
  );
}

export default Navbar;
