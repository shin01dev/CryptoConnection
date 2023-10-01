import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { PostValidator } from '@/lib/validators/post';
import { z } from 'zod';

const postDeleteSchema = z.object({
  postId: z.string(),
});
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate the request body
    const { postId } = postDeleteSchema.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const post = await db.post.findFirst({
      where: {
        id: postId,
        authorId: session.user.id, // Ensure that the user is the author of the post.
      },
    });

    if (!post) {
      return new Response('Post not found or unauthorized', { status: 404 });
    }

    // Fetch all comments related to the post.
    const comments = await db.comment.findMany({
      where: {
        postId: postId,
      },
    });

    // Delete all replies for each comment.
    for (const comment of comments) {
      await db.comment.deleteMany({
        where: {
          replyToId: comment.id,
        },
      });
    }

    // Delete all comments related to the post.
    await db.comment.deleteMany({
      where: {
        postId: postId,
      },
    });

    // Delete the post.
    await db.post.delete({
      where: {
        id: postId,
      },
    });

    return new Response('Post and related comments deleted successfully');
  } catch (error) {
    console.error('Error while deleting post and related comments:', error);
    return new Response('Could not delete the post and comments at this time. Please try later', { status: 500 });
  }
}
