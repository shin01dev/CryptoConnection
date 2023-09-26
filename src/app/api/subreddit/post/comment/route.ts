import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CommentValidator } from '@/lib/validators/comment'
import { z } from 'zod'

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const { postId, text, replyToId, donationInput } = CommentValidator.parse(body)

    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Find the post by postId
    const post = await db.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return new Response('Post not found', { status: 404 })
    }

    // Find the account by post authorId
    const authorAccount = await db.account.findUnique({
      where: { userId: post.authorId },
    })

    if (!authorAccount) {
      return new Response('Author Account not found', { status: 404 })
    }

    // Find the account by session user id
    const userAccount = await db.account.findUnique({
      where: { userId: session.user.id },
    })

    if (!userAccount) {
      return new Response('User Account not found', { status: 404 })
    }

    // Update the crypto_currency value in the author account
    const authorCurrentCryptoCurrencyValue = parseFloat(authorAccount.crypto_currency || '0');
    const donationValue = parseFloat(donationInput ? donationInput.toString() : '0');
    const updatedAuthorCryptoCurrencyValue = (authorCurrentCryptoCurrencyValue + donationValue).toString();
    
    await db.account.update({
      where: { userId: authorAccount.userId },
      data: { crypto_currency: updatedAuthorCryptoCurrencyValue },
    });

    // Update the crypto_currency value in the user account
    const userCurrentCryptoCurrencyValue = parseFloat(userAccount.crypto_currency || '0');
    const updatedUserCryptoCurrencyValue = (userCurrentCryptoCurrencyValue - donationValue).toString();

    if (parseFloat(updatedUserCryptoCurrencyValue) < 0) {
      return new Response('Insufficient funds in the user account', { status: 400 })
    }

    await db.account.update({
      where: { userId: userAccount.userId },
      data: { crypto_currency: updatedUserCryptoCurrencyValue },
    });

    // Create a new comment
    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
        notification: "on", 
        donationInput: donationInput !== null && donationInput !== undefined ? donationInput.toString() : null,
      },
    })

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
