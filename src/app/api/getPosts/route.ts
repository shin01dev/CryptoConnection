import { getAuthSession } from "@/lib/auth";
import { db } from '@/lib/db';
import { json } from "stream/consumers";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import PostFeed from '@/components/PostFeed'

export async function POST(req: any) {
    if (req.method !== 'POST') {
        throw new Error("Method not allowed");
    }
    
    const session = await getAuthSession();
    
    if (!session || !session.user || !session.user.id) {
        throw new Error('Authentication required.');
    }

    const body = await req.json(); // Parse the request body as JSON

    const userId = body.userId as string; // Access userId from the parsed JSON

    if (!userId) {
        throw new Error('User ID is required.');
    }

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
            take: INFINITE_SCROLL_PAGINATION_RESULTS,

        });


        
        return new Response(JSON.stringify(posts));
    } catch (error) {
        console.error('Error fetching postsㄴㄴㄴ:', error);
        throw new Error('An error occurred while fetching posts.');
    }
}
