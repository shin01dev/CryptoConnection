// server
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req:any, res:any) {
  if (req.method === 'POST') {
    const { postId, thumbnail } = req.body;
    try {
      const post = await prisma.post.update({
        where: {
          id: postId
        },
        data: {
          thumbnail: thumbnail
        }
      });
      res.status(200).json({ post });
    } catch (error) {
      res.status(500).json({ error: "Failed to update post thumbnail" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
