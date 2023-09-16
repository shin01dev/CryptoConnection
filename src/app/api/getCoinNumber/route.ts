import { getAuthSession } from "@/lib/auth";
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch token information from the database
    const tokenData = await db.crypto_key_info.findMany();

    if (!tokenData) {
      return new Response('No token data found', { status: 404 });
    }

    // For each token, get crypto_currency
    const resultData = [];
    for (let token of tokenData) {

      // Fetch corresponding account for this token
      const account = await db.account.findFirst({ where: { userId: session.user.id } });

      // If account exists, get the crypto_currency
      if(account && account.crypto_currency) {
        resultData.push({
          ...token,
          crypto_currency: account.crypto_currency
        });
      }
    };

    return new Response(JSON.stringify(resultData));
  } catch (error) {
    console.error(error);
    return new Response(
      'Could not get data at this time. Please try later',
      { status: 500 }
    );
  }
}
