import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/contexts/AuthContext'
import App from './App.jsx'
import './index.css'

// --------------------------------------------------------------------------
// Entry point — mounts the app with AuthProvider at the very top.
//
// Why AuthProvider wraps App?
//  Because App contains the router, and the router needs auth state
//  (ProtectedRoute checks useAuth()). Putting the provider here means
//  every component in the tree — pages, layout, nav — can call useAuth().
// --------------------------------------------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
