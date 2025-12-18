import { getAuthUserId } from '@convex-dev/auth/server'
import { zid } from 'convex-helpers/server/zod4'
import OpenAI from 'openai'
import { z } from 'zod'
import { internal } from './_generated/api'
import { QueryCtx } from './_generated/server'
import { zInternalAction, zInternalQuery, zMutation, zQuery } from './zodConvex'

export const agentSchema = z.object({
  name: z.string(),
  avatarUrl: z.string(),
  personality: z.string(),
  backstory: z.string(),
})

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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const systemPrompt = `You are ${agent.name}, a blog reader leaving a comment.

PERSONALITY: ${agent.personality}

BACKSTORY: ${agent.backstory}

Write a genuine, thoughtful comment responding to the blog post below. Stay in character and make the comment feel authentic and personal. Keep it concise (1-3 paragraphs). Do not use any markdown formatting - write plain text only.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Blog Post Title: ${post.title}\n\n${post.body}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    const commentContent = response.choices[0]?.message?.content

    if (!commentContent) {
      throw new Error('Failed to generate comment')
    }

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
