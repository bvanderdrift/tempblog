import { getAuthUserId } from '@convex-dev/auth/server'
import { zid } from 'convex-helpers/server/zod4'
import { z } from 'zod'
import { agents } from '../prompt-engineering/agents'
import { internal } from './_generated/api'
import { Doc, Id } from './_generated/dataModel'
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
  /** @deprecated use author instead */
  authorId: z
    .union([zid('agents'), zid('users'), z.string()])
    .nullable()
    .optional(),
  author: z
    .union([
      z.object({
        type: z.literal('agent'),
        id: zid('agents'),
      }),
      z.object({
        type: z.literal('user'),
        id: zid('users'),
      }),
      z.object({
        type: z.literal('hardcoded-agent'),
        id: z.string(),
      }),
    ])
    .nullable()
    .optional(),
  content: z.string(),
  upvotes: z.number(),
})

export type Comment = z.infer<typeof commentSchema>

export const create = zInternalMutation({
  args: commentSchema.omit({ authorId: true }),
  handler: async (ctx, args) => {
    return await ctx.db.insert('comments', {
      postId: args.postId,
      parentCommentId: args.parentCommentId ?? null,
      author: args.author ?? null,
      content: args.content,
      upvotes: args.upvotes,
    })
  },
})

/**
 * Fetches the full thread from the root comment down to the specified comment.
 * Returns an array of comments ordered from root to the target comment.
 */
export const getThreadToComment = zInternalQuery({
  args: { commentId: zid('comments') },
  handler: async (ctx, args) => {
    const thread: Doc<'comments'>[] = []
    let currentId: Id<'comments'> | null | undefined = args.commentId

    // Walk up the parent chain to build the thread
    while (currentId) {
      const comment: Doc<'comments'> | null = await ctx.db.get(currentId)
      if (!comment) break
      thread.unshift(comment) // Add to front to maintain root-to-leaf order
      currentId = comment.parentCommentId
    }

    return thread
  },
})

export const replyToCommentAsAgent = zInternalAction({
  args: {
    userCommentId: zid('comments'),
    agentId: z.string(),
  },
  handler: async (ctx, args) => {
    // Get the full thread from root to the user's comment
    const thread = await ctx.runQuery(
      internal.comments.getThreadToComment,
      {
        commentId: args.userCommentId,
      },
    )

    const postId = thread[0].postId

    // Get the post for context
    const post = await ctx.runQuery(internal.posts.get, {
      postId,
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Find the agent
    const agent = agents.find((agent) => agent._id === args.agentId)

    if (!agent) {
      throw new Error('Agent not found')
    }

    // Generate the agent's reply with full thread context
    const replyContent = await generateReply(agent, post, thread)

    // Create the agent's reply as a response to the user's comment
    await ctx.runMutation(internal.comments.create, {
      postId,
      parentCommentId: args.userCommentId,
      author: { type: 'hardcoded-agent', id: args.agentId },
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
      author: { type: 'user', id: currentUserId },
      content: args.content,
      upvotes: 0,
    })

    // Determine if parent is from an agent (new author field or legacy authorId)
    const parentAuthor = parentComment.author
    const legacyAuthorId = parentComment.authorId

    const agentId = parentAuthor?.id ?? legacyAuthorId ?? null

    if (!agentId) {
      return replyId
    }

    // Schedule agent to reply to user's comment
    await ctx.scheduler.runAfter(0, internal.comments.replyToCommentAsAgent, {
      userCommentId: replyId,
      agentId,
    })

    return replyId
  },
})
