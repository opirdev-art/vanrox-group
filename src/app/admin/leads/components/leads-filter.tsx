import Link from 'next/link'
import { LEAD_STATUSES, formatStatusLabel } from '@/lib/leads/status'

export function LeadsFilter({ active }: { active: string }) {
  const filters = [{ value: 'all', label: 'All' }, ...LEAD_STATUSES.map((s) => ({ value: s, label: formatStatusLabel(s) }))]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Link
          key={filter.value}
          href={filter.value === 'all' ? '/admin/leads' : `/admin/leads?status=${filter.value}`}
          className={`inline-flex items-center min-h-11 text-[0.65rem] px-4 rounded-full font-bold tracking-widest uppercase border transition-all ${
            active === filter.value
              ? 'bg-green/10 border-green text-green'
              : 'border-white/10 text-gray hover:border-white/20 hover:text-white'
          }`}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  )
}
