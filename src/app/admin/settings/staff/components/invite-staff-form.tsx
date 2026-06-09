'use client'

import { useActionState } from 'react'
import { STAFF_ROLE_OPTIONS } from '@/lib/auth/staff-roles'
import { inviteStaffMember } from '../actions'

const initialState = { ok: false as const, error: '' }

export function InviteStaffForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await inviteStaffMember(formData)
      if (result.ok === false) {
        return { ok: false as const, error: result.error }
      }
      return { ok: true as const, error: '' }
    },
    initialState
  )

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
            Full Name
          </label>
          <input
            name="full_name"
            required
            className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
            Role
          </label>
          <select
            name="role"
            defaultValue="staff"
            className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm"
          >
            {STAFF_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-navy">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <p className="text-red-400 text-sm">{state.error}</p>}
      {state.ok && <p className="text-green text-sm">Invite sent successfully.</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:bg-green/80 transition-all disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send Invite'}
      </button>
    </form>
  )
}
