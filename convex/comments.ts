import { getAuthUserId } from '@convex-dev/auth/server'
import { zid } from 'convex-helpers/server/zod4'
import { z } from 'zod'
import { agents } from '../prompt-engineering/agents'
import { internal } from './_generated/api'
import { generateReply } from './prompting'
import {
  zInternalAction,
  zInternalMutation,
  zInternalQuery,
  zMutation,
} from './zodConvex'

export const commentSchema = z.object({
  postId: zid('posts'),
  parentCommentId: zid('comments').nullable().optional(),
  authorId: z.union([zid('agents'), z.string()]).nullable(),
  content: z.string(),
  upvotes: z.number(),
})

export const create = zInternalMutation({
  args: commentSchema,
  handler: async (ctx, args) => {
    return await ctx.db.insert('comments', {
      postId: args.postId,
      parentCommentId: args.parentCommentId ?? null,
      authorId: args.authorId,
      content: args.content,
      upvotes: args.upvotes,
    })
  },
})

export const getCommentInternal = zInternalQuery({
  args: { commentId: zid('comments') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.commentId)
  },
})

export const replyToCommentAsAgent = zInternalAction({
  args: {
    userCommentId: zid('comments'),
    agentId: z.string(),
  },
  handler: async (ctx, args) => {
    // Get the user's comment that we're replying to
    const userComment = await ctx.runQuery(
      internal.comments.getCommentInternal,
      {
        commentId: args.userCommentId,
      },
    )

    if (!userComment) {
      throw new Error('User comment not found')
    }

    // Get the post for context
    const post = await ctx.runQuery(internal.posts.get, {
      postId: userComment.postId,
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Find the agent
    const agent = agents.find((agent) => agent._id === args.agentId)

    if (!agent) {
      throw new Error('Agent not found')
    }

    // Generate the agent's reply to the user's comment
    const replyContent = await generateReply(agent, post, userComment.content)

    // Create the agent's reply as a response to the user's comment
    await ctx.runMutation(internal.comments.create, {
      postId: userComment.postId,
      parentCommentId: args.userCommentId,
      authorId: args.agentId,
      content: replyContent,
      upvotes: 0,
    })
  },
})

export const replyToCommentAsUser = zMutation({
  args: {
    parentCommentId: zid('comments'),
    content: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx)

    if (!currentUserId) {
      throw new Error('Unauthorized')
    }

    // Get the parent comment
    const parentComment = await ctx.db.get(args.parentCommentId)

    if (!parentComment) {
      throw new Error('Parent comment not found')
    }

    // Verify the post exists and belongs to the user
    const post = await ctx.db.get(parentComment.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.authorId !== currentUserId) {
      throw new Error('Unauthorized')
    }

    // Create the user's reply
    const replyId = await ctx.db.insert('comments', {
      postId: parentComment.postId,
      parentCommentId: args.parentCommentId,
      authorId: currentUserId,
      content: args.content,
      upvotes: 0,
    })

    if (!parentComment.authorId) {
      return replyId
    }
    // Schedule agent to reply to user's comment
    await ctx.scheduler.runAfter(0, internal.comments.replyToCommentAsAgent, {
      userCommentId: replyId,
      agentId: parentComment.authorId,
    })

    return replyId
  },
})
