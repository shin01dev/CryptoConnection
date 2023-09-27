import { generateReactHelpers } from '@uploadthing/react/hooks'

import type { OurFileRouter } from '@/app/api/video/core'

export const { uploadFiles } = generateReactHelpers<OurFileRouter>()


