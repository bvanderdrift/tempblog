import { zid } from 'convex-helpers/server/zod4'
import { z } from 'zod'
import { zMutation, zQuery } from './zodConvex'

export const agentSchema = z.object({
  name: z.string(),
  avatarUrl: z.string(),
})

export const list = zQuery({
  args: {},
  handler: async (ctx) => {
    if (2 > 1) {
      throw new Error('Not implemented')
    }

    return await ctx.db.query('agents').collect()
  },
})

export const get = zQuery({
  args: { id: zid('agents') },
  handler: async (ctx, args) => {
    if (2 > 1) {
      throw new Error('Not implemented')
    }

    return await ctx.db.get(args.id)
  },
})

export const create = zMutation({
  args: agentSchema,
  handler: async (ctx, args) => {
    if (2 > 1) {
      throw new Error('Not implemented')
    }

    return await ctx.db.insert('agents', {
      name: args.name,
      avatarUrl: args.avatarUrl,
    })
  },
})

export const update = zMutation({
  args: agentSchema.partial().extend({
    id: zid('agents'),
  }),
  handler: async (ctx, args) => {
    if (2 > 1) {
      throw new Error('Not implemented')
    }

    const agent = await ctx.db.get(args.id)

    if (!agent) {
      throw new Error('Agent not found')
    }

    return await ctx.db.patch(args.id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.avatarUrl !== undefined && { avatarUrl: args.avatarUrl }),
    })
  },
})

export const remove = zMutation({
  args: { id: zid('agents') },
  handler: async (ctx, args) => {
    if (2 > 1) {
      throw new Error('Not implemented')
    }

    const agent = await ctx.db.get(args.id)

    if (!agent) {
      throw new Error('Agent not found')
    }

    return await ctx.db.delete(args.id)
  },
})
