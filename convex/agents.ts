import { getAuthUserId } from '@convex-dev/auth/server'
import { zid } from 'convex-helpers/server/zod4'
import { z } from 'zod'
import { internal } from './_generated/api'
import { QueryCtx } from './_generated/server'
import { generateComment } from './prompting'
import { zInternalAction, zInternalQuery, zMutation, zQuery } from './zodConvex'

export const agentSchema = z.object({
  name: z.string(),
  avatarUrl: z.string(),
  personality: z.string().optional(),
  backstory: z.string(),
  writingStyle: z
    .object({
      roleplayInstruction: z.string(),
      voice: z.string(),
      keywords: z.array(z.string()),
      sentenceStructure: z.string(),
      focusTopics: z.string(),
      negativeConstraints: z.string(),
      exampleResponse: z.string(),
    })
    .optional(),
})

export type Agent = z.infer<typeof agentSchema>

async function requireAgentsAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await ctx.db.get(userId)
  if (!user?.permissions?.includes('agents-admin')) {
    throw new Error('Forbidden: requires agents-admin permission')
  }

  return userId
}

export const list = zQuery({
  args: {},
  handler: async (ctx) => {
    await requireAgentsAdmin(ctx)
    return await ctx.db.query('agents').collect()
  },
})

export const get = zQuery({
  args: { id: zid('agents') },
  handler: async (ctx, args) => {
    await requireAgentsAdmin(ctx)
    return await ctx.db.get(args.id)
  },
})

export const create = zMutation({
  args: agentSchema,
  handler: async (ctx, args) => {
    await requireAgentsAdmin(ctx)

    return await ctx.db.insert('agents', {
      name: args.name,
      avatarUrl: args.avatarUrl,
      personality: args.personality,
      backstory: args.backstory,
    })
  },
})

export const update = zMutation({
  args: agentSchema.partial().extend({
    id: zid('agents'),
  }),
  handler: async (ctx, args) => {
    await requireAgentsAdmin(ctx)

    const agent = await ctx.db.get(args.id)

    if (!agent) {
      throw new Error('Agent not found')
    }

    return await ctx.db.patch(args.id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.avatarUrl !== undefined && { avatarUrl: args.avatarUrl }),
      ...(args.personality !== undefined && { personality: args.personality }),
      ...(args.backstory !== undefined && { backstory: args.backstory }),
    })
  },
})

export const remove = zMutation({
  args: { id: zid('agents') },
  handler: async (ctx, args) => {
    await requireAgentsAdmin(ctx)

    const agent = await ctx.db.get(args.id)

    if (!agent) {
      throw new Error('Agent not found')
    }

    // Set authorId to null for all comments by this agent
    const comments = await ctx.db
      .query('comments')
      .withIndex('by_author', (q) => q.eq('authorId', args.id))
      .collect()

    await Promise.all(
      comments.map((comment) => ctx.db.patch(comment._id, { authorId: null })),
    )

    return await ctx.db.delete(args.id)
  },
})

export const comment = zInternalAction({
  args: {
    postId: zid('posts'),
    agentId: zid('agents'),
  },
  handler: async (ctx, args) => {
    const post = await ctx.runQuery(internal.agents.getPostInternal, {
      postId: args.postId,
    })

    if (!post) {
      throw new Error('Post not found')
    }

    const agent = await ctx.runQuery(internal.agents.getAgentInternal, {
      agentId: args.agentId,
    })

    if (!agent) {
      throw new Error('Agent not found')
    }

    const commentContent = await generateComment(agent, post)

    await ctx.runMutation(internal.comments.create, {
      postId: args.postId,
      authorId: args.agentId,
      content: commentContent,
      upvotes: 0,
    })
  },
})

export const getPostInternal = zInternalQuery({
  args: { postId: zid('posts') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId)
  },
})

export const getAgentInternal = zInternalQuery({
  args: { agentId: zid('agents') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId)
  },
})
