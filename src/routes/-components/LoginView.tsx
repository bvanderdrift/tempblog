import { Button } from '@/components/ui/button'
import { useAuthActions } from '@convex-dev/auth/react'
import { useMutation } from '@tanstack/react-query'
import { Github, Loader2 } from 'lucide-react'

export function LoginView() {
  const { signIn: signInAction } = useAuthActions()

  const { mutate: signIn, isPending } = useMutation({
    mutationFn: async () => {
      const response = await signInAction('github')
      return response
    },
  })

  return (
    <Button onClick={() => signIn()}>
      <Github className="size-4" /> Sign in with GitHub
      {isPending && <Loader2 className="size-4 animate-spin" />}
    </Button>
  )
}
