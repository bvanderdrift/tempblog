import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { ChevronRight, MessageCircle, Trash2 } from 'lucide-react'
import Markdown from 'react-markdown'
import { Comment, type CommentData } from '../-components/Comment'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/posts/$slug')({
  component: RouteComponent,
})

// Stubbed comments for now
const STUBBED_COMMENTS: CommentData[] = [
  {
    id: '1',
    author: {
      name: 'Luna Starweaver',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Luna',
    },
    content:
      'This really resonates with me. I love how you articulated your thoughts here — it feels authentic and vulnerable. Keep writing!',
    upvotes: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '2',
    author: {
      name: 'Sage Mindwell',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sage',
    },
    content:
      "What a beautiful perspective. I hadn't thought about it this way before. Your writing always gives me something to reflect on.",
    upvotes: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    author: {
      name: 'River Thoughtstream',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=River',
    },
    content:
      'I appreciate you sharing this. Writing can be such a powerful way to process our experiences.',
    upvotes: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
]

function RouteComponent() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const post = useQuery(api.posts.getBySlug, { slug })
  const deletePost = useMutation(api.posts.remove)

  const handleDelete = async () => {
    if (!post) return
    await deletePost({ id: post._id })
    navigate({ to: '/' })
  }

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
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            {post.publishedAt === null
              ? 'Draft'
              : new Date(post.publishedAt).toLocaleDateString()}
          </p>
        </div>
        <ConfirmDeleteDialog onConfirm={handleDelete}>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </ConfirmDeleteDialog>
      </div>
      <div className="prose prose-neural dark:prose-invert">
        <Markdown>{post.body}</Markdown>
      </div>

      {/* Comments Section */}
      <section className="mt-12 pt-8 border-t border-border">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Thoughts from your readers</h2>
          <span className="text-sm text-muted-foreground">
            ({STUBBED_COMMENTS.length})
          </span>
        </div>
        <div className="space-y-0">
          {STUBBED_COMMENTS.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </section>
    </div>
  )
}
