'use client'

import { useActionState } from 'react'
import { confirmAppointmentFromLead } from '../actions'

export function ConfirmLeadPanel({
  leadId,
  title,
  startTime,
  endTime,
}: {
  leadId: string
  title: string
  startTime: string
  endTime: string
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { ok: boolean; error: string }, formData: FormData) => {
      const result = await confirmAppointmentFromLead(formData)
      if (result.ok === false) return { ok: false, error: result.error }
      return { ok: true, error: '' }
    },
    { ok: false, error: '' }
  )

  const startLocal = toDatetimeLocalValue(startTime)
  const endLocal = toDatetimeLocalValue(endTime)

  return (
    <section className="bg-green/5 border border-green/20 rounded-xl p-6 space-y-4">
      <h3 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white">
        Confirm appointment from lead
      </h3>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="lead_id" value={leadId} />
        <div className="space-y-2">
          <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Title</label>
          <input
            name="title"
            defaultValue={title}
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-green outline-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Start</label>
            <input
              name="start_time"
              type="datetime-local"
              defaultValue={startLocal}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-green outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">End</label>
            <input
              name="end_time"
              type="datetime-local"
              defaultValue={endLocal}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-green outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-gray">
          Times are stored in UTC. Confirming will mark the lead as converted.
        </p>
        {state.error && <p className="text-red-400 text-sm">{state.error}</p>}
        {state.ok && <p className="text-green text-sm">Appointment confirmed.</p>}
        <button
          type="submit"
          disabled={pending}
          className="bg-green text-navy px-5 py-2.5 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? 'Confirming…' : 'Confirm appointment'}
        </button>
      </form>
    </section>
  )
}

function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
