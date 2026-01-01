export interface CommentData {
  id: string
  parentCommentId: string | null
  author: {
    _id: string
    name: string
    avatarUrl: string
  } | null
  content: string
  upvotes: number
  createdAt: Date
}

interface CommentProps {
  comment: CommentData
  isInThread?: boolean
}

export function Comment({ comment, isInThread = false }: CommentProps) {
  const authorName = comment.author?.name ?? 'You'
  const authorAvatar = comment.author?.avatarUrl

  // Check if this comment is from the user (not an agent)
  const isUserComment = comment.author === null

  return (
    <article className={`flex gap-3 py-4 ${!isInThread ? '' : 'border-b-0'}`}>
      {authorAvatar ? (
        <img
          src={authorAvatar}
          alt={`${authorName}'s avatar`}
          className="size-10 rounded-full object-cover shrink-0 ring-2 ring-muted"
        />
      ) : isUserComment ? (
        <div className="size-10 rounded-full bg-primary/10 shrink-0 ring-2 ring-primary/20 flex items-center justify-center text-primary text-sm font-medium">
          You
        </div>
      ) : (
        <div className="size-10 rounded-full bg-muted shrink-0 ring-2 ring-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
          ?
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`font-medium ${
              isUserComment
                ? 'text-primary'
                : comment.author
                  ? 'text-foreground'
                  : 'text-muted-foreground italic'
            }`}
          >
            {authorName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
          {comment.content}
        </p>
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
