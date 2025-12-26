import { Button } from '@/components/ui/button'
import { useAuthActions } from '@convex-dev/auth/react'
import { useMutation } from '@tanstack/react-query'
import { Github, Loader2, Lock, MessageCircle, PenLine } from 'lucide-react'

export function LoginView() {
  const { signIn: signInAction } = useAuthActions()

  const { mutate: signIn, isPending } = useMutation({
    mutationFn: async () => {
      const response = await signInAction('github')
      return response
    },
  })

  return (
    <div className="relative overflow-hidden flex-1 flex items-center justify-center">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        {/* Hero Content */}
        <div className="max-w-2xl text-center space-y-8">
          {/* Logo/Brand mark */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <PenLine className="w-8 h-8 text-primary" />
          </div>

          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-foreground">
              Write freely.
              <br />
              <span className="text-primary">Be heard.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
              A private space to express yourself, with thoughtful AI readers
              who genuinely engage with your words—no public exposure required.
            </p>
          </div>

          {/* Value props */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span>Completely private</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>Thoughtful responses</span>
            </div>
            <div className="flex items-center gap-2">
              <PenLine className="w-4 h-4 text-primary" />
              <span>Write without pressure</span>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={() => signIn()}
              className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Github className="size-5" />
              Start writing privately
              {isPending && <Loader2 className="size-4 animate-spin" />}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Sign in with GitHub to begin your private journal
            </p>
          </div>
        </div>

        {/* Testimonial-style quote */}
        <div className="mt-16 max-w-md text-center">
          <blockquote className="text-muted-foreground/80 italic text-sm leading-relaxed">
            "Sometimes you just want to write without worrying who's watching.
            Here, your words matter—to readers who always listen."
          </blockquote>
        </div>
      </div>
    </div>
  )
}
