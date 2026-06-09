'use client'

import { useActionState } from 'react'
import type { BusinessSettingsRecord } from '@/lib/settings/queries'
import { saveBusinessSettings } from '../actions'

type BusinessSettingsFormProps = {
  settings: BusinessSettingsRecord
}

const initialState = { ok: false as const, error: '' }

export function BusinessSettingsForm({ settings }: BusinessSettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await saveBusinessSettings(formData)
      if (result.ok === false) {
        return { ok: false as const, error: result.error }
      }
      return { ok: true as const, error: '' }
    },
    initialState
  )

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
            Business Name
          </label>
          <input
            name="business_name"
            type="text"
            defaultValue={settings.businessName}
            className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
            Business Phone
          </label>
          <input
            name="phone"
            type="text"
            defaultValue={settings.phone}
            className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
            Business Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={settings.email}
            className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
            Address
          </label>
          <textarea
            name="address"
            defaultValue={settings.address}
            className="w-full bg-navy border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white text-sm h-24"
          />
        </div>
      </div>

      {state.error && <p className="text-red-400 text-sm">{state.error}</p>}
      {state.ok && <p className="text-green text-sm">Business settings saved.</p>}

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-green text-navy px-8 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase hover:bg-green/80 transition-all disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
