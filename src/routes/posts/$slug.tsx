import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ChevronRight } from 'lucide-react'
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
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground transition-colors">
          Posts
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{post.title}</span>
      </nav>
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {post.publishedAt === null
          ? 'Draft'
          : new Date(post.publishedAt).toLocaleDateString()}
      </p>
      <div className="whitespace-pre-wrap">{post.body}</div>
    </div>
  )
}
