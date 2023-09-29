import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { PostVoteValidator } from '@/lib/validators/vote'
import { CachedPost } from '@/types/redis'
import { z } from 'zod'

const CACHE_AFTER_UPVOTES = 1



async function awardTokens(post: { author: { id: string; }; id: string; subreddit: { id: string; name: string; createdAt: Date; updatedAt: Date; creatorId: string | null; } | null; }, votesAmt: number) {
  let tokenAmountToGive = 0;
  let tokenLevel = '';

  const currentDate = new Date();
  const authorId = post.author.id;

  if (votesAmt === 1) {
    tokenLevel = '1';
  } else if (votesAmt == 2) {
    tokenLevel = '2';
  }

  // 해당 유저에 대한 오늘 생성된 giveCryptoUser 레코드를 검색합니다.
  const recordsForToday = await db.giveCryptoUser.findMany({
    where: {
      userId: authorId,
      createdAt: {
        gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0), // 오늘의 시작 시간
        lte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59) // 오늘의 마지막 시간
      }
    }
  });

  // 해당 레벨의 레코드가 오늘 생성되었는지 확인합니다.
  const hasLevelForToday = recordsForToday.some(record => record.level === tokenLevel);

  if (hasLevelForToday) {
    return; // 해당 레벨의 레코드가 이미 있다면, 함수를 종료합니다.
  }

  if (votesAmt === 1) {
    tokenAmountToGive = 30;
  } else if (votesAmt == 2) {
    tokenAmountToGive = 80;
  }

  if (tokenAmountToGive > 0) {
    const account = await db.account.findFirst({
      where: {
        userId: authorId,
      },
    });

    if (account && account.crypto_currency) {
      await db.account.update({
        where: {
          id: account.id,
        },
        data: {
          crypto_currency: String(Number(account.crypto_currency) + tokenAmountToGive),
        },
      });
      if (post.subreddit) {
        await db.giveCryptoUser.create({
          data: {
            Time: new Date().toISOString(),
            postId: post.id,
            TokenAmount: String(tokenAmountToGive),
            userId: authorId,
            subredditName: post.subreddit.name,
            notification: "on",
            level: tokenLevel,
          },
        });
      }
    }
  }
}



async function calculateVotesAmt(postId: any) {
  const post = await db.post.findUnique({
      where: {
          id: postId,
      },
      include: {
          votes: true,
      },
  });

  if (!post) return 0;  // 만약 post가 null이면 0을 반환합니다.

  return post.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') return acc + 1;
      if (vote.type === 'DOWN') return acc - 1;
      return acc;
  }, 0);
}


export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const { postId, voteType } = PostVoteValidator.parse(body)

    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // check if user has already voted on this post
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    })
  
    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
        subreddit: true,  // Add this line to include subreddit in the post object
      },
    });
    

    if (!post) {
      return new Response('Post not found', { status: 404 })
    }

    if (existingVote) {
      // if vote type is the same as existing vote, delete the vote
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        })

      // 투표 합계 다시 계산
    const votesAmt = await calculateVotesAmt(postId);
    // 여기에 vote_Sum 업데이트 코드 추가
await db.post.update({
  where: {
    id: postId,
  },
  data: {
    vote_Sum: (votesAmt), // String 형태로 저장합니다. (vote_Sum 필드가 String 타입이므로)
  },
});
    await awardTokens(post, votesAmt);



        if (votesAmt >= CACHE_AFTER_UPVOTES) {
          const cachePayload: CachedPost = {
            authorUsername: post.author.username ?? '',
            content: JSON.stringify(post.content),
            id: post.id,
            title: post.title,
            currentVote: null,
            createdAt: post.createdAt,
          }

          await redis.hset(`post:${postId}`, cachePayload) // Store the post data as a hash
        }

        return new Response('OK')
      }

      // if vote type is different, update the vote
      await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      })
      const votesAmt = await calculateVotesAmt(postId);
// 여기에 vote_Sum 업데이트 코드 추가
await db.post.update({
  where: {
    id: postId,
  },
  data: {
    vote_Sum: (votesAmt), // String 형태로 저장합니다. (vote_Sum 필드가 String 타입이므로)
  },
});
      await awardTokens(post, votesAmt);


      if (votesAmt >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          authorUsername: post.author.username ?? '',
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote: voteType,
          createdAt: post.createdAt,
        }

        await redis.hset(`post:${postId}`, cachePayload) // Store the post data as a hash
      }

      return new Response('OK')
    }

    // if no existing vote, create a new vote
    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId,
        notification:"on"
      },
    })

    const votesAmt = await calculateVotesAmt(postId);
// 여기에 vote_Sum 업데이트 코드 추가
await db.post.update({
  where: {
    id: postId,
  },
  data: {
    vote_Sum: (votesAmt), // String 형태로 저장합니다. (vote_Sum 필드가 String 타입이므로)
  },
});
    await awardTokens(post, votesAmt);


    if (votesAmt >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        authorUsername: post.author.username ?? '',
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        currentVote: voteType,
        createdAt: post.createdAt,
      }

      await redis.hset(`post:${postId}`, cachePayload)
    }

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
