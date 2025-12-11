import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/posts/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const post = useQuery(api.posts.getBySlug, { slug })

  if (post === undefined) {
    return <div>Loading...</div>
  }

  if (post === null) {
    return <div>Post not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <p className="text-sm text-muted-foreground mb-4">
        {post.publishedAt === null
          ? 'Draft'
          : new Date(post.publishedAt).toLocaleDateString()}
      </p>
      <div className="whitespace-pre-wrap">{post.body}</div>
    </div>
  )
}
