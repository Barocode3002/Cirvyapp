// src/pages/SignupPage.jsx
// Create Private Account page matching the HTML design, wired to Supabase auth.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { supabase } from '@/lib/supabase'

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

    const { data, error: signUpError } = await signUp(form)

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

      {/* Main Container */}
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
              onClick={() => navigate('/login')}
              className="flex-1 py-2 rounded-full text-sm font-semibold transition text-sub scale-tap"
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => {}}
              className="flex-1 py-2 rounded-full text-sm font-semibold transition accent-bg text-white"
            >
              {t('signUp')}
            </button>
          </div>

          {confirmEmail ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full accent-soft-bg flex items-center justify-center mx-auto text-lg accent-text">
                <i className="fa-solid fa-envelope-circle-check" />
              </div>
              <h3 className="font-display font-bold text-lg">Check your inbox</h3>
              <p className="text-xs text-sub max-w-xs mx-auto">
                We sent a confirmation link to <strong>{form.email}</strong>. Click it
                to activate your private account.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="accent-bg text-white px-5 py-2.5 rounded-xl text-xs font-semibold scale-tap mt-2"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500 font-medium">
                  {error}
                </div>
              )}

              {/* Signup Form */}
              <form id="signupForm" className="space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label className="text-xs font-medium text-sub">{t('fullName')}</label>
                  <input
                    id="signup-displayname"
                    name="displayName"
                    type="text"
                    required
                    value={form.displayName}
                    onChange={handleChange}
                    className="field w-full rounded-xl px-4 py-3 mt-1 text-sm"
                    placeholder="Adham Ali"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-sub">{t('username')}</label>
                  <input
                    id="signup-username"
                    name="username"
                    type="text"
                    required
                    value={form.username}
                    onChange={handleChange}
                    className="field w-full rounded-xl px-4 py-3 mt-1 text-sm"
                    placeholder="@adham"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-sub">{t('email')}</label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="field w-full rounded-xl px-4 py-3 mt-1 text-sm"
                    placeholder="adham@cirvy.app"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-sub">{t('password')}</label>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    className="field w-full rounded-xl px-4 py-3 mt-1 text-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full accent-bg text-white rounded-xl py-3 font-semibold text-sm scale-tap transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading && <i className="fa-solid fa-circle-notch fa-spin text-sm" />}
                  <span>{t('createAccount')}</span>
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
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-sub mt-5 flex items-center justify-center gap-1.5">
          <i className="fa-solid fa-lock text-[10px]" />
          <span>{t('authFooter')}</span>
        </p>
      </main>
    </div>
  )
}
