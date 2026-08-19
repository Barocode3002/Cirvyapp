// src/components/NavBar.jsx
// Persistent Header and Bottom Navigation matching the refined Cirvy design system.

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import SettingsModal from './SettingsModal'
import CirvyLogo from './CirvyLogo'

export default function NavBar() {
  const { user, signOut } = useAuth()
  const { lang, dark, toggleLang, toggleTheme, t, showToast } = useUI()
  const navigate = useNavigate()

  const profilePath = user ? `/profile/${user.id}` : '/login'

  const navItems = [
    { to: '/feed', icon: 'fa-solid fa-house', label: t('navFeed') },
    { to: '/friends', icon: 'fa-solid fa-user-group', label: t('navFriends') },
    { to: '/search', icon: 'fa-solid fa-magnifying-glass', label: t('navSearch') },
    { to: profilePath, icon: 'fa-solid fa-user', label: t('navProfile') },
  ]

  const handleLogout = async () => {
    if (window.confirm(t('logoutConfirm') || 'Are you sure you want to log out?')) {
      await signOut()
      showToast(t('loggedOut') || 'You have been logged out securely.')
      navigate('/login')
    }
  }

  return (
    <>
      {/* ============ STICKY HEADER ============ */}
      <header className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between max-w-md md:max-w-2xl mx-auto w-full transition-all duration-300">
        <NavLink to="/feed" className="flex items-center gap-3 group">
          <CirvyLogo variant="icon" size={36} showGlow />
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <p className="font-display font-extrabold text-[17px] text-main tracking-tight group-hover:text-[#4A7A8C] transition-colors">
                {t('brand')}
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FBC94] animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-sub tracking-wider uppercase">
              {t('shieldLabel')}
            </p>
          </div>
        </NavLink>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="w-9 h-9 rounded-xl field flex items-center justify-center text-xs font-mono font-semibold scale-tap transition-all hover:border-[#4A7A8C] cursor-pointer"
            title="Toggle Language"
          >
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl field flex items-center justify-center scale-tap transition-all hover:border-[#4A7A8C] cursor-pointer text-sub hover:text-main"
            title="Toggle Theme"
          >
            <i className={`fa-solid ${dark ? 'fa-moon' : 'fa-sun'} text-sm`} />
          </button>

          {/* Logout Button (if logged in) */}
          {user && (
            <button
              onClick={handleLogout}
              className="h-9 px-3 rounded-xl field flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 hover:border-red-500/30 scale-tap transition-all cursor-pointer"
              title={t('logout') || 'Log Out'}
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
              <span className="hidden sm:inline">{t('logout') || 'Log Out'}</span>
            </button>
          )}
        </div>
      </header>

      {/* ============ BOTTOM NAV ============ */}
      <nav
        id="bottomNav"
        className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-2xl mx-auto glass border-t px-3 pt-2 z-30 shadow-lg"
        style={{
          borderColor: 'var(--card-border)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
        }}
      >
        <div className="grid grid-cols-4">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item flex flex-col items-center gap-1 py-1.5 rounded-xl scale-tap transition-all cursor-pointer ${
                  isActive
                    ? 'active text-[#4A7A8C] font-semibold'
                    : 'text-sub hover:text-main'
                }`
              }
            >
              <i className={`${icon} nav-ico text-[18px]`} />
              <span className="nav-dot w-1.5 h-1.5 rounded-full bg-[#8FBC94]" />
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Settings Modal (Global) */}
      <SettingsModal />
    </>
  )
}
