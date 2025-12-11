import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation as useConvexMutation } from 'convex/react'
import { Loader2 } from 'lucide-react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const slug = slugify(title)
    await createPost({ title, slug, body, publishedAt: null })
    navigate({ to: '/posts/$slug', params: { slug } })
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <Button type="submit" disabled={isPending}>
          Save Draft
          {isPending && <Loader2 className="size-4 animate-spin" />}
        </Button>
      </form>
    </div>
  )
}
