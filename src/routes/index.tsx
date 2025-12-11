import { createFileRoute } from '@tanstack/react-router'
import { useConvexAuth } from 'convex/react'
import { LoginView } from './-components/LoginView'
import { PostsList } from './-components/PostsList'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {isLoading ? (
        <div>Loading...</div>
      ) : isAuthenticated ? (
        <PostsList />
      ) : (
        <LoginView />
      )}
    </div>
  )
}
