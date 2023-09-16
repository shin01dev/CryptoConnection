// src/app/api/subreddit/post/delete

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
    console.log(postId+"QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ");

    if (!post) {
      return new Response('Post not found or unauthorized', { status: 404 });
    }

    // Delete the post.
    await db.post.delete({
      where: {
        id: postId,
      },
    });

    return new Response('Post deleted successfully');
  } catch (error) {
    console.error('Error while deleting post:', error);
    return new Response('Could not delete the post at this time. Please try later', { status: 500 });
  }
}
