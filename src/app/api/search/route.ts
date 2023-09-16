
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q');

  if (!q) return new Response('Invalid query', { status: 400 });

  const encodedQuery = encodeURIComponent(q);  // 인코딩된 검색어 생성
  const results = await db.subreddit.findMany({
    where: {
      name: {
        // startsWith: encodedQuery,  // 인코딩된 검색어를 사용해 검색
        contains: encodedQuery,  // Modify this line to use contains instead of startsWith

      },
    },
    include: {
      _count: true,
    },
    take: 5,
  });

  return new Response(JSON.stringify(results));
}
