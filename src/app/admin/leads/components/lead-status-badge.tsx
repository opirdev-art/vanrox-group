import { CheckCircle2, Clock } from 'lucide-react'
import { formatStatusLabel, getStatusBadgeClass } from '@/lib/leads/status'

export function LeadStatusBadge({ status }: { status: string }) {
  const label = formatStatusLabel(status ?? 'new')

  return (
    <span
      className={`text-[0.65rem] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase flex items-center gap-1.5 w-fit ${getStatusBadgeClass(status ?? 'new')}`}
    >
      {status === 'new' && <Clock size={12} />}
      {status === 'converted' && <CheckCircle2 size={12} />}
      {label}
    </span>
  )
}
