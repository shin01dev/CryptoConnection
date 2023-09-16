import { getAuthSession } from "@/lib/auth";
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch user's account information from the database using userId
    const account = await db.account.findFirst({
      where: { userId: session.user.id },
      select: {
        userId: true,  // This line selects only the userId field
      },
    });

    if (!account) {
      return new Response('No account data found for the user', { status: 404 });
    }

    return new Response(JSON.stringify(account));
  } catch (error) {
    console.error(error);
    return new Response(
      'Could not get data at this time. Please try later',
      { status: 500 }
    );
  }
}
