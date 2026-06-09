'use client'

import { useActionState } from 'react'
import { changePassword, revokeOtherSessions } from '../actions'

const passwordInitialState = { ok: false as const, error: '' }
const sessionsInitialState = { ok: false as const, error: '' }

type SecuritySettingsPanelProps = {
  sessionExpiresAt: string | null
}

export function SecuritySettingsPanel({ sessionExpiresAt }: SecuritySettingsPanelProps) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (_prev: typeof passwordInitialState, formData: FormData) => {
      const result = await changePassword(formData)
      if (result.ok === false) {
        return { ok: false as const, error: result.error }
      }
      return { ok: true as const, error: '' }
    },
    passwordInitialState
  )

  const [sessionsState, sessionsAction, sessionsPending] = useActionState(
    async (_prev: typeof sessionsInitialState) => {
      const result = await revokeOtherSessions()
      if (result.ok === false) {
        return { ok: false as const, error: result.error }
      }
      return { ok: true as const, error: '' }
    },
    sessionsInitialState
  )

  return (
    <div className="space-y-6">
      <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
        <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white border-b border-white/5 pb-4">
          Change Password
        </h2>
        <form action={passwordAction} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
              Current Password
            </label>
            <input
              name="current_password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
              New Password
            </label>
            <input
              name="new_password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
              Confirm New Password
            </label>
            <input
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm"
            />
          </div>

          <p className="text-gray text-xs font-light">
            Use at least 8 characters with letters and numbers.
          </p>

          {passwordState.error && <p className="text-red-400 text-sm">{passwordState.error}</p>}
          {passwordState.ok && (
            <p className="text-green text-sm">Password updated successfully.</p>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:bg-green/80 transition-all disabled:opacity-50"
          >
            {passwordPending ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </section>

      <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
        <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white border-b border-white/5 pb-4">
          Active Sessions
        </h2>
        <div className="space-y-4 max-w-lg">
          <p className="text-gray text-sm font-light leading-relaxed">
            Sign out all other browsers and devices. Your current session will stay active.
          </p>

          {sessionExpiresAt && (
            <p className="text-gray text-xs">
              Current session expires:{' '}
              <span className="text-white">{new Date(sessionExpiresAt).toLocaleString()}</span>
            </p>
          )}

          {sessionsState.error && <p className="text-red-400 text-sm">{sessionsState.error}</p>}
          {sessionsState.ok && (
            <p className="text-green text-sm">Other sessions have been signed out.</p>
          )}

          <form action={sessionsAction}>
            <button
              type="submit"
              disabled={sessionsPending}
              className="bg-white/5 text-white border border-white/10 px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:bg-white/10 transition disabled:opacity-50"
            >
              {sessionsPending ? 'Signing out…' : 'Sign Out Other Sessions'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
