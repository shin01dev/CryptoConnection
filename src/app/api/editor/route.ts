import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
    try {
        // 세션 정보 가져오기
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 });
        }
        const body = await req.json();

        const params = body.slug; // req에서 params를 추출하기 위해 이 코드를 추가했습니다. 실제 요청 형식에 따라 다를 수 있습니다.
        console.log(decodeURIComponent(params)+"파람스")
        const subreddit = await db.subreddit.findFirst({
            where: {
                name: params,
            },
        });

        const decodename = decodeURIComponent(params);
        
        if (!subreddit) return new Response('Subreddit not found.', { status: 404 });

        // TODO: 이곳에 다른 로직 추가 (예를 들어 decodename를 사용하는 부분이 필요하다면 여기에 추가)

        return new Response(JSON.stringify({ subreddit, decodename }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error(error);
        return new Response('Could not retrieve the subreddit at this time.', { status: 500 });
    }
}
