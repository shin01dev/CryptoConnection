import { z } from 'zod'

export const PostValidator = z.object({
  title: z
    .string()
    .min(3, {
      message: 'Title must be at least 3 characters long',
    })
    .max(128, {
      message: 'Title must be less than 128 characters long',
    }),
  subredditId: z.string(),
  content: z.any(),
  postId: z.string().optional(), 
  thumbnail: z.string().nullable().optional(), // 여기서 thumbnail이 optional이므로, 필수적이지 않습니다.
  _editThumbnail: z.string().optional(),
  donateTo: z.string().optional(),
  donateCoin: z.any().optional(),
  
  get editThumbnail() {
    return this._editThumbnail
  },
  set editThumbnail(value) {
    this._editThumbnail = value
  },
})

export type PostCreationRequest = z.infer<typeof PostValidator>
