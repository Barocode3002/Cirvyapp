// src/components/NavBar.jsx
// Persistent Header and Bottom Navigation matching the HTML design.

import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import SettingsModal from './SettingsModal'

export default function NavBar() {
  const { user } = useAuth()
  const { lang, dark, toggleLang, toggleTheme, t } = useUI()

  const profilePath = user ? `/profile/${user.id}` : '/login'

  const navItems = [
    { to: '/feed', icon: 'fa-solid fa-house', label: t('navFeed') },
    { to: '/friends', icon: 'fa-solid fa-user-group', label: t('navFriends') },
    { to: '/search', icon: 'fa-solid fa-magnifying-glass', label: t('navSearch') },
    { to: profilePath, icon: 'fa-solid fa-user', label: t('navProfile') },
  ]

  return (
    <>
      {/* ============ STICKY HEADER ============ */}
      <header className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between max-w-md md:max-w-2xl mx-auto w-full">
        <NavLink to="/feed" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl accent-bg flex items-center justify-center shrink-0 shadow-sm">
            <div className="shield-ring" />
            <i className="fa-solid fa-shield-halved text-white text-sm" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-bold text-[15px] text-main">{t('brand')}</p>
            <p className="text-[10px] font-mono text-sub tracking-wide">
              {t('shieldLabel')}
            </p>
          </div>
        </NavLink>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="w-9 h-9 rounded-full field flex items-center justify-center text-xs font-mono font-semibold scale-tap transition cursor-pointer"
            title="Toggle Language"
          >
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full field flex items-center justify-center scale-tap transition cursor-pointer"
            title="Toggle Theme"
          >
            <i className={`fa-solid ${dark ? 'fa-moon' : 'fa-sun'} text-sm`} />
          </button>
        </div>
      </header>

      {/* ============ BOTTOM NAV ============ */}
      <nav
        id="bottomNav"
        className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-2xl mx-auto glass border-t px-2 pt-2 z-30"
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
                `nav-item flex flex-col items-center gap-1 py-1.5 scale-tap transition cursor-pointer ${
                  isActive ? 'active' : ''
                }`
              }
            >
              <i className={`${icon} nav-ico text-[17px]`} />
              <span className="nav-dot w-1 h-1 rounded-full accent-bg" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Settings Modal (Global) */}
      <SettingsModal />
    </>
  )
}
