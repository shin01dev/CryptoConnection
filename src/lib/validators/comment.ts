import { z } from 'zod'

export const CommentValidator = z.object({
  postId: z.string(),
  text: z.string(),
  replyToId: z.string().optional(),
  donationInput: z.number().nullable().optional(),
})

export type CommentRequest = z.infer<typeof CommentValidator>
