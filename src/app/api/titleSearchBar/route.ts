import { db } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q');

  if (!q) return new Response('Invalid query', { status: 400 });

  const encodedQuery = q;  
  const results = await db.post.findMany({
    where: {
      title: {
        contains: encodedQuery,  // Use contains instead of startsWith
      },
    },
    include: {
      subreddit: true, // Include the related subreddit information
      _count: true,
    },
    orderBy: {
      createdAt: 'desc'  // Order by createdAt in descending order (most recent first)
    },
    take: 20,
  });
  return new Response(JSON.stringify(results));
}
