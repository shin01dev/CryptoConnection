import Navbar from '@/components/Navbar'
import { cn } from '@/lib/utils'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import { Toaster } from '@/components/ui/Toaster'
import SubNavbar from '@/components/SubNavbar'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Coin Community',
  description: 'Coin Community',
}

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode
  authModal: React.ReactNode
}) {
  return (
<html
  lang='en'
  className={cn(
    'w-full h-full bg-white text-slate-900 antialiased light overflow-x-hidden',
    inter.className
  )}
>

<body className='w-full overflow-x-hidden ...'>
  <Providers>
    {/* @ts-expect-error Server Component */}
    <Navbar />
    <SubNavbar/>
    {authModal}

    <div className='max-w-full px-0 mx-auto h-full pt-12'>
      <div className='pt-[height of main navbar]'>
        {children}
      </div>
    </div>

  </Providers>
  <Toaster />
</body>

    </html>
  )
}
