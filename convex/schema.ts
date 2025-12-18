import { authTables } from '@convex-dev/auth/server'
import { zodOutputToConvex } from 'convex-helpers/server/zod4'
import { defineSchema, defineTable } from 'convex/server'
import { agentSchema } from './agents'
import { commentSchema } from './comments'
import { postSchema } from './posts'

export default defineSchema({
  ...authTables,
  agents: defineTable(zodOutputToConvex(agentSchema)),
  posts: defineTable(zodOutputToConvex(postSchema))
    .index('by_user', ['authorId'])
    .index('by_slug', ['slug']),
  comments: defineTable(zodOutputToConvex(commentSchema)).index('by_post', [
    'postId',
  ]),
})
