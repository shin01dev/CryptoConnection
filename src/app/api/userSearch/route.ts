
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  if (!q) return new Response('Invalid query', { status: 400 });
  const decodedQuery = decodeURIComponent(q);  // 디코딩된 검색어 생성
  console.log(decodedQuery + "이건 디코딩된 쿼리 입니다");

  const results = await db.user.findMany({
    where: {
      username: {
        contains: decodedQuery,  // 'contains'를 사용하여 입력한 검색어가 포함된 사용자를 검색합니다.
      },
    },
    include: {
      _count: true,
    },
    take: 20,
  });

  return new Response(JSON.stringify(results));
}
