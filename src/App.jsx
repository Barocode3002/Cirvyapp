import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignupPage from '@/pages/SignupPage'
import LoginPage from '@/pages/LoginPage'
import FeedPage from '@/pages/FeedPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import ProfilePage from '@/pages/ProfilePage'

// --------------------------------------------------------------------------
// App — the router shell.
//
// Route map:
//  /signup  → public  → create an account
//  /login   → public  → sign in
//  /feed    → private → friends-only feed (wrapped in ProtectedRoute)
//  /        → redirect to /feed (which bounces to /login if not authed)
//
// AuthProvider lives in main.jsx so it wraps the entire router.
// --------------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        {/* Catch-all → go to feed (ProtectedRoute will redirect if needed) */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
