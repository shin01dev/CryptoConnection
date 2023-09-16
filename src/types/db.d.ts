import type { Post, Subreddit, User, Vote, Comment } from '@prisma/client'

export type ExtendedPost = Post & {
  votes: Vote[]
  author: User
  comments: Comment[]
  subreddit: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    creatorId: string | null;
  } | null; // <-- | null을 통해 null값 허용
}

// types.ts
export interface Post {
  id: number;
  title: string;
  content: string;
  // other properties...
}
