import { getAuthUserId } from '@convex-dev/auth/server'
import { zid } from 'convex-helpers/server/zod4'
import { z } from 'zod'
import { query } from './_generated/server'
import { zMutation, zQuery } from './zodConvex'

export const postSchema = z.object({
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  authorId: zid('users'),
  publishedAt: z.union([z.number(), z.null()]),
})

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

export const getBySlug = zQuery({
  args: postSchema.pick({ slug: true }),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx)

    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    const post = await ctx.db
      .query('posts')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()

    if (!post) {
      return null
    }

    // Only return post if it belongs to the current user
    if (post.authorId !== currentUserId) {
      throw new Error('Unauthorized')
    }

    return post
  },
})

export const create = zMutation({
  args: postSchema.omit({ authorId: true }),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx)

    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    return await ctx.db.insert('posts', {
      title: args.title,
      body: args.body,
      authorId: currentUserId,
      publishedAt: args.publishedAt,
      slug: args.slug,
    })
  },
})

export const update = zMutation({
  args: postSchema.omit({ authorId: true }).extend({
    id: zid('posts'),
  }),
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
      title: args.title,
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
