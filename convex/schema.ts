import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  ...authTables,
  posts: defineTable({
    body: v.string(),
    authorId: v.id('users'),
    publishedAt: v.union(v.number(), v.null()),
  }).index('by_user', ['authorId']),
})
