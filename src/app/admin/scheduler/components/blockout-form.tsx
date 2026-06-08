'use client'

import { useActionState } from 'react'
import { createBlockout } from '../actions'

const initialState = { ok: false as const, error: '' }

export function BlockoutForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createBlockout(formData)
      if (result.ok === false) {
        return { ok: false as const, error: result.error }
      }
      return { ok: true as const, error: '' }
    },
    initialState
  )

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Title</label>
        <input
          name="title"
          defaultValue="Unavailable"
          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-green outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Date</label>
        <input
          name="date"
          type="date"
          required
          min={today}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-green outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">From</label>
          <input
            name="start_time"
            type="time"
            defaultValue="08:00"
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-green outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">To</label>
          <input
            name="end_time"
            type="time"
            defaultValue="17:00"
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-green outline-none"
          />
        </div>
      </div>
      {state.error && <p className="text-red-400 text-sm">{state.error}</p>}
      {state.ok && <p className="text-green text-sm">Blockout saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-white/5 text-white border border-white/10 py-2.5 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:bg-white/10 transition disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Block out time'}
      </button>
    </form>
  )
}
