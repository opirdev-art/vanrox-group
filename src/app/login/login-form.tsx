'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signInAndVerifyAdmin } from './actions'
import { SignOutButton } from './sign-out-button'

type LoginFormProps = {
  flashMessage?: string | null
  showSignOut?: boolean
}

export function LoginForm({ flashMessage, showSignOut }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(flashMessage ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const next = searchParams.get('next') ?? '/admin'
    const result = await signInAndVerifyAdmin(email, password, next)

    if (result.ok === false) {
      setError(result.message)
      setLoading(false)
      router.refresh()
      return
    }

    router.push(result.redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md bg-navy-light border border-white/10 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="font-bebas text-4xl tracking-[4px] text-white">VANROX Admin</h1>
        <p className="text-gray text-sm mt-2">Sign in to manage leads and scheduling</p>
      </div>

      {error && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
            error.includes('signed out')
              ? 'border-green/30 bg-green/10 text-green'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
          role="alert"
        >
          {error}
        </div>
      )}

      {showSignOut && (
        <div className="mb-5">
          <p className="text-xs text-gray mb-3 text-center">
            You are signed in with a non-admin account.
          </p>
          <SignOutButton />
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-navy-light px-2 text-gray">or sign in again</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green text-navy font-barlow-condensed font-bold tracking-widest uppercase py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-gray text-sm mt-6">
        <Link href="/" className="text-green hover:underline">
          Back to website
        </Link>
      </p>
    </div>
  )
}
