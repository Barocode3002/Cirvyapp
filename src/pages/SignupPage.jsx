// src/pages/SignupPage.jsx
// Create Private Account page featuring the official Cirvy brand palette and security.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { supabase } from '@/lib/supabase'
import CirvyLogo from '@/components/CirvyLogo'

export default function SignupPage() {
  const { signUp } = useAuth()
  const { t, showToast, lang, toggleLang, dark, toggleTheme } = useUI()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const cleanUsername = form.username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (cleanUsername.length < 3) {
      setError(t('handleValidation') || 'Username must be at least 3 characters.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await signUp({
      ...form,
      username: cleanUsername,
      displayName: form.displayName.trim(),
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data?.session) {
      showToast(t('signupSuccess'))
      navigate('/feed')
    } else {
      setConfirmEmail(true)
    }
    setLoading(false)
  }

  const handleOAuth = async (provider) => {
    const { error: oError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/feed`,
      },
    })
    if (oError) showToast(oError.message)
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
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl field flex items-center justify-center scale-tap hover:border-[#4A7A8C] cursor-pointer text-sub hover:text-main"
            title="Toggle Theme"
          >
            <i className={`fa-solid ${dark ? 'fa-moon' : 'fa-sun'} text-sm`} />
          </button>
        </div>
      </header>

      {/* Main Container */}
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

        <div className="glass rounded-3xl p-6 shadow-xl border" style={{ borderColor: 'var(--card-border)' }}>
          {/* Tab Switcher */}
          <div className="flex mb-6 rounded-2xl p-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all text-sub hover:text-main scale-tap"
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => {}}
              className="flex-1 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-sm text-white"
              style={{ backgroundColor: '#4A7A8C' }}
            >
              {t('signUp')}
            </button>
          </div>

          {confirmEmail ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#8FBC94]/20 flex items-center justify-center mx-auto text-2xl text-[#8FBC94]">
                <i className="fa-solid fa-envelope-circle-check" />
              </div>
              <h3 className="font-display font-bold text-lg text-main">Check your inbox</h3>
              <p className="text-xs text-sub max-w-xs mx-auto leading-relaxed">
                We sent a confirmation link to <strong className="text-main">{form.email}</strong>. Click it to activate your private account.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="text-white px-6 py-3 rounded-xl text-xs md:text-sm font-semibold scale-tap mt-2 shadow-md"
                style={{ backgroundColor: '#4A7A8C' }}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500 font-medium flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Signup Form */}
              <form id="signupForm" className="space-y-3.5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-main mb-1">{t('fullName')}</label>
                  <div className="relative">
                    <i className="fa-regular fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-sub text-xs rtl:left-auto rtl:right-3.5" />
                    <input
                      id="signup-displayname"
                      name="displayName"
                      type="text"
                      required
                      value={form.displayName}
                      onChange={handleChange}
                      className="field w-full rounded-xl pl-9 pr-4 py-2.5 text-sm rtl:pl-4 rtl:pr-9"
                      placeholder="Adham Ali"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-main mb-1">{t('username')}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sub text-xs font-mono font-bold rtl:left-auto rtl:right-3.5">@</span>
                    <input
                      id="signup-username"
                      name="username"
                      type="text"
                      required
                      value={form.username}
                      onChange={handleChange}
                      className="field w-full rounded-xl pl-9 pr-4 py-2.5 text-sm rtl:pl-4 rtl:pr-9 font-mono"
                      placeholder="adham"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-main mb-1">{t('email')}</label>
                  <div className="relative">
                    <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-sub text-xs rtl:left-auto rtl:right-3.5" />
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="field w-full rounded-xl pl-9 pr-4 py-2.5 text-sm rtl:pl-4 rtl:pr-9"
                      placeholder="adham@cirvy.app"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-main mb-1">{t('password')}</label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-sub text-xs rtl:left-auto rtl:right-3.5" />
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={handleChange}
                      className="field w-full rounded-xl pl-9 pr-4 py-2.5 text-sm rtl:pl-4 rtl:pr-9"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white rounded-xl py-3.5 font-semibold text-sm scale-tap transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  style={{ backgroundColor: '#4A7A8C' }}
                >
                  {loading && <i className="fa-solid fa-circle-notch fa-spin text-sm" />}
                  <span>{t('createAccount')}</span>
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
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-sub mt-5 flex items-center justify-center gap-1.5 max-w-xs mx-auto leading-relaxed">
          <i className="fa-solid fa-shield-halved text-[11px] text-[#8FBC94]" />
          <span>{t('authFooter')}</span>
        </p>
      </main>
    </div>
  )
}
