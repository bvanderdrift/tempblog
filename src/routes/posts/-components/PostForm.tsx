import { ConfirmPublishDialog } from '@/components/ConfirmPublishDialog'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

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
  onSave: (data: {
    title: string
    body: string
    publishedAt: number | null
    isAutoSave: boolean
  }) => void
  onCancel?: () => void
  onAutoSave?: (data: { title: string; body: string }) => void
  autoSaveInterval?: number
  lastSavedAt?: number
}

export function PostForm({
  initialTitle = '',
  initialBody = '',
  isPublished = false,
  isPending,
  onSave,
  onCancel,
  autoSaveInterval,
  lastSavedAt,
}: PostFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const lastSavedRef = useRef({ title: initialTitle, body: initialBody })

  const isFormValid = title.trim() && body.trim()

  const lastSavedAgoFormatted = useMemo(() => {
    if (!lastSavedAt) return null
    return formatDistanceToNow(new Date(lastSavedAt))
  }, [lastSavedAt])

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveInterval) return

    const intervalId = setInterval(() => {
      const hasChanges =
        title !== lastSavedRef.current.title ||
        body !== lastSavedRef.current.body

      if (hasChanges && title.trim() && body.trim()) {
        onSave({ title, body, publishedAt: null, isAutoSave: true })
        lastSavedRef.current = { title, body }
      }
    }, autoSaveInterval)

    return () => clearInterval(intervalId)
  }, [onSave, autoSaveInterval, title, body])

  const handleSubmit = (publishedAt: number | null) => {
    onSave({ title, body, publishedAt, isAutoSave: false })
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
      <div className="flex gap-2 items-center">
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
        {lastSavedAgoFormatted && (
          <span className="text-sm text-muted-foreground">
            Last auto-saved {lastSavedAgoFormatted} ago
          </span>
        )}
      </div>
    </form>
  )
}
