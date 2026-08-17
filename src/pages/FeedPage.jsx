import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

// --------------------------------------------------------------------------
// FeedPage — placeholder for the friends-only feed.
//
// This is a protected route (see ProtectedRoute in App.jsx). If the user
// isn't logged in, they're redirected to /login before this even mounts.
// We'll flesh this out in a later step with actual posts.
// --------------------------------------------------------------------------

export default function FeedPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Cirvy</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Feed placeholder */}
      <div className="mt-12 flex flex-col items-center gap-2 text-center">
        <p className="text-4xl">🎉</p>
        <h2 className="text-lg font-medium">You&apos;re in!</h2>
        <p className="text-sm text-muted-foreground">
          Your private feed will appear here once we build it out.
        </p>
      </div>
    </div>
  )
}
