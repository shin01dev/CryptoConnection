// src/app/api/followCount.ts

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
    try {
        const body = await req.json();
        const lastSegment = body.userId;

        const session = await getAuthSession();
        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 });
        }

        // 팔로워 수
        const followersCount = await db.follow.count({
            where: {
                followingId: lastSegment
            }
        });

        // 팔로잉 수
        const followingsCount = await db.follow.count({
            where: {
                followerId: lastSegment
            }
        });

        return new Response(JSON.stringify({ followersCount, followingsCount }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error(error);
        return new Response('Could not fetch follow counts at this time.', { status: 500 });
    }
}
