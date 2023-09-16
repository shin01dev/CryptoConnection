import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
    try {
      const session = await getAuthSession();
      if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
      }
      
      const userAccountId = session.user.id;

      // Retrieve the public_key_for_crypto_transactions from the database
      const accountInfo = await db.account.findUnique({
        where: {
          userId: userAccountId
        },
        select: {
          public_key_for_crypto_transactions: true
        }
      });

      if (!accountInfo) {
        return new Response('Account not found for this user.', { status: 404 });
      }

      // Return the retrieved value in the response
      return new Response(JSON.stringify({ publicKeyForCrypto: accountInfo.public_key_for_crypto_transactions }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  
    } catch (error) {
      console.error(error);
      return new Response('Could not retrieve the public key for crypto transactions at this time.', { status: 500 });
    }
}
