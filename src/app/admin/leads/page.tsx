import Link from 'next/link'
import { Mail, Phone, MapPin, Calendar } from 'lucide-react'
import { getLeadsList } from '@/lib/leads/queries'
import { formatLeadDate, formatPreferredSlot } from '@/lib/leads/format'
import { LeadStatusBadge } from './components/lead-status-badge'
import { LeadsFilter } from './components/leads-filter'

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusFilter } = await searchParams
  const activeFilter = statusFilter ?? 'all'

  let leads: Awaited<ReturnType<typeof getLeadsList>> = []
  let fetchError: string | null = null

  try {
    leads = await getLeadsList(activeFilter === 'all' ? undefined : activeFilter)
  } catch (error) {
    fetchError = error instanceof Error ? error.message : 'Failed to load leads'
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white">Leads & Quote Requests</h1>
        <p className="text-gray font-light mt-1">Manage incoming requests and track customer conversions.</p>
      </header>

      <LeadsFilter active={activeFilter} />

      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-sm">
          {fetchError}
        </div>
      )}

      <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden shadow-lg">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-gray">
            <p className="font-barlow-condensed tracking-widest uppercase">No leads yet</p>
            <p className="text-sm mt-2 font-light">
              Incoming booking requests will appear here once the public scheduler is live.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[0.7rem] text-gray uppercase tracking-widest font-bold bg-white/[0.02]">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Service & Location</th>
                  <th className="px-6 py-4">Preferred Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Received</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-6">
                      <div className="font-medium text-white mb-1">
                        {lead.customer?.full_name ?? 'Unknown'}
                      </div>
                      <div className="flex flex-col gap-1">
                        {lead.customer?.email && (
                          <div className="flex items-center gap-2 text-[0.7rem] text-gray uppercase tracking-tighter">
                            <Mail size={12} className="text-green/60" /> {lead.customer.email}
                          </div>
                        )}
                        {lead.customer?.phone && (
                          <div className="flex items-center gap-2 text-[0.7rem] text-gray uppercase tracking-tighter">
                            <Phone size={12} className="text-green/60" /> {lead.customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-white text-sm font-medium mb-1">
                        {lead.service?.name ?? 'Unspecified'}
                      </div>
                      {lead.site_location && (
                        <div className="flex items-center gap-1.5 text-[0.7rem] text-gray uppercase tracking-tighter">
                          <MapPin size={12} className="text-green/60" /> {lead.site_location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 text-gray text-xs font-light">
                      {formatPreferredSlot(lead.preferred_start_time, lead.preferred_end_time)}
                    </td>
                    <td className="px-6 py-6">
                      <LeadStatusBadge status={lead.status ?? 'new'} />
                    </td>
                    <td className="px-6 py-6 text-gray text-xs font-light">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-green/40" />
                        {formatLeadDate(lead.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-[0.7rem] text-white bg-white/5 px-3 py-1.5 rounded hover:bg-white/10 transition-all font-bold tracking-widest uppercase inline-block"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
