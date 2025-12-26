import { ConfirmPublishDialog } from '@/components/ConfirmPublishDialog'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation as useConvexMutation } from 'convex/react'
import { ChevronRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/posts/new')({
  component: RouteComponent,
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function RouteComponent() {
  const navigate = useNavigate()
  const createPostConvex = useConvexMutation(api.posts.create)
  const { mutateAsync: createPost, isPending } = useMutation({
    mutationFn: async (args: Parameters<typeof createPostConvex>[0]) => {
      return await createPostConvex(args)
    },
  })

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = async (publishedAt: number | null) => {
    const slug = slugify(title)
    await createPost({ title, slug, body, publishedAt })
    navigate({ to: '/posts/$slug', params: { slug } })
  }

  const isFormValid = title.trim() && body.trim()

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground transition-colors">
          Posts
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">New Post</span>
      </nav>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(null)
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="My awesome post"
            required
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-1">
            Content
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border rounded-md px-3 py-2 min-h-[200px]"
            placeholder="Write your post..."
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary" disabled={isPending}>
            Save as Draft
            {isPending && <Loader2 className="size-4 animate-spin" />}
          </Button>
          <ConfirmPublishDialog onConfirm={() => handleSubmit(Date.now())}>
            <Button type="button" disabled={isPending || !isFormValid}>
              Publish
              {isPending && <Loader2 className="size-4 animate-spin" />}
            </Button>
          </ConfirmPublishDialog>
        </div>
      </form>
    </div>
  )
}
