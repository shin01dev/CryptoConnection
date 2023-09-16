// src/app/api/subreddit/route.ts
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { SubredditValidator } from '@/lib/validators/subreddit'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name } = SubredditValidator.parse(body)

    // check if subreddit already exists
    const subredditExists = await db.subreddit.findFirst({
      where: {
        name,
      },
    })

    if (subredditExists) {
      return new Response('동일한 이름의 커뮤니티가 존재합니다', { status: 409 })
    }

    // create subreddit and associate it with the user
    const subreddit = await db.subreddit.create({
      data: {
        name: encodeURIComponent(name),//여길 인코딩 해야지 한국어 커뮤니티 만들어짐.
        realname : name,
        creatorId: session.user.id,
      },
    })

    // creator also has to be subscribed
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: subreddit.id,
      },
    })

    return new Response(subreddit.name)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 })
    }

    return new Response('커뮤니티 생성 실패', { status: 500 })
  }
}
