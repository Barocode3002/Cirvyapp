import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, X, Mail, Sparkles, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Forgot Password modal state
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotError, setForgotError] = useState(null)

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

    navigate('/feed')
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotError(null)
    setForgotLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      setForgotError(error.message)
      setForgotLoading(false)
      return
    }

    setForgotSent(true)
    setForgotLoading(false)
  }

  return (
    <div className="ambient-bg flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-500 items-center justify-center shadow-xl shadow-teal-500/25 mb-4 animate-scale-in">
            <span className="text-white text-2xl font-black">◉</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cirvy
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Private Social Space for Real Connections
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass-card rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl p-2 overflow-hidden">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to access your trusted friends feed
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-6">
              {error && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400 animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-xl bg-slate-50/80 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm px-3.5 py-2.5"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="rounded-xl bg-slate-50/80 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm px-3.5 py-2.5"
                />
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4 px-6 pt-2 pb-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-primary-gradient rounded-xl py-2.5 font-bold text-sm shadow-md"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                Don&apos;t have an account?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => { setShowForgot(false); setForgotSent(false); setForgotError(null); }}
          />

          <div className="relative w-full max-w-sm glass-card rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-white/10 animate-scale-in z-10">
            <button
              onClick={() => { setShowForgot(false); setForgotSent(false); setForgotError(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {forgotSent ? (
              <div className="text-center py-4 animate-fade-in">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 shadow-sm">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Check your inbox</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We sent a reset link to <strong>{forgotEmail}</strong>
                </p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Reset Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Enter your email address and we&apos;ll send you a password reset link.
                </p>

                {forgotError && (
                  <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-500 mb-3 animate-fade-in">
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="rounded-xl bg-slate-50/80 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
                  />
                  <Button type="submit" className="w-full btn-primary-gradient rounded-xl font-bold text-xs" disabled={forgotLoading}>
                    {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
