import { getAuthSession } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (session && session.user && session.user.id) {
      return new Response(JSON.stringify({ userId: session.user.id }));
    } else {
      return new Response('No user ID found in the session', { status: 404 });
    }
  } catch (error) {
    return new Response('Could not fetch user ID', { status: 500 });
  }
}
