import { db } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q');

  if (!q) return new Response('Invalid query', { status: 400 });

  const encodedQuery = (decodeURIComponent(q));  // 인코딩된 검색어 생성
  const results = await db.post.findMany({
    where: {
      title: {
        // startsWith: encodedQuery,  // 인코딩된 검색어를 사용해 검색
        contains: encodedQuery,  // Modify this line to use contains instead of startsWith

      },
    },
    include: {
      subreddit: true, // Include the related subreddit information
      _count: true,
    },
    take: 20,
  });

  return new Response(JSON.stringify(results));
}
