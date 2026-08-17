import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// --------------------------------------------------------------------------
// AuthContext — the "single source of truth" for authentication state.
//
// It does two things:
//  1. On first mount it calls supabase.auth.getSession() to check if the
//     browser already has a valid JWT (stored in localStorage by the SDK).
//  2. It subscribes to onAuthStateChange so any sign-in / sign-out /
//     token-refresh that happens *anywhere* in the app is immediately
//     reflected here. Every component that calls useAuth() re-renders
//     automatically.
// --------------------------------------------------------------------------

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)   // Supabase session object
  const [user, setUser] = useState(null)          // Shortcut → session.user
  const [loading, setLoading] = useState(true)    // True until first check

  useEffect(() => {
    // 1) Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2) Listen for future changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // 3) Clean up the listener when AuthProvider unmounts
    return () => subscription.unsubscribe()
  }, [])

  // signUp creates the Supabase auth user AND immediately inserts a row
  // in the `profiles` table so the username / display_name are stored.
  const signUp = async ({ email, password, username, displayName }) => {
    // Step 1 — create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName }, // stored in auth.users.raw_user_meta_data
      },
    })
    if (error) return { error }

    // Step 2 — insert profile row (RLS allows users to insert their own row)
    // We do this right after signup so the profile exists immediately.
    // If you set up a DB trigger (on auth.users INSERT → profiles INSERT)
    // in Supabase, you can remove this step.
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        display_name: displayName,
      })
      if (profileError) return { error: profileError }
    }

    return { data }
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = { session, user, loading, signUp, signIn, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook — any component can call `const { user } = useAuth()`.
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
