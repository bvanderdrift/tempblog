import { getAuthUserId } from '@convex-dev/auth/server'
import { zid } from 'convex-helpers/server/zod4'
import { z } from 'zod'
import { query } from './_generated/server'
import { zMutation } from './zodConvex'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx)

    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    return await ctx.db
      .query('posts')
      .withIndex('by_user', (q) => q.eq('authorId', currentUserId))
      .collect()
  },
})

export const create = zMutation({
  args: {
    body: z.string(),
    publishedAt: z.union([z.number(), z.null()]),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx)

    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    return await ctx.db.insert('posts', {
      body: args.body,
      authorId: currentUserId,
      publishedAt: args.publishedAt,
    })
  },
})

export const update = zMutation({
  args: {
    id: zid('posts'),
    body: z.string(),
    publishedAt: z.union([z.number(), z.null()]),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx)

    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    const post = await ctx.db.get(args.id)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorId !== currentUserId) {
      throw new Error('Unauthorized')
    }

    return await ctx.db.patch(args.id, {
      body: args.body,
      publishedAt: args.publishedAt,
    })
  },
})

export const remove = zMutation({
  args: {
    id: zid('posts'),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx)

    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    const post = await ctx.db.get(args.id)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorId !== currentUserId) {
      throw new Error('Unauthorized')
    }

    return await ctx.db.delete(args.id)
  },
})
