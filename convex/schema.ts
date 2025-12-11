import { authTables } from '@convex-dev/auth/server'
import { zodOutputToConvex } from 'convex-helpers/server/zod4'
import { defineSchema, defineTable } from 'convex/server'
import { postSchema } from './posts'

export default defineSchema({
  ...authTables,
  posts: defineTable(zodOutputToConvex(postSchema))
    .index('by_user', ['authorId'])
    .index('by_slug', ['slug']),
})
