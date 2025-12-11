import { createFileRoute } from '@tanstack/react-router'
import { useConvexAuth } from 'convex/react'
import { LoginView } from './-components/LoginView'
import { PostsList } from './-components/PostsList'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth()

  return (
    <div>
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
