import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { PostValidator } from '@/lib/validators/post'
import { z } from 'zod'

export async function POST(req: Request) {
    try {
      const body = await req.json()
  
      const { title, content, subredditId, postId, editThumbnail } = PostValidator.parse(body)
  
      const session = await getAuthSession()
  
      if (!session?.user) {
        return new Response('Unauthorized', { status: 401 })
      }
  
      // verify user is subscribed to passed subreddit id
      const subscription = await db.subscription.findFirst({
        where: {
          subredditId,
          userId: session.user.id,
        },
      })
  
      if (!subscription) {
        return new Response('Subscribe to post', { status: 403 })
      }
  
      const post = await db.post.findFirst({
        where: {
          id: postId,
        },
      })
  
      if (!post) {
        return new Response('Post not found', { status: 404 })
      }
  
      await db.post.update({
        where: {
          id: postId,
        },
        data: {
          title,
          content,
          subredditId,
          thumbnail: editThumbnail, // add this line, assuming thumbnailUrl is the relevant database field

        },
      })
  
      return new Response('OK')
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(error.message, { status: 400 })
      }
  
      return new Response(
        'Could not post to subreddit at this time. Please try later',
        { status: 500 }
      )
    }
  }
  