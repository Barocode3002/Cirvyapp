// src/components/SettingsModal.jsx
// Next-Gen Privacy Suite modal matching the HTML design.

import { useUI } from '@/contexts/UIContext'

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
  } = useUI()

  if (!showSettings) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center">
      <div
        className="modal-backdrop absolute inset-0 bg-black/50"
        onClick={() => setShowSettings(false)}
      />
      <div className="modal-panel relative glass w-full md:w-[26rem] rounded-t-3xl md:rounded-3xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">{t('privacySuite')}</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="w-8 h-8 rounded-full field flex items-center justify-center scale-tap"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-mono text-sub uppercase tracking-wider mb-2">
            {t('secGeneral')}
          </p>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-ghost w-5 accent-text" />
              <div>
                <p className="text-sm font-medium">{t('ghostMode')}</p>
                <p className="text-xs text-sub">{t('ghostModeDesc')}</p>
              </div>
            </div>
            <div
              className={`switch ${ghostMode ? 'on' : ''}`}
              onClick={() => toggleGhostMode()}
            />
          </div>

          <p className="text-[11px] font-mono text-sub uppercase tracking-wider mb-2 mt-4">
            {t('secScreen')}
          </p>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-stamp w-5 accent-text" />
              <div>
                <p className="text-sm font-medium">{t('watermarkTitle')}</p>
                <p className="text-xs text-sub">{t('watermarkDesc')}</p>
              </div>
            </div>
            <div
              className={`switch ${watermark ? 'on' : ''}`}
              onClick={() => toggleWatermark()}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-fingerprint w-5 accent-text" />
              <div>
                <p className="text-sm font-medium">{t('leakTitle')}</p>
                <p className="text-xs text-sub">{t('leakDesc')}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded-full field">
              {t('comingSoon')}
            </span>
          </div>

          <p className="text-[11px] font-mono text-sub uppercase tracking-wider mb-2 mt-4">
            {t('secEmergency')}
          </p>
          <button
            onClick={engagePanic}
            className="w-full flex items-center gap-3 py-3.5 rounded-xl bg-red-500/10 border border-red-500/30 px-4 mt-1 scale-tap transition cursor-pointer"
          >
            <i className="fa-solid fa-triangle-exclamation text-red-500 w-5" />
            <div className="text-left rtl:text-right">
              <p className="text-sm font-semibold text-red-500">{t('panicLock')}</p>
              <p className="text-xs text-sub">{t('panicDesc')}</p>
            </div>
          </button>

          <p className="text-[11px] font-mono text-sub uppercase tracking-wider mb-2 mt-4">
            {t('secComments')}
          </p>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-user-group w-5 accent-text" />
              <p className="text-sm font-medium">{t('closeFriendsOnly')}</p>
            </div>
            <div
              className="switch"
              onClick={(e) => e.currentTarget.classList.toggle('on')}
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-comment-slash w-5 accent-text" />
              <p className="text-sm font-medium">{t('disableComments')}</p>
            </div>
            <div
              className="switch"
              onClick={(e) => e.currentTarget.classList.toggle('on')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
