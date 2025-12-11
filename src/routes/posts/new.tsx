import { Button } from '@/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/posts/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const createPost = useMutation(api.posts.create)
  const [slug, setSlug] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createPost({ slug, body, publishedAt: null })
    navigate({ to: '/posts/$slug', params: { slug } })
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="my-post-slug"
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
        <Button type="submit">Save Draft</Button>
      </form>
    </div>
  )
}
