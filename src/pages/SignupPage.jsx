import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
import { Loader2, Check, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const { signUp } = useAuth()
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
      navigate('/feed')
    } else {
      setConfirmEmail(true)
    }
    setLoading(false)
  }

  const getPasswordStrength = () => {
    const pw = form.password
    if (!pw) return { level: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' }
    if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' }
    if (score <= 3) return { level: 3, label: 'Good', color: '#0d9488' }
    return { level: 4, label: 'Strong', color: '#10b981' }
  }

  const pwStrength = getPasswordStrength()

  if (confirmEmail) {
    return (
      <div className="ambient-bg flex min-h-svh items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="glass-card rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-500 shadow-md">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Check your inbox
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              We sent a verification link to <strong>{form.email}</strong>. Click it to activate your Cirvy account.
            </CardDescription>
            <CardFooter className="justify-center p-0">
              <Link to="/login" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
                Back to Sign In
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
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
            Create Account
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Join your private friends-only network
          </p>
        </div>

        {/* Form Card */}
        <Card className="glass-card rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl p-2 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
              Get Started with Cirvy
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Your profile is private by default
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3.5 px-6">
              {error && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400 animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="rounded-xl bg-slate-50/80 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="rounded-xl bg-slate-50/80 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
                />
                {form.password && (
                  <div className="animate-fade-in pt-1">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background: i <= pwStrength.level ? pwStrength.color : 'rgba(148, 163, 184, 0.2)',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] font-semibold mt-1" style={{ color: pwStrength.color }}>
                      Password strength: {pwStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-username" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Username
                  </Label>
                  <Input
                    id="signup-username"
                    name="username"
                    type="text"
                    placeholder="alex_99"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    className="rounded-xl bg-slate-50/80 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-displayname" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Display Name
                  </Label>
                  <Input
                    id="signup-displayname"
                    name="displayName"
                    type="text"
                    placeholder="Alex Morgan"
                    value={form.displayName}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="rounded-xl bg-slate-50/80 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4 px-6 pt-3 pb-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-primary-gradient rounded-xl py-2.5 font-bold text-sm shadow-md"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
