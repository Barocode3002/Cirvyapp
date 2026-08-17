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
import { UserPlus, Loader2 } from 'lucide-react'

// --------------------------------------------------------------------------
// SignupPage — collects email, password, username, and display name.
//
// Flow:
//  1. User fills the form → hits "Create Account"
//  2. signUp() (from AuthContext) calls supabase.auth.signUp + profiles.upsert
//  3. If Supabase requires email confirmation (default), we show a message.
//     If confirmations are disabled in the dashboard, the user is signed in
//     immediately and we navigate to /feed.
// --------------------------------------------------------------------------

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

    // Supabase returns a session only when email confirmation is disabled.
    // If session is null, it means the user needs to confirm their email.
    if (data?.session) {
      navigate('/feed')
    } else {
      setConfirmEmail(true)
    }
    setLoading(false)
  }

  if (confirmEmail) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              ✓
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to <strong>{form.email}</strong>.
              Click it to activate your Cirvy account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:underline">
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UserPlus className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl">Create your Cirvy account</CardTitle>
          <CardDescription>
            A private space for you and your closest friends.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-username">Username</Label>
              <Input
                id="signup-username"
                name="username"
                type="text"
                placeholder="coolname42"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
              <p className="text-xs text-muted-foreground">
                Visible to everyone — choose wisely!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-displayname">Display Name</Label>
              <Input
                id="signup-displayname"
                name="displayName"
                type="text"
                placeholder="Your Name"
                value={form.displayName}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
