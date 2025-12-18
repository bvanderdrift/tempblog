import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { ConfirmPublishDialog } from '@/components/ConfirmPublishDialog'
import { Button } from '@/components/ui/button'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { ChevronRight, MessageCircle, Send, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import Markdown from 'react-markdown'
import { api } from '../../../convex/_generated/api'
import { Comment, type CommentData } from './-components/Comment'

export const Route = createFileRoute('/posts/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const post = useQuery(api.posts.getBySlug, { slug })
  const deletePost = useMutation(api.posts.remove)
  const publishPost = useMutation(api.posts.publish)

  const comments: CommentData[] = useMemo(() => {
    if (!post?.comments) return []
    return post.comments
      .filter((comment) => comment.author !== null)
      .map((comment) => ({
        id: comment._id,
        author: {
          name: comment.author!.name,
          avatarUrl: comment.author!.avatarUrl,
        },
        content: comment.content,
        upvotes: comment.upvotes,
        createdAt: new Date(comment._creationTime),
      }))
  }, [post?.comments])

  const handleDelete = async () => {
    if (!post) return
    await deletePost({ id: post._id })
    navigate({ to: '/' })
  }

  const handlePublish = async () => {
    if (!post) return
    await publishPost({ id: post._id })
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
        <div className="flex gap-1">
          {post.publishedAt === null && (
            <ConfirmPublishDialog onConfirm={handlePublish}>
              <Button variant="outline" size="sm">
                <Send className="size-4 mr-1" />
                Publish
              </Button>
            </ConfirmPublishDialog>
          )}
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
      </div>
      <div className="prose prose-neural dark:prose-invert">
        <Markdown>{post.body}</Markdown>
      </div>

      {/* Comments Section */}
      <section className="mt-12 pt-8 border-t border-border">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Thoughts from your readers</h2>
          {comments.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </div>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No comments yet.</p>
            <p className="text-sm mt-1">
              Your readers will share their thoughts soon!
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
