import { getAuthUserId } from '@convex-dev/auth/server'
import { zid } from 'convex-helpers/server/zod4'
import { z } from 'zod'
import { MINUTE, SECOND } from '../src/lib/time'
import { internal } from './_generated/api'
import { Id } from './_generated/dataModel'
import { MutationCtx, query } from './_generated/server'
import { zMutation, zQuery } from './zodConvex'

async function scheduleAgentComments(ctx: MutationCtx, postId: Id<'posts'>) {
  const agents = await ctx.db.query('agents').collect()

  await Promise.all(
    agents.map(async (agent) => {
      const DEV_INSTANT_FLAG = true
      const isInstant = DEV_INSTANT_FLAG && process.env.IS_DEBUG === 'true'

      const minWaitMs = 5 * SECOND
      const maxWaitMs = 10 * MINUTE
      const waitMs =
        Math.floor(Math.random() * (maxWaitMs - minWaitMs + 1)) + minWaitMs
      await ctx.scheduler.runAfter(
        isInstant ? 0 : waitMs,
        internal.agents.comment,
        {
          postId,
          agentId: agent._id,
        },
      )
    }),
  )
}

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

    // Fetch comments for this post
    const comments = await ctx.db
      .query('comments')
      .withIndex('by_post', (q) => q.eq('postId', post._id))
      .collect()

    // Fetch agent data for each comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = comment.authorId
          ? await ctx.db.get(comment.authorId)
          : null
        return {
          ...comment,
          author,
        }
      }),
    )

    return {
      ...post,
      comments: commentsWithAuthors,
    }
  },
})

export const create = zMutation({
  args: postSchema.omit({ authorId: true }),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx)

    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    const postId = await ctx.db.insert('posts', {
      title: args.title,
      body: args.body,
      authorId: currentUserId,
      publishedAt: args.publishedAt,
      slug: args.slug,
    })

    // If publishing immediately, schedule agent comments
    if (args.publishedAt !== null) {
      await scheduleAgentComments(ctx, postId)
    }

    return postId
  },
})

export const update = zMutation({
  args: postSchema.omit({ authorId: true, publishedAt: true }).extend({
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

    // Delete all comments for this post first
    const comments = await ctx.db
      .query('comments')
      .withIndex('by_post', (q) => q.eq('postId', args.id))
      .collect()

    await Promise.all(comments.map((comment) => ctx.db.delete(comment._id)))

    return await ctx.db.delete(args.id)
  },
})

export const publish = zMutation({
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

    if (post.publishedAt !== null) {
      throw new Error('Post already published')
    }

    await scheduleAgentComments(ctx, args.id)

    return await ctx.db.patch(args.id, {
      publishedAt: Date.now(),
    })
  },
})
