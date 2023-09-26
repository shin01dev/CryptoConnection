import { z } from 'zod'

export const PostValidator = z.object({
  title: z
    .string()
    .min(3, {
      message: '제목은 최소 3글자 이상이어야 합니다',
    })
    .max(128, {
      message: '제목은 128글자를 초과할 수 없습니다',
    }),
  subredditId: z.string(),
  content: z.any(),
  postId: z.string().optional(), 
  thumbnail: z.string().nullable().optional(),
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
