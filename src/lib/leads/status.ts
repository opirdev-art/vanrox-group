export const LEAD_STATUSES = [
  'new',
  'contacted',
  'quoted',
  'converted',
  'lost',
  'spam',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export function isValidLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value)
}

export function formatStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'new':
      return 'bg-blue-500/10 text-blue-400'
    case 'contacted':
      return 'bg-purple-500/10 text-purple-400'
    case 'quoted':
      return 'bg-yellow-500/10 text-yellow-400'
    case 'converted':
      return 'bg-green/10 text-green'
    case 'lost':
      return 'bg-red-500/10 text-red-400'
    case 'spam':
      return 'bg-gray-500/10 text-gray-400'
    default:
      return 'bg-white/10 text-gray'
  }
}
