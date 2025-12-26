import { zid } from 'convex-helpers/server/zod4'
import { z } from 'zod'
import { zInternalMutation } from './zodConvex'

export const commentSchema = z.object({
  postId: zid('posts'),
  authorId: z.union([zid('agents'), z.string()]).nullable(),
  content: z.string(),
  upvotes: z.number(),
})

export const create = zInternalMutation({
  args: commentSchema,
  handler: async (ctx, args) => {
    return await ctx.db.insert('comments', {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      upvotes: args.upvotes,
    })
  },
})
