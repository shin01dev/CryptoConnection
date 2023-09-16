import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: any) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const body = await req.json()

    const userAccountId = session.user.id;
    const newPublicKey = body.newPublicKey;

    // Check if an account with the same public_key_for_crypto_transactions already exists
    const existingAccount = await db.account.findFirst({
      where: {
        public_key_for_crypto_transactions: newPublicKey
      }
    });

    if (existingAccount) {
      // If an account with the same public key already exists, return an error response
      return new Response('An account with this public key for crypto transactions already exists.', { status: 400 });
    }

    // If no account with the same public key exists, update the current account
    await db.account.update({
      where: {
        userId: userAccountId
      },
      data: {
        public_key_for_crypto_transactions: newPublicKey,
        public_key:newPublicKey
      }
    });

    // Return the updated value in the response
    return new Response(JSON.stringify({ publicKeyForCrypto: newPublicKey }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error(error);
    return new Response('Could not update the public key for crypto transactions at this time.', { status: 500 });
  }
}
