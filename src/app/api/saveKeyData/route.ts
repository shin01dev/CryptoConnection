import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { mint, wallet, privateKey, fromTokenAccountAddress } = body;

    if (!mint || !wallet || !privateKey || !fromTokenAccountAddress) {
      return new Response('Missing parameters', { status: 400 })
    }

    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // privateKey 배열을 문자열로 변환
    const privateKeyAsString = privateKey.map(Number).join(',');

    // 데이터베이스에 저장할 토큰 정보
    const tokenData = {
      mint,
      fromWallet: wallet,
      privateKey: privateKeyAsString,
      fromTokenAccountAddress
    };

    // Store token information in the database
    await db.crypto_key_info.create({
      data: tokenData,
    });

    return new Response('OK')
  } catch (error) {
    console.error(error);
    return new Response(
      'Could not save data at this time. Please try later',
      { status: 500 }
    );
  }
}
