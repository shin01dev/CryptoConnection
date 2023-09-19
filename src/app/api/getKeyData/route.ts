// src/app/api/getKeyData

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

const coinPrivateKey = process.env.COIN_PRIVATE_KEY;
if (!coinPrivateKey) {
  console.error("COIN_PRIVATE_KEY is not set in the environment.");
  return new Response('Internal Server Error', { status: 500 });
}
// For each token, convert private key from string to array
tokenData.forEach((token:any) => {
  const privateKeyAsString = coinPrivateKey; // 변경: token.privateKey 대신 coinPrivateKey 사용

  // Convert privateKey from string to array
  const privateKeyAsArray = privateKeyAsString.split(',').map(Number);

  // Replace string private key with array private key in the token data
  token.privateKey = privateKeyAsArray;
});

    return new Response(JSON.stringify(tokenData));
  } catch (error) {
    console.error(error);
    return new Response(
      'Could not get data at this time. Please try later',
      { status: 500 }
    );
  }
}
