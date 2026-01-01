import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useConvexMutation } from '@convex-dev/react-query'
import { useMutation } from '@tanstack/react-query'
import { MessageCircleReply, Send } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { Comment, type CommentData } from './Comment'

interface CommentThreadProps {
  thread: CommentData[]
}

export function CommentThread({ thread }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  const replyMutation = useMutation({
    mutationFn: useConvexMutation(api.comments.replyToCommentAsUser),
    onSuccess: () => {
      setReplyContent('')
      setIsReplying(false)
    },
  })

  if (thread.length === 0) return null

  const rootComment = thread[0]
  const replies = thread.slice(1)
  const lastComment = thread[thread.length - 1]

  // Can reply if the last comment in the thread is from an agent (has author)
  const canReply = lastComment.author !== null

  const handleReply = () => {
    if (!replyContent.trim()) return
    replyMutation.mutate({
      parentCommentId: lastComment.id as Id<'comments'>,
      content: replyContent.trim(),
    })
  }

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Root comment */}
      <Comment comment={rootComment} />

      {/* Thread replies - shown indented */}
      {replies.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-muted">
          {replies.map((reply) => (
            <Comment key={reply.id} comment={reply} isInThread />
          ))}
        </div>
      )}

      {/* Reply input */}
      {canReply && (
        <div className="ml-6 pl-4 border-l-2 border-muted pb-4">
          {isReplying ? (
            <div className="pt-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${lastComment.author?.name}...`}
                className="min-h-[80px] text-sm resize-none"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || replyMutation.isPending}
                >
                  <Send className="size-3 mr-1" />
                  {replyMutation.isPending ? 'Sending...' : 'Send'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyContent('')
                  }}
                  disabled={replyMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground mt-1"
              onClick={() => setIsReplying(true)}
            >
              <MessageCircleReply className="size-4 mr-1" />
              Reply to {lastComment.author?.name}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
