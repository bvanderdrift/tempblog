import { Button } from '@/components/ui/button'
import { useAuthActions } from '@convex-dev/auth/react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useConvexAuth } from 'convex/react'
import { Github, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { signIn: signInAction } = useAuthActions()
  const { isAuthenticated } = useConvexAuth()

  const { mutate: signIn, isPending } = useMutation({
    mutationFn: async () => {
      const response = await signInAction('github')
      return response
    },
  })

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {isAuthenticated ? (
        <div>Welcome back!</div>
      ) : (
        <Button onClick={() => signIn()}>
          <Github className="size-4" /> Sign in with GitHub
          {isPending && <Loader2 className="size-4 animate-spin" />}
        </Button>
      )}
    </div>
  )
}
