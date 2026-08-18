// src/pages/LoginPage.jsx
// Sign In page matching the HTML design, fully wired to Supabase auth.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const { signIn } = useAuth()
  const { t, showToast, lang, toggleLang, dark, toggleTheme } = useUI()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Forgot Password modal
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await signIn({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    showToast(t('loginSuccess'))
    navigate('/feed')
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/login`,
    })

    setForgotLoading(false)
    setShowForgot(false)
    if (error) {
      showToast(error.message)
    } else {
      showToast(t('resetSent'))
    }
  }

  const handleOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/feed`,
      },
    })
    if (error) showToast(error.message)
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md md:max-w-2xl mx-auto relative px-4">
      {/* Header controls */}
      <header className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl accent-bg flex items-center justify-center shrink-0">
            <div className="shield-ring" />
            <i className="fa-solid fa-shield-halved text-white text-sm" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-bold text-[15px] text-main">{t('brand')}</p>
            <p className="text-[10px] font-mono text-sub tracking-wide">
              {t('shieldLabel')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="w-9 h-9 rounded-full field flex items-center justify-center text-xs font-mono font-semibold scale-tap cursor-pointer"
          >
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full field flex items-center justify-center scale-tap cursor-pointer"
          >
            <i className={`fa-solid ${dark ? 'fa-moon' : 'fa-sun'} text-sm`} />
          </button>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex flex-col justify-center py-6 view">
        <div className="text-center mb-6">
          <h1 className="font-display font-extrabold text-2xl text-main">
            {t('authHeadline')}
          </h1>
          <p className="text-sub text-sm mt-2">{t('authSub')}</p>
        </div>

        <div className="glass rounded-3xl p-5 shadow-glass">
          {/* Tab Switcher */}
          <div className="flex mb-6 rounded-full field p-1">
            <button
              onClick={() => {}}
              className="flex-1 py-2 rounded-full text-sm font-semibold transition accent-bg text-white"
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex-1 py-2 rounded-full text-sm font-semibold transition text-sub scale-tap"
            >
              {t('signUp')}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500 font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form id="loginForm" className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-medium text-sub">
                {t('userOrEmail')}
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field w-full rounded-xl px-4 py-3 mt-1 text-sm"
                placeholder={t('userOrEmailPh')}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-sub">
                {t('password')}
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field w-full rounded-xl px-4 py-3 mt-1 text-sm"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email)
                  setShowForgot(true)
                }}
                className="text-xs accent-text font-semibold cursor-pointer scale-tap"
              >
                {t('forgotPassword')}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full accent-bg text-white rounded-xl py-3 font-semibold text-sm scale-tap transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <i className="fa-solid fa-circle-notch fa-spin text-sm" />}
              <span>{t('signInBtn')}</span>
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1" style={{ background: 'var(--card-border)' }} />
            <span className="text-[11px] text-sub">{t('orContinue')}</span>
            <div className="h-px flex-1" style={{ background: 'var(--card-border)' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="field rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium scale-tap transition cursor-pointer"
            >
              <i className="fa-brands fa-google text-[15px]" /> Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('facebook')}
              className="field rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium scale-tap transition cursor-pointer"
            >
              <i className="fa-brands fa-facebook text-[15px] text-[#1877F2]" /> Facebook
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-sub mt-5 flex items-center justify-center gap-1.5">
          <i className="fa-solid fa-lock text-[10px]" />
          <span>{t('authFooter')}</span>
        </p>
      </main>

      {/* ============ MODAL: FORGOT PASSWORD ============ */}
      {showForgot && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
          <div
            className="modal-backdrop absolute inset-0 bg-black/50"
            onClick={() => setShowForgot(false)}
          />
          <div className="modal-panel relative glass w-full md:w-96 rounded-3xl p-6 z-10">
            <div className="w-11 h-11 rounded-full accent-soft-bg flex items-center justify-center mb-4">
              <i className="fa-solid fa-key accent-text" />
            </div>
            <h3 className="font-display font-bold text-lg mb-1">{t('resetTitle')}</h3>
            <p className="text-xs text-sub mb-4">{t('resetSub')}</p>
            <form onSubmit={handleResetPassword}>
              <input
                id="resetEmailInput"
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="field w-full rounded-xl px-4 py-3 text-sm mb-4"
                placeholder="you@cirvy.app"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="flex-1 field rounded-xl py-3 font-semibold text-sm scale-tap cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 accent-bg text-white rounded-xl py-3 font-semibold text-sm scale-tap transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {forgotLoading && (
                    <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                  )}
                  <span>{t('sendLink')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
