import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

export function PostsList() {
  const posts = useQuery(api.posts.list)
  const deletePost = useMutation(api.posts.remove)

  // Sort posts: nulls first, then by publishedAt descending
  const sortedPosts = posts?.slice().sort((a, b) => {
    if (a.publishedAt === null && b.publishedAt === null) return 0
    if (a.publishedAt === null) return -1
    if (b.publishedAt === null) return 1
    return b.publishedAt - a.publishedAt
  })

  const handleDelete = async (id: Id<'posts'>) => {
    await deletePost({ id })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Posts</h1>
        <Button asChild>
          <Link to="/posts/new">
            <Plus className="size-4" /> New Post
          </Link>
        </Button>
      </div>
      {sortedPosts === undefined ? (
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Loading posts...
        </div>
      ) : sortedPosts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Start writing!</p>
      ) : (
        <ul className="space-y-4">
          {sortedPosts.map((post) => (
            <li key={post._id} className="relative group">
              <Link
                to="/posts/$slug"
                params={{ slug: post.slug }}
                className="block border rounded-lg p-4 pr-12 hover:bg-muted/50 transition-colors"
              >
                <p className="whitespace-pre-wrap">{post.body}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {post.publishedAt === null
                    ? 'Draft'
                    : new Date(post.publishedAt).toLocaleDateString()}
                </p>
              </Link>
              <ConfirmDeleteDialog onConfirm={() => handleDelete(post._id)}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </ConfirmDeleteDialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
