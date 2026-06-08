import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Calendar, User } from 'lucide-react'
import { SiteLocationLink } from '../components/site-location-link'
import { getLeadById } from '@/lib/leads/queries'
import { formatLeadDate, formatPreferredSlot } from '@/lib/leads/format'
import { formatStatusLabel } from '@/lib/leads/status'
import { LeadStatusBadge } from '../components/lead-status-badge'
import { LeadStatusForm } from '../components/lead-status-form'

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lead = await getLeadById(id)

  if (!lead) {
    notFound()
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <header>
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-2 text-gray hover:text-green text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to leads
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-bebas text-4xl tracking-[3px] text-white">
              {lead.customer?.full_name ?? 'Lead'}
            </h1>
            <p className="text-gray font-light mt-1">
              {lead.service?.name ?? 'Service pending'} · Received {formatLeadDate(lead.created_at)}
            </p>
          </div>
          <LeadStatusBadge status={lead.status ?? 'new'} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-navy-light border border-white/5 rounded-xl p-6 space-y-5">
          <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white">
            Customer
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray">
              <User size={16} className="text-green/60 shrink-0" />
              <span className="text-white">{lead.customer?.full_name ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray">
              <Phone size={16} className="text-green/60 shrink-0" />
              <span>{lead.customer?.phone ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray">
              <Mail size={16} className="text-green/60 shrink-0" />
              <span>{lead.customer?.email ?? '—'}</span>
            </div>
            <div className="text-gray">
              <SiteLocationLink
                address={lead.site_location}
                coordinates={lead.site_coordinates}
              />
            </div>
          </div>
        </section>

        <section className="bg-navy-light border border-white/5 rounded-xl p-6 space-y-5">
          <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white">
            Request
          </h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[0.65rem] text-gray uppercase tracking-widest font-bold mb-1">Service</dt>
              <dd className="text-white">{lead.service?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] text-gray uppercase tracking-widest font-bold mb-1">Preferred visit</dt>
              <dd className="text-white flex items-center gap-2">
                <Calendar size={14} className="text-green/60" />
                {formatPreferredSlot(lead.preferred_start_time, lead.preferred_end_time)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] text-gray uppercase tracking-widest font-bold mb-1">Source</dt>
              <dd className="text-white capitalize">{lead.source ?? 'website'}</dd>
            </div>
            {lead.referral_partner && (
              <div>
                <dt className="text-[0.65rem] text-gray uppercase tracking-widest font-bold mb-1">Referral partner</dt>
                <dd className="text-white">
                  {lead.referral_partner.name} ({lead.referral_partner.referral_code})
                </dd>
              </div>
            )}
            <div>
              <dt className="text-[0.65rem] text-gray uppercase tracking-widest font-bold mb-1">Notes</dt>
              <dd className="text-gray whitespace-pre-wrap">{lead.inquiry_details ?? '—'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="bg-navy-light border border-white/5 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] text-gray uppercase tracking-widest font-bold mb-2">Update status</p>
          <p className="text-gray text-sm">
            Current: {formatStatusLabel(lead.status ?? 'new')}
          </p>
        </div>
        <LeadStatusForm leadId={lead.id} currentStatus={lead.status ?? 'new'} />
      </section>

      {lead.preferred_start_time && lead.preferred_end_time && lead.status !== 'converted' && (
        <section className="bg-green/5 border border-green/20 rounded-xl p-6">
          <p className="text-white font-medium mb-2">Ready to confirm?</p>
          <p className="text-gray text-sm mb-4">
            Schedule this visit in the calendar once you have confirmed availability with the customer.
          </p>
          <Link
            href={`/admin/scheduler?lead=${lead.id}`}
            className="inline-block bg-green text-navy px-5 py-2.5 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:opacity-90 transition"
          >
            Open scheduler
          </Link>
        </section>
      )}
    </div>
  )
}
