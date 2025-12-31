import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { ConfirmPublishDialog } from '@/components/ConfirmPublishDialog'
import { Button } from '@/components/ui/button'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { ChevronRight, MessageCircle, Pencil, Send, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import Markdown from 'react-markdown'
import z from 'zod'
import { api } from '../../../convex/_generated/api'
import { Comment, type CommentData } from './-components/Comment'
import { PostForm, slugify } from './-components/PostForm'

export const Route = createFileRoute('/posts/$slug')({
  component: RouteComponent,
  validateSearch: z.object({
    editing: z.boolean().optional(),
  }),
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const { editing } = Route.useSearch()
  const navigate = Route.useNavigate()
  const post = useQuery(api.posts.getBySlug, { slug })
  const deletePost = useMutation(api.posts.remove)
  const publishPost = useMutation(api.posts.publish)
  const updatePost = useMutation(api.posts.update)

  const comments: CommentData[] = useMemo(() => {
    if (!post?.comments) return []
    return post.comments.map((comment) => ({
      id: comment._id,
      author: comment.author,
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

  const handleEdit = () => {
    navigate({
      search: { editing: true },
      replace: true,
      resetScroll: false,
    })
  }

  const handleCancelEdit = () => {
    navigate({
      search: {},
      replace: true,
      resetScroll: false,
    })
  }

  const handleUpdate = async (data: { title: string; body: string }) => {
    if (!post) return
    const newSlug = slugify(data.title)
    await updatePost({
      id: post._id,
      title: data.title,
      body: data.body,
      slug: newSlug,
    })
    navigate({ search: {}, replace: true, resetScroll: false })
  }

  if (post === undefined) {
    return <div>Loading...</div>
  }

  if (post === null) {
    return <div>Post not found</div>
  }

  if (editing) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground transition-colors">
            Posts
          </Link>
          <ChevronRight className="size-4" />
          <Link
            to="/posts/$slug"
            params={{ slug }}
            search={{}}
            className="hover:text-foreground transition-colors"
          >
            {post.title}
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground">Edit</span>
        </nav>
        <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
        <PostForm
          initialTitle={post.title}
          initialBody={post.body}
          isPublished={post.publishedAt !== null}
          isPending={false}
          onSubmit={handleUpdate}
          onCancel={handleCancelEdit}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
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
          <ConfirmDeleteDialog onConfirm={handleDelete}>
            <Button variant="outline" size="sm">
              <Trash2 className="size-4 mr-1" />
              Delete
            </Button>
          </ConfirmDeleteDialog>
          {post.publishedAt === null && (
            <>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="size-4 mr-1" />
                Edit
              </Button>
              <ConfirmPublishDialog onConfirm={handlePublish}>
                <Button variant="outline" size="sm">
                  <Send className="size-4 mr-1" />
                  Publish
                </Button>
              </ConfirmPublishDialog>
            </>
          )}
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
            {post.publishedAt === null ? (
              <>
                <p>Publish your post to start receiving comments.</p>
                <p className="text-sm mt-1 mb-4">
                  Your AI readers are eager to share their thoughts!
                </p>
                <ConfirmPublishDialog onConfirm={handlePublish}>
                  <Button>
                    <Send className="size-4 mr-1" />
                    Publish
                  </Button>
                </ConfirmPublishDialog>
              </>
            ) : (
              <>
                <p>No comments yet.</p>
                <p className="text-sm mt-1">
                  Your readers will share their thoughts soon!
                </p>
              </>
            )}
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
