import { ConfirmPublishDialog } from '@/components/ConfirmPublishDialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface PostFormProps {
  initialTitle?: string
  initialBody?: string
  isPublished?: boolean
  isPending: boolean
  onSubmit: (data: {
    title: string
    body: string
    publishedAt: number | null
  }) => void
  onCancel?: () => void
}

export function PostForm({
  initialTitle = '',
  initialBody = '',
  isPublished = false,
  isPending,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)

  const isFormValid = title.trim() && body.trim()

  const handleSubmit = (publishedAt: number | null) => {
    onSubmit({ title, body, publishedAt })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(isPublished ? Date.now() : null)
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
          className="w-full border rounded-md px-3 py-2 min-h-[400px]"
          placeholder="Write your post..."
          required
        />
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        {isPublished ? (
          <Button type="submit" disabled={isPending || !isFormValid}>
            Save Changes
            {isPending && <Loader2 className="size-4 animate-spin" />}
          </Button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </form>
  )
}
