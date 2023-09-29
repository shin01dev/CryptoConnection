import { db } from '@/lib/db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { nanoid } from 'nanoid'
import { NextAuthOptions, getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.username = token.username
      }

      return session
    },

    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      })

      if (!dbUser) {
        token.id = user!.id
        return token
      }

      if (!dbUser.username) {
        await db.user.update({
          where: {
            id: dbUser.id,
          },
          data: {
            username: nanoid(10),
          },
        })
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        username: dbUser.username,
      }
    },
    redirect() {
      return '/'
    },
  },
}




export const getAuthSession = () => getServerSession(authOptions)


// // 새로운 비동기 함수를 추가합니다.
// export async function POST(req: any) {
//   try {
//     // 현재 세션에서 사용자 정보를 가져옵니다.
//     const session = await getAuthSession();
//     if (!session || !session.user || !session.user.id) {
//       return new Response(JSON.stringify({ message: '인증되지 않은 사용자입니다.' }), { status: 401 });
//     }

//     const subredditId = 'cln2rd2hw0006squwqb8ox0sf';

//     const subscriptionExists = await db.subscription.findFirst({
//       where: {
//         subredditId,
//         userId: session.user.id,
//       },
//     });

//     if (subscriptionExists) {
//       return new Response("You've already subscribed to this subreddit", {
//         status: 400,
//       });
//     }

//     // create subreddit and associate it with the user
//     await db.subscription.create({
//       data: {
//         subredditId,
//         userId: session.user.id,
//       },
//     });

//     const notificationOnCount = await db.giveCryptoUser.count({
//       where: {
//         userId: session.user.id,
//         notification: "on",
//       },
//     });

//     return new Response(JSON.stringify({ notificationOnCount }), { status: 200 });

//   } catch (error) {
//     console.error(error);
//     return new Response(JSON.stringify({ message: '서버 내부 오류가 발생했습니다.' }), { status: 500 });
//   }
// }