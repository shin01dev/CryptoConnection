import { z } from 'zod'

export const UsernameValidator = z.object({
  name: z.string().min(1).max(9).refine(name => {
    const isValidKorean = (name.match(/[가-힣]/g) || []).length <= 10;
    const isValidEnglish = (name.match(/[a-zA-Z0-9_]/g) || []).length <= 10;

    return isValidKorean && isValidEnglish;
  }, {
    message: "9글자까지 허용됩니다.",
    path: [],
  })
})
