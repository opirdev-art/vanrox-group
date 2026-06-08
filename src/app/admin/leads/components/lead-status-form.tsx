'use client'

import { useTransition } from 'react'
import { LEAD_STATUSES, formatStatusLabel } from '@/lib/leads/status'
import { updateLeadStatus } from '../actions'

export function LeadStatusForm({
  leadId,
  currentStatus,
}: {
  leadId: string
  currentStatus: string
}) {
  const [pending, startTransition] = useTransition()

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const status = event.target.value
    startTransition(async () => {
      await updateLeadStatus(leadId, status)
    })
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={pending}
      className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-green outline-none disabled:opacity-50"
    >
      {LEAD_STATUSES.map((status) => (
        <option key={status} value={status} className="bg-navy text-white">
          {formatStatusLabel(status)}
        </option>
      ))}
    </select>
  )
}
