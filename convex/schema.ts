import { authTables } from '@convex-dev/auth/server'
import { zodOutputToConvex } from 'convex-helpers/server/zod4'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { agentSchema } from './agents'
import { commentSchema } from './comments'
import { postSchema } from './posts'

export default defineSchema({
  ...authTables,
  users: defineTable({
    // Overrides the default users schema. DO NOT TOUCH THIS SECTION
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    /** Extension section */
    permissions: v.optional(v.array(v.literal('agents-admin'))),
  })
    .index('email', ['email'])
    .index('phone', ['phone']),
  agents: defineTable(zodOutputToConvex(agentSchema)),
  posts: defineTable(zodOutputToConvex(postSchema))
    .index('by_user', ['authorId'])
    .index('by_slug', ['slug']),
  comments: defineTable(zodOutputToConvex(commentSchema)).index('by_post', [
    'postId',
  ]),
})
