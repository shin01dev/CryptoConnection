import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CommentValidator } from '@/lib/validators/comment'
import { z } from 'zod'

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { commentId } = body  // Add this line


    const session = await getAuthSession()

    // if (!session?.user) {
    //   return new Response('Unauthorized', { status: 401 })
    // }

    // Get the comment with the provided commentId
    const comment = await db.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        authorId: true,
      },
    })

    if (!comment) {
      return new Response('Comment not found', { status: 404 })
    }

    // If the comment exists, return the authorId
    return new Response(JSON.stringify({ authorId: comment.authorId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not fetch comment information. Please try again later',
      { status: 500 }
    )
  }
}
