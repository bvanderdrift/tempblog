import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'
import { useState } from 'react'

export interface CommentData {
  id: string
  author: {
    name: string
    avatarUrl: string
  }
  content: string
  upvotes: number
  createdAt: Date
}

interface CommentProps {
  comment: CommentData
}

export function Comment({ comment }: CommentProps) {
  const [upvotes, setUpvotes] = useState(comment.upvotes)
  const [hasUpvoted, setHasUpvoted] = useState(false)

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes((prev) => prev - 1)
      setHasUpvoted(false)
    } else {
      setUpvotes((prev) => prev + 1)
      setHasUpvoted(true)
    }
  }

  return (
    <article className="flex gap-3 py-4 border-b border-border last:border-b-0">
      <img
        src={comment.author.avatarUrl}
        alt={`${comment.author.name}'s avatar`}
        className="size-10 rounded-full object-cover shrink-0 ring-2 ring-muted"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-foreground">
            {comment.author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-2">
          {comment.content}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant={hasUpvoted ? 'secondary' : 'ghost'}
            size="sm"
            onClick={handleUpvote}
            className={`h-7 px-2 gap-1 ${hasUpvoted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ChevronUp
              className={`size-4 transition-transform ${hasUpvoted ? 'scale-110' : ''}`}
            />
            <span className="text-xs font-medium tabular-nums">{upvotes}</span>
          </Button>
        </div>
      </div>
    </article>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

