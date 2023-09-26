import { getAuthSession } from "@/lib/auth";
import { db } from '@/lib/db';
import { URL } from 'url';

export async function GET(req: Request) {
    try {
        const session = await getAuthSession();

        // if (!session?.user) {
        //     return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
        // }

        // Assuming req has a 'url' property which is a string containing the full URL
        const parsedURL = new URL(req.url!);
        const postId = parsedURL.searchParams.get('postId');

        if (!postId) {
            return new Response(JSON.stringify({ message: 'Invalid parameters' }), { status: 400 });
        }

        const postsWithMatchingId = await db.post.findMany({
            where: {
                id: postId
            },
            select: {
                donateCoin: true
            }
        });

        const donateCoins = postsWithMatchingId.map(post => post.donateCoin);

        return new Response(JSON.stringify(donateCoins), { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Could not get data at this time. Please try later' }), { status: 500 });
    }
}
