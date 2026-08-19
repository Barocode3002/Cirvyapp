// src/components/SettingsModal.jsx
// Next-Gen Privacy Suite modal matching the Cirvy design system.

import { useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function SettingsModal() {
  const {
    showSettings,
    setShowSettings,
    ghostMode,
    toggleGhostMode,
    watermark,
    toggleWatermark,
    engagePanic,
    t,
    showToast,
  } = useUI()

  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!showSettings) return null

  const handleLogout = async () => {
    setShowSettings(false)
    if (window.confirm(t('logoutConfirm') || 'Are you sure you want to log out?')) {
      await signOut()
      showToast(t('loggedOut') || 'You have been logged out securely.')
      navigate('/login')
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="modal-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowSettings(false)}
      />
      <div className="modal-panel relative glass w-full md:w-[28rem] rounded-t-3xl md:rounded-3xl p-6 max-h-[85vh] overflow-y-auto border shadow-2xl" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4A7A8C]/15 flex items-center justify-center text-[#4A7A8C]">
              <i className="fa-solid fa-shield-halved text-sm" />
            </div>
            <h3 className="font-display font-bold text-lg text-main">{t('privacySuite')}</h3>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="w-8 h-8 rounded-full field flex items-center justify-center scale-tap hover:border-[#4A7A8C] cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-mono text-sub uppercase tracking-wider mb-2 font-semibold">
              {t('secGeneral')}
            </p>
            <div className="flex items-center justify-between py-2 px-3 rounded-2xl field">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-ghost w-5 text-[#8FBC94]" />
                <div>
                  <p className="text-sm font-semibold text-main">{t('ghostMode')}</p>
                  <p className="text-xs text-sub">{t('ghostModeDesc')}</p>
                </div>
              </div>
              <div
                className={`switch ${ghostMode ? 'on' : ''}`}
                onClick={() => toggleGhostMode()}
              />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-mono text-sub uppercase tracking-wider mb-2 font-semibold">
              {t('secScreen')}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-2xl field">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-stamp w-5 text-[#4A7A8C]" />
                  <div>
                    <p className="text-sm font-semibold text-main">{t('watermarkTitle')}</p>
                    <p className="text-xs text-sub">{t('watermarkDesc')}</p>
                  </div>
                </div>
                <div
                  className={`switch ${watermark ? 'on' : ''}`}
                  onClick={() => toggleWatermark()}
                />
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-2xl field opacity-80">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-fingerprint w-5 text-[#4A7A8C]" />
                  <div>
                    <p className="text-sm font-semibold text-main">{t('leakTitle')}</p>
                    <p className="text-xs text-sub">{t('leakDesc')}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8FBC94]/20 text-[#4A7A8C] dark:text-[#8FBC94] font-bold">
                  {t('comingSoon')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-mono text-sub uppercase tracking-wider mb-2 font-semibold">
              {t('secEmergency')}
            </p>
            <button
              onClick={engagePanic}
              className="w-full flex items-center gap-3 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 scale-tap transition cursor-pointer hover:bg-red-500/15"
            >
              <i className="fa-solid fa-triangle-exclamation text-red-500 w-5" />
              <div className="text-left rtl:text-right">
                <p className="text-sm font-semibold text-red-500">{t('panicLock')}</p>
                <p className="text-xs text-sub">{t('panicDesc')}</p>
              </div>
            </button>
          </div>

          {user && (
            <div className="pt-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl field text-red-500 hover:bg-red-500/10 hover:border-red-500/30 font-semibold text-xs md:text-sm scale-tap transition cursor-pointer"
              >
                <i className="fa-solid fa-arrow-right-from-bracket" />
                <span>{t('logout') || 'Log Out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
