// src/pages/LoginPage.jsx
// Sign In page featuring the official Cirvy color palette, logo, and zero-tracking security.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { supabase } from '@/lib/supabase'
import CirvyLogo from '@/components/CirvyLogo'

export default function LoginPage() {
  const { signIn } = useAuth()
  const { t, showToast, lang, dark, toggleLang, toggleTheme } = useUI()
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

    // Check lockout
    const { data: isLocked } = await supabase.rpc('check_login_lock', {
      p_email: email,
    })

    if (isLocked) {
      setError('Too many failed attempts. This account is temporarily locked. Please try again in 15 minutes.')
      setLoading(false)
      return
    }

    const { error: signInError } = await signIn({ email, password })

    await supabase.rpc('record_login_attempt', {
      p_email: email,
      p_success: !signInError,
    })

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
    <div className="min-h-screen flex flex-col max-w-md md:max-w-xl mx-auto relative px-4 py-3 selection:bg-[#8FBC94]/30">
      {/* Header controls */}
      <header className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <CirvyLogo variant="icon" size={32} showGlow />
          <span className="text-xs font-mono font-bold tracking-wider text-main uppercase">
            {t('brand')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="w-9 h-9 rounded-xl field flex items-center justify-center text-xs font-mono font-semibold scale-tap hover:border-[#4A7A8C] cursor-pointer"
            title="Toggle Language"
          >
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>
          <button onClick={toggleTheme} className="w-9 h-9 rounded-xl field flex items-center justify-center text-xs font-semibold scale-tap hover:border-[#4A7A8C] cursor-pointer" title={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'} text-sm`} />
          </button>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex flex-col justify-center py-4 view">
        {/* Brand Hero */}
        <div className="text-center mb-6 flex flex-col items-center">
          <CirvyLogo variant="full" size={48} className="mb-3" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wide bg-[#8FBC94]/15 text-[#4A7A8C] dark:text-[#8FBC94] border border-[#8FBC94]/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#8FBC94] animate-ping" />
            <span>{t('shieldLabel')}</span>
          </div>
          <h1 className="font-display font-extrabold text-xl md:text-2xl text-main max-w-sm leading-tight">
            {t('authHeadline')}
          </h1>
          <p className="text-sub text-xs md:text-sm mt-1.5 max-w-xs">
            {t('authSub')}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-6 shadow-xl border" style={{ borderColor: 'var(--card-border)' }}>
          {/* Tabs */}
            <div className="flex mb-6 rounded-2xl p-1 bg-[#D1E0E3] border border-[#D1E0E3]">
            <button
              onClick={() => {}}
              className="flex-1 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-sm text-[#F5F7F8]"
              style={{ backgroundColor: '#4A7A8C' }}
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex-1 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all text-sub hover:text-main scale-tap"
            >
              {t('signUp')}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-[#D1E0E3] border border-[#4A7A8C] p-3 text-xs text-[#2E3B42] font-medium flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form id="loginForm" className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-main mb-1.5">
                {t('userOrEmail')}
              </label>
              <div className="relative">
                <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-sub text-xs rtl:left-auto rtl:right-3.5" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field w-full rounded-xl pl-9 pr-4 py-3 text-sm rtl:pl-4 rtl:pr-9"
                  placeholder={t('userOrEmailPh')}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-main">
                  {t('password')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email)
                    setShowForgot(true)
                  }}
                  className="text-[11px] font-semibold text-[#4A7A8C] dark:text-[#8FBC94] hover:underline cursor-pointer"
                >
                  {t('forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-sub text-xs rtl:left-auto rtl:right-3.5" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field w-full rounded-xl pl-9 pr-4 py-3 text-sm rtl:pl-4 rtl:pr-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-[#F5F7F8] rounded-xl py-3.5 font-semibold text-sm scale-tap transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              style={{ backgroundColor: '#4A7A8C' }}
            >
              {loading && <i className="fa-solid fa-circle-notch fa-spin text-sm" />}
              <span>{t('signInBtn')}</span>
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1" style={{ background: 'var(--card-border)' }} />
            <span className="text-[11px] font-mono text-sub uppercase tracking-wider">{t('orContinue')}</span>
            <div className="h-px flex-1" style={{ background: 'var(--card-border)' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="field rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs md:text-sm font-medium scale-tap hover:border-[#4A7A8C] transition-all cursor-pointer"
            >
              <i className="fa-brands fa-google text-[14px]" /> Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('facebook')}
              className="field rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs md:text-sm font-medium scale-tap hover:border-[#4A7A8C] transition-all cursor-pointer"
            >
              <i className="fa-brands fa-facebook text-[14px] text-[#1877F2]" /> Facebook
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-sub mt-5 flex items-center justify-center gap-1.5 max-w-xs mx-auto leading-relaxed">
          <i className="fa-solid fa-shield-halved text-[11px] text-[#8FBC94]" />
          <span>{t('authFooter')}</span>
        </p>
      </main>

      {/* ============ MODAL: FORGOT PASSWORD ============ */}
      {showForgot && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
          <div
              className="modal-backdrop absolute inset-0 bg-[#2E3B42]/40 backdrop-blur-sm"
            onClick={() => setShowForgot(false)}
          />
          <div className="modal-panel relative glass w-full md:w-96 rounded-3xl p-6 z-10 border shadow-2xl" style={{ borderColor: 'var(--card-border)' }}>
            <div className="w-12 h-12 rounded-2xl bg-[#4A7A8C]/15 flex items-center justify-center mb-4 text-[#4A7A8C]">
              <i className="fa-solid fa-key text-lg" />
            </div>
            <h3 className="font-display font-bold text-lg mb-1 text-main">{t('resetTitle')}</h3>
            <p className="text-xs text-sub mb-4 leading-relaxed">{t('resetSub')}</p>
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
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="flex-1 field rounded-xl py-3 font-semibold text-xs md:text-sm scale-tap cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 text-[#F5F7F8] rounded-xl py-3 font-semibold text-xs md:text-sm scale-tap transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: '#4A7A8C' }}
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