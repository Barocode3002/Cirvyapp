import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

// --------------------------------------------------------------------------
// ProtectedRoute — a wrapper component for routes that require auth.
//
// How it works:
//  • While AuthContext is still checking for an existing session (loading),
//    we show a centered spinner so the page doesn't flash.
//  • If there's no user after loading finishes → redirect to /login.
//  • Otherwise, render the child route (via `children`).
//
// Usage in router:
//   <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
// --------------------------------------------------------------------------

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
