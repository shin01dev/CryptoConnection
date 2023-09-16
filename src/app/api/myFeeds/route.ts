import { db } from '@/lib/db';

export async function POST(req: any) {


  const { userId } = req.query;

  try {
    const posts = await db.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        votes: true,
        author: true,
        comments: true,
        subreddit: true,
      },
    });

    return new Response(JSON.stringify(posts), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response('Internal server error', { status: 500 });
  }
}
