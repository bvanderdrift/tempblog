import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation as useConvexMutation } from 'convex/react'
import { ChevronRight } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { PostForm, slugify } from './-components/PostForm'

export const Route = createFileRoute('/posts/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const createPostConvex = useConvexMutation(api.posts.create)
  const { mutateAsync: createPost, isPending } = useMutation({
    mutationFn: async (args: Parameters<typeof createPostConvex>[0]) => {
      return await createPostConvex(args)
    },
  })

  const handleSubmit = async (data: {
    title: string
    body: string
    publishedAt: number | null
  }) => {
    const slug = slugify(data.title)
    await createPost({
      title: data.title,
      slug,
      body: data.body,
      publishedAt: data.publishedAt,
    })
    navigate({ to: '/posts/$slug', params: { slug } })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground transition-colors">
          Posts
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">New Post</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6">New Post</h1>
      <PostForm isPending={isPending} onSubmit={handleSubmit} />
    </div>
  )
}
