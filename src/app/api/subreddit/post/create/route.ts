import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { PostValidator } from '@/lib/validators/post'
import { z } from 'zod'

const recentIPs = new Map();
const recentPosts = new Map();

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { title, content, subredditId, thumbnail, donateCoin,donateTo} = PostValidator.parse(body);

    const session = await getAuthSession()
  
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // verify user is subscribed to passed subreddit id
    const subscription = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    })

    if (!subscription) {
      return new Response('Subscribe to post', { status: 403 })
    }



    const ip = req.headers.get('x-forwarded-for');
    const postKey = `${title}-${content}-${subredditId}-${thumbnail}`;
    const lastPostKey = recentPosts.get(ip);
    const lastRequestTime = recentIPs.get(ip);
    const now = Date.now();
    const TIME_LIMIT = 20000;

    if (lastPostKey === postKey) {
      return new Response('Duplicate post content. Please change the content and try again.', { status: 429 });
    } else if (lastRequestTime && now - lastRequestTime < TIME_LIMIT) {
      return new Response('Too many requests. Please wait a moment.', { status: 429 });
    }


    // 현재 요청 시간 저장
    recentIPs.set(ip, now);
    recentPosts.set(ip, postKey);
    


    // thumbnail을 data에 추가
// donateTo와 donateCoin 값이 있는지 검사
const notificationValue = donateTo && donateCoin ? "on" : undefined;

await db.post.create({
  data: {
    title,
    content,
    authorId: session.user.id,
    subredditId,
    thumbnail,
    donateTo:donateTo,
    donateCoin:donateCoin,
    notification: notificationValue // 조건에 따른 값 설정
  },
})


//후원한 코인 차감하기

const userId = session.user.id;

const account = await db.account.findFirst({ where: { userId: userId } });

if (!account || typeof account.crypto_currency !== 'string') {
  return new Response('Account not found or crypto currency is invalid', { status: 400 });
}



const updatedValue = (parseFloat(account.crypto_currency) - donateCoin).toString();
await db.account.updateMany({
  where: { userId: userId },
  data: { crypto_currency: updatedValue },
});

//

// 현재 값에 UI_Amount만큼 더하기
const accountToGetDonation = await db.account.findFirst({ where: { userId: donateTo } });

// 계정이 존재하는지 확인
if (!accountToGetDonation) {
    throw new Error("Account to receive donation not found.");
}

const updatedCryptoCurrencyValue = parseFloat(accountToGetDonation.crypto_currency || "0") + parseFloat(donateCoin);

// 계정의 crypto_currency 업데이트
await db.account.update({
    where: { id: accountToGetDonation.id }, // 여기에서 'id'를 사용합니다.
    data: { crypto_currency: updatedCryptoCurrencyValue.toString() },
});





    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not post to subreddit at this time. Please try later',
      { status: 500 }
    )
  }
  
}
