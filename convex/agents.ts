import { getAuthUserId } from '@convex-dev/auth/server'
import { zid } from 'convex-helpers/server/zod4'
import { z } from 'zod'
import { QueryCtx } from './_generated/server'
import { zMutation, zQuery } from './zodConvex'

export const agentSchema = z.object({
  name: z.string(),
  avatarUrl: z.string(),
  personality: z.string(),
  backstory: z.string(),
  instructions: z.string(),
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
      instructions: args.instructions,
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
      ...(args.instructions !== undefined && {
        instructions: args.instructions,
      }),
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
