'use client'

import { useActionState } from 'react'
import { completeInviteSetup } from '../actions'

const initialState = { ok: false as const, error: '' }

export function WelcomeSetupForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await completeInviteSetup(formData)
      if (result.ok === false) {
        return { ok: false as const, error: result.error }
      }
      return { ok: true as const, error: '' }
    },
    initialState
  )

  return (
    <form action={formAction} className="space-y-4">
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
          Confirm Password
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

      {state.error && <p className="text-red-400 text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:bg-green/80 transition-all disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Activate Account'}
      </button>
    </form>
  )
}
