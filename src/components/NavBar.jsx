// src/components/NavBar.jsx
// Persistent navigation — floating glass dock (mobile), top frosted glass header (desktop).

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Home, Users, User, LogOut, Sparkles } from 'lucide-react'

export default function NavBar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const profilePath = user ? `/profile/${user.id}` : '/login'

  const navItems = [
    { to: '/feed', icon: Home, label: 'Feed' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: profilePath, icon: User, label: 'Profile' },
  ]

  return (
    <>
      {/* ---- Desktop Top Navigation ---- */}
      <header className="hidden md:flex fixed top-0 inset-x-0 z-50 h-16 items-center justify-between px-8 glass-nav">
        {/* Brand */}
        <NavLink to="/feed" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white text-base font-black">◉</span>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            Cirvy
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 ml-1">
            <Sparkles className="w-3 h-3" />
            Private
          </span>
        </NavLink>

        {/* Navigation links */}
        <nav className="flex items-center gap-1.5 p-1 rounded-2xl glass-pill">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'btn-primary-gradient shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User actions */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:inline max-w-[150px] truncate">
              {user.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ---- Mobile Bottom Floating Dock ---- */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-50 flex justify-center">
        <nav className="w-full max-w-sm glass-nav rounded-2xl p-1.5 shadow-2xl flex items-center justify-around border border-white/20 dark:border-white/10">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'btn-primary-gradient shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px]">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[11px]">Logout</span>
          </button>
        </nav>
      </div>
    </>
  )
}
